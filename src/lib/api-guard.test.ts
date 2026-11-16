import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedOrigin, clientIpFromHeaders, createRateLimiter } from "./api-guard";

describe("isAllowedOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("allows null Origin outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    expect(isAllowedOrigin(null)).toBe(true);
  });

  it("rejects null Origin in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin(null)).toBe(false);
  });

  it("allows production site origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin("https://www.devbench.co.in")).toBe(true);
    expect(isAllowedOrigin("https://devbench.co.in")).toBe(true);
    expect(isAllowedOrigin("https://json.devbench.co.in")).toBe(true);
  });

  it("allows localhost in any env", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("rejects foreign origins", () => {
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false);
  });
});

describe("clientIpFromHeaders", () => {
  it("prefers x-vercel-forwarded-for", () => {
    const h = new Headers({
      "x-vercel-forwarded-for": "1.1.1.1, 2.2.2.2",
      "x-forwarded-for": "3.3.3.3",
    });
    expect(clientIpFromHeaders(h)).toBe("1.1.1.1");
  });

  it("falls back to x-forwarded-for then x-real-ip", () => {
    expect(clientIpFromHeaders(new Headers({ "x-forwarded-for": "4.4.4.4, 5.5.5.5" }))).toBe(
      "4.4.4.4",
    );
    expect(clientIpFromHeaders(new Headers({ "x-real-ip": "6.6.6.6" }))).toBe("6.6.6.6");
    expect(clientIpFromHeaders(new Headers())).toBe("unknown");
  });
});

describe("createRateLimiter", () => {
  it("limits after N requests in the window", () => {
    const limited = createRateLimiter(3, 60_000);
    expect(limited("ip")).toBe(false);
    expect(limited("ip")).toBe(false);
    expect(limited("ip")).toBe(false);
    expect(limited("ip")).toBe(true);
    expect(limited("other")).toBe(false);
  });
});

describe("createAsyncRateLimiter", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("falls back to the in-memory limiter when no store is configured", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
    const { createAsyncRateLimiter } = await import("./api-guard");
    const limited = createAsyncRateLimiter("test", 2, 60_000);
    expect(await limited("ip")).toBe(false);
    expect(await limited("ip")).toBe(false);
    expect(await limited("ip")).toBe(true);
    expect(await limited("other")).toBe(false);
  });
});

describe("shared rate limiter store", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
  it("uses one atomic expiry operation and enforces shared counts", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ result: 3 })));
    vi.stubGlobal("fetch", fetcher);
    const { createAsyncRateLimiter } = await import("./api-guard");
    expect(await createAsyncRateLimiter("test", 2)("ip")).toBe(true);
    const command = JSON.parse(fetcher.mock.calls[0][1].body);
    expect(command[0]).toBe("EVAL");
    expect(command[1]).toContain("PEXPIRE");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("uses the bounded local fallback on malformed store responses", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(JSON.stringify({ error: "unavailable" }))));
    const { createAsyncRateLimiter } = await import("./api-guard");
    const limited = createAsyncRateLimiter("test", 1);
    expect(await limited("ip")).toBe(false);
    expect(await limited("ip")).toBe(true);
  });
});
