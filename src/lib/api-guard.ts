import type { NextRequest } from "next/server";

/**
 * Browser Origin allowlist for DevBench API routes.
 * In production, a missing Origin is rejected (rejects browser requests without an approved Origin, not authentication).
 * In development/test, null Origin is allowed for local tooling.
 */
const ALLOWED_ORIGIN_RE =
  /^https:\/\/(www\.devbench\.co\.in|devbench\.co\.in|[a-z0-9-]+\.devbench\.co\.in)$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export function isAllowedOrigin(origin: string | null): boolean {
  if (origin === null) {
    return process.env.NODE_ENV !== "production";
  }
  return ALLOWED_ORIGIN_RE.test(origin);
}

export function clientIpFromHeaders(headers: Headers): string {
  const vercel = headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercel) return vercel;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export function clientIp(req: NextRequest | Request): string {
  return clientIpFromHeaders(req.headers);
}

/** Sliding-window rate limiter (in-memory, per warm instance). */
export function createRateLimiter(limit: number, windowMs = 60_000) {
  const rateLimitMap = new Map<string, number[]>();
  let lastSweep = 0;

  return function isRateLimited(ip: string): boolean {
    const now = Date.now();
    if (now - lastSweep > windowMs) {
      for (const [key, hits] of rateLimitMap) {
        if (!hits.some((t) => now - t < windowMs)) rateLimitMap.delete(key);
      }
      lastSweep = now;
    }
    if (!rateLimitMap.has(ip) && rateLimitMap.size >= 10000) {
      const oldest = rateLimitMap.keys().next().value;
      if (oldest !== undefined) rateLimitMap.delete(oldest);
    }
    const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (timestamps.length >= limit) return true;
    timestamps.push(now);
    rateLimitMap.set(ip, timestamps);
    return false;
  };
}

/**
 * Rate limiter that is GLOBAL when an Upstash Redis REST store is configured
 * (UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars) and falls back
 * to the per-instance in-memory limiter otherwise. The in-memory fallback
 * resets whenever serverless scales out, so it only slows casual abuse;
 * configuring the store makes the limit hold across all instances.
 *
 * Fail-open: if the store is unreachable, the in-memory limiter answers
 * instead of taking the route down. Fail-closed would turn a Redis outage
 * into a site-wide API outage.
 */
export function createAsyncRateLimiter(name: string, limit: number, windowMs = 60_000) {
  const fallback = createRateLimiter(limit, windowMs);
  const base = (process.env.UPSTASH_REDIS_REST_URL ?? "").replace(/\/+$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";

  if (!base || !token) {
    return async (ip: string): Promise<boolean> => fallback(ip);
  }

  return async (ip: string): Promise<boolean> => {
    try {
      const key = `rl:${name}:${Math.floor(Date.now() / windowMs)}:${ip}`;
      // Atomic counter + expiry. No detached fetch can be killed at the end
      // of a serverless invocation, and failed stores use the local fallback.
      const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('PEXPIRE',KEYS[1],ARGV[1]) end; return n";
      const res = await fetch(base, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["EVAL", script, "1", key, String(windowMs * 2)]),
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Rate limit store unavailable");
      const data = (await res.json()) as { result?: number; error?: string };
      if (data.error || typeof data.result !== "number") throw new Error("Invalid rate limit response");
      return data.result > limit;
    } catch {
      return fallback(ip);
    }
  };
  }
