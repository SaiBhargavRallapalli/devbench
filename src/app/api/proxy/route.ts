import { NextRequest, NextResponse } from "next/server";
import { ProxyRequestSchema, isBlockedHost } from "./validation";
import { logger } from "@/lib/logger";

const MAX_BODY_SIZE = 5 * 1024 * 1024; // 5 MB
const TIMEOUT_MS = 30_000;

// Sliding-window rate limiter: 20 req/min per IP.
// In-memory — per warm instance. Adequate for serverless abuse prevention.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS,
  );
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 20 requests per minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ProxyRequestSchema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const { url, method, headers, payload } = parsed.data;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL." }, { status: 400 });
  }

  if (isBlockedHost(parsedUrl.hostname)) {
    return NextResponse.json(
      { error: "Requests to private/internal addresses are not allowed." },
      { status: 403 },
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const startTime = performance.now();

    const fetchOpts: RequestInit = {
      method: method.toUpperCase(),
      headers: headers ?? {},
      signal: controller.signal,
      redirect: "follow",
    };

    if (payload && !["GET", "HEAD"].includes(method.toUpperCase())) {
      fetchOpts.body = payload;
    }

    const response = await fetch(url, fetchOpts);
    const elapsed = Math.round(performance.now() - startTime);
    clearTimeout(timer);

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((v, k) => {
      responseHeaders[k] = v;
    });

    const contentType = response.headers.get("content-type") || "";
    let responseBody: string;
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength > MAX_BODY_SIZE) {
      responseBody = `[Response too large: ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB — truncated]`;
    } else {
      responseBody = new TextDecoder().decode(buffer);
    }

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      contentType,
      time: elapsed,
      size: buffer.byteLength,
      redirected: response.redirected,
      finalUrl: response.url,
    });
  } catch (err) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("abort")) {
      logger.warn("/api/proxy", "Request timed out", { url, method });
      return NextResponse.json({ error: "Request timed out (30s limit)." }, { status: 504 });
    }
    logger.error("/api/proxy", "Fetch failed", { url, method, error: msg });
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
