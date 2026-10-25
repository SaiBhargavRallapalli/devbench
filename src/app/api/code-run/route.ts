import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, createRateLimiter, isAllowedOrigin } from "@/lib/api-guard";
import { logger } from "@/lib/logger";
import { normalizeWandboxResponse, parseRuntimes } from "@/lib/code-runner";

// Vercel: upstream gets 24s (long C++/Java/Rust builds on a cold queue) and
// the function needs headroom on top of that.
export const maxDuration = 30;

const MAX_CODE_CHARS = 100_000;
const MAX_STDIN_CHARS = 50_000;
const TIMEOUT_MS = 24_000;
const isRateLimited = createRateLimiter(10);

// Verified 2026-10: Wandbox's public API (free, no key). `compile.json`
// answers HTTP 200 for program failures and 500 + plain text for bad input
// (e.g. unknown compiler), so error paths must not assume JSON bodies.
const LIST_URL = "https://wandbox.org/api/list.json";
const COMPILE_URL = "https://wandbox.org/api/compile.json";
const USER_AGENT = "DevBench/1.0 (+https://www.devbench.co.in)";
// Wandbox compiler ids look like `cpython-3.13.8`, `openjdk-jdk-21+35`.
const COMPILER_ID_RE = /^[\w.+-]{1,60}$/;

const ExecuteSchema = z
  .object({
    language: z
      .string()
      .min(1, "Missing `language` string")
      .max(60, "`language` exceeds size limit"),
    version: z
      .string()
      .min(1, "Missing `version` string")
      .max(60, "`version` exceeds size limit")
      .regex(COMPILER_ID_RE, "`version` must be a compiler id (e.g. cpython-3.13.8)"),
    code: z.string().max(MAX_CODE_CHARS, "Code exceeds size limit").optional(),
    files: z
      .array(
        z.object({
          content: z.string().max(MAX_CODE_CHARS, "Code exceeds size limit"),
        }),
      )
      .max(20)
      .optional(),
    stdin: z.string().max(MAX_STDIN_CHARS, "stdin exceeds size limit").optional(),
  })
  .refine((d) => sourceLength(d) > 0, { message: "Missing `code` string" })
  .refine((d) => sourceLength(d) <= MAX_CODE_CHARS, {
    message: "Code exceeds size limit",
  });

function sourceLength(data: { code?: string; files?: Array<{ content: string }> }): number {
  return (
    (data.code?.length ?? 0) +
    (data.files ?? []).reduce((total, file) => total + file.content.length, 0)
  );
}

function isAbortError(e: unknown): boolean {
  if (e instanceof Error && e.name === "AbortError") return true;
  const msg = e instanceof Error ? e.message : "";
  return /abort/i.test(msg);
}

/**
 * Extract a short, user-displayable detail from a failed upstream body.
 * Wandbox returns plain text (`Error: Unknown compiler`) or JSON
 * (`{message}`) depending on the failure — accept both, cap at 300 chars.
 */
async function upstreamErrorDetail(upstream: Response): Promise<string> {
  let body = "";
  try {
    body = await upstream.text();
  } catch {
    /* body unreadable — fall through */
  }
  const trimmed = body.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed) as { message?: unknown; error?: unknown };
    const detail =
      typeof parsed?.message === "string"
        ? parsed.message
        : typeof parsed?.error === "string"
          ? parsed.error
          : "";
    if (detail.trim()) return detail.trim().slice(0, 300);
  } catch {
    /* plain-text body — use it as-is */
  }
  return trimmed.slice(0, 300);
}

/**
 * Proxies code execution to Wandbox's public compiler cloud
 * (https://wandbox.org/api). No API key required; we normalize its response
 * so the UI never parses upstream shapes directly.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 runs per minute." },
      { status: 429 },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ExecuteSchema.safeParse(raw);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { language, version, stdin } = parsed.data;
  // Wandbox compiles a single source file; join multi-file submissions.
  const files = parsed.data.files ?? [];
  const source =
    files.length > 0
      ? files.map((file) => file.content).join("\n\n")
      : (parsed.data.code ?? "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(COMPILE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({
        compiler: version,
        code: source,
        ...(stdin ? { stdin } : {}),
      }),
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(timer);
    if (isAbortError(e)) {
      logger.warn("/api/code-run", "Upstream timed out");
      return NextResponse.json({ error: "Code execution timed out." }, { status: 504 });
    }
    const msg = e instanceof Error ? e.message : "Upstream request failed";
    logger.error("/api/code-run", "Upstream fetch failed", { error: msg });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
  clearTimeout(timer);

  if (!upstream.ok) {
    // e.g. 500 + plain text "Error: Unknown compiler" — surface the detail.
    const detail = await upstreamErrorDetail(upstream);
    logger.warn("/api/code-run", "Upstream returned non-OK", { status: upstream.status });
    return NextResponse.json(
      { error: detail || `Execution service returned ${upstream.status}` },
      { status: 502 },
    );
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    logger.error("/api/code-run", "Failed to parse upstream JSON");
    return NextResponse.json(
      { error: "Invalid response from the execution service." },
      { status: 502 },
    );
  }

  return NextResponse.json(
    normalizeWandboxResponse(data, { language, version }),
  );
}

/**
 * GET returns the compiler catalog so the client can build the language
 * picker without hardcoding ids. Cached at the CDN for 6h.
 */
export async function GET() {
  let upstream: Response;
  try {
    upstream = await fetch(LIST_URL, {
      headers: { "User-Agent": USER_AGENT },
      cache: "no-store",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upstream request failed";
    logger.error("/api/code-run", "Runtimes fetch failed", { error: msg });
    return NextResponse.json(
      { error: "Couldn't fetch the language list right now. Try again shortly." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    logger.warn("/api/code-run", "Runtimes upstream returned non-OK", {
      status: upstream.status,
    });
    return NextResponse.json(
      { error: "Couldn't fetch the language list right now. Try again shortly." },
      { status: 502 },
    );
  }

  let data: unknown;
  try {
    data = await upstream.json();
  } catch {
    logger.error("/api/code-run", "Failed to parse runtimes JSON");
    return NextResponse.json(
      { error: "Couldn't read the language list. Try again shortly." },
      { status: 502 },
    );
  }

  const runtimes = parseRuntimes(data);
  if (runtimes.length === 0) {
    logger.warn("/api/code-run", "Runtimes list came back empty");
    return NextResponse.json(
      { error: "The language list came back empty. Try again shortly." },
      { status: 502 },
    );
  }

  return NextResponse.json(runtimes, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
