import { NextRequest, NextResponse } from "next/server";
import { clientIp, createAsyncRateLimiter, isAllowedOrigin } from "@/lib/api-guard";
import { DOWN_CHECK_HOSTS } from "@/lib/down-check/catalog";

// Probing ~108 hosts at concurrency 8 with a 3s cap per host needs headroom:
// observed cold starts on this route run ~25s, so 30s could kill a batch
// mid-flight (cron and convert-notebook already run at 60 on this account).
export const maxDuration = 60;

const TIMEOUT_MS = 3_000;
/** Max hosts per request — the client chunks its batches to match. */
export const MAX_HOSTS = 32;
const CONCURRENCY = 8;

// Sliding-window rate limiter: 30 req/min per IP. A full catalog check is
// ceil(108/32) = 4 requests, so ~7 complete checks per minute are allowed.
// In-memory — per warm instance. Adequate for serverless abuse prevention.
const isRateLimited = createAsyncRateLimiter("down-check", 30);

export type ProbeState = "up" | "degraded" | "down";

export interface ProbeResult {
  host: string;
  /**
   * up       — the host answered with 1xx–4xx (403/405 are common for
   *            datacenter HEAD requests and still prove the site serves).
   * degraded — the host answered with 5xx (reachable but erroring).
   * down     — no response at all: timeout, DNS failure, refused connection.
   */
  state: ProbeState;
  status: number | null;
  ms: number;
}

/**
 * HEAD-probe one allowlisted host.
 *
 * `redirect: "manual"`: a 3xx still proves the host is serving, and refusing
 * to follow hops keeps every request inside the exact-hostname allowlist —
 * a redirect to an internal address can never turn this into an SSRF probe.
 */
async function probe(host: string): Promise<ProbeResult> {
  const started = performance.now();
  try {
    const res = await fetch(`https://${host}/`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; DevBench-DownDetector/1.0)",
        Accept: "*/*",
      },
    });
    const ms = Math.round(performance.now() - started);
    const state: ProbeState = res.status >= 500 ? "degraded" : "up";
    return { host, state, status: res.status, ms };
  } catch {
    // Abort, DNS failure, TLS error and connection-refused are indistinguishable
    // to a fetch caller — all mean "unreachable from here".
    return { host, state: "down", status: null, ms: Math.round(performance.now() - started) };
  }
}

/** Run probes with a fixed worker pool so one batch never floods the target. */
async function probeAll(hosts: string[]): Promise<ProbeResult[]> {
  const results: ProbeResult[] = new Array(hosts.length);
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= hosts.length) return;
      results[i] = await probe(hosts[i]);
    }
  }
  const workers = Math.min(CONCURRENCY, hosts.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  return results;
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!isAllowedOrigin(origin)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  if (await isRateLimited(clientIp(req))) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 30 requests per minute." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const hosts = (body as { hosts?: unknown } | null)?.hosts;
  if (!Array.isArray(hosts) || hosts.length === 0) {
    return NextResponse.json({ error: "\"hosts\" must be a non-empty array." }, { status: 400 });
  }
  if (hosts.length > MAX_HOSTS) {
    return NextResponse.json(
      { error: `Too many hosts. Max ${MAX_HOSTS} per request.` },
      { status: 400 },
    );
  }
  for (const h of hosts) {
    // Exact-match allowlist: anything not in the shared catalog is rejected
    // before a single outbound request is made (the SSRF guarantee).
    if (typeof h !== "string" || !DOWN_CHECK_HOSTS.has(h)) {
      return NextResponse.json({ error: "Unknown host." }, { status: 403 });
    }
  }

  const unique = [...new Set(hosts as string[])];
  const results = await probeAll(unique);
  return NextResponse.json({ results });
                               }
