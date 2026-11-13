// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { DOWN_CHECK_SERVICES } from "@/lib/down-check/catalog";

function makeRequest(hosts: unknown, ip: string, origin?: string) {
  return new NextRequest("http://localhost/api/down-check", {
    method: "POST",
    body: JSON.stringify({ hosts }),
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
      Origin: origin ?? "http://localhost:3000",
    },
  });
}

function makeRawRequest(rawBody: string, ip: string) {
  return new NextRequest("http://localhost/api/down-check", {
    method: "POST",
    body: rawBody,
    headers: { "Content-Type": "text/plain", "x-forwarded-for": ip },
  });
}

/** The route only reads `status` from a probe response. */
function headResponse(status: number): Response {
  return { status, statusText: "OK", ok: status < 400 } as unknown as Response;
}

describe("POST /api/down-check", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("rejects foreign Origin before touching the catalog", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(["www.google.com"], "1.1.1.1", "https://evil.example.com"));
    expect(res.status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("rejects missing Origin in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/down-check", {
      method: "POST",
      body: JSON.stringify({ hosts: ["www.google.com"] }),
      headers: { "Content-Type": "application/json", "x-forwarded-for": "1.1.1.2" },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("rejects hosts outside the allowlist (SSRF surface is closed)", async () => {
    const { POST } = await import("./route");
    const attempts = [
      "evil.example.com",
      "localhost",
      "127.0.0.1",
      "169.254.169.254",
      "www.google.com.evil.example.com",
      "internal.local",
    ];
    for (const [i, host] of attempts.entries()) {
      const res = await POST(makeRequest([host], `2.2.2.${i + 1}`));
      expect(res.status, `host "${host}" must be rejected`).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/unknown host/i);
    }
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("returns 400 for a non-array or empty hosts value", async () => {
    const { POST } = await import("./route");
    for (const [i, value] of [[], "www.google.com", 42, null].entries()) {
      const res = await POST(makeRequest(value, `3.3.3.${i + 1}`));
      expect(res.status, `value ${JSON.stringify(value)} must be 400`).toBe(400);
    }
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("returns 400 when more than MAX_HOSTS (32) hosts are sent", async () => {
    const { POST } = await import("./route");
    const hosts = Array.from({ length: 33 }, (_, i) => `host-${i}.example.com`);
    const res = await POST(makeRequest(hosts, "3.3.3.9"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/too many hosts/i);
    expect(vi.mocked(fetch)).not.toHaveBeenCalled();
  });

  it("returns 400 for a malformed JSON body", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRawRequest("not json", "4.4.4.1"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid json/i);
  });

  it("probes an allowlisted host with HEAD and redirect: manual", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(200));

    const res = await POST(makeRequest(["www.google.com"], "5.5.5.1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(1);
    expect(json.results[0]).toMatchObject({ host: "www.google.com", state: "up", status: 200 });
    expect(typeof json.results[0].ms).toBe("number");

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("https://www.google.com/");
    expect((init as RequestInit).method).toBe("HEAD");
    // No redirect following: a 3xx stays a 3xx, so an allowlisted host can
    // never bounce the probe at an internal address.
    expect((init as RequestInit).redirect).toBe("manual");
  });

  it("accepts every host in the shared catalog, chunked like the client", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(200));

    const hosts = DOWN_CHECK_SERVICES.map((s) => s.host);
    expect(hosts.length).toBeGreaterThan(32);
    for (let i = 0; i < hosts.length; i += 32) {
      const chunk = hosts.slice(i, i + 32);
      const res = await POST(makeRequest(chunk, `6.6.6.${i / 32 + 1}`));
      expect(res.status, `chunk starting ${chunk[0]} must be accepted`).toBe(200);
      const json = await res.json();
      expect(json.results).toHaveLength(chunk.length);
    }
  });

  it("classifies 4xx as up (sites often block datacenter HEAD requests)", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(403));

    const res = await POST(makeRequest(["www.flipkart.com"], "5.5.5.2"));
    const json = await res.json();
    expect(json.results[0]).toMatchObject({ state: "up", status: 403 });
  });

  it("classifies 5xx as degraded", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(503));

    const res = await POST(makeRequest(["www.irctc.co.in"], "5.5.5.3"));
    const json = await res.json();
    expect(json.results[0]).toMatchObject({ state: "degraded", status: 503 });
  });

  it("classifies a failed fetch as down with no status", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));

    const res = await POST(makeRequest(["www.swiggy.com"], "5.5.5.4"));
    const json = await res.json();
    expect(json.results[0]).toMatchObject({ host: "www.swiggy.com", state: "down", status: null });
    expect(typeof json.results[0].ms).toBe("number");
  });

  it("probes each unique host once and stays within MAX_HOSTS after dedupe", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(200));

    const res = await POST(makeRequest(["www.jio.com", "www.jio.com", "www.airtel.in"], "5.5.5.5"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(2);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  it("returns 429 once the 30 req/min limit is exhausted", async () => {
    vi.resetModules();
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue(headResponse(200));

    const ip = "10.20.30.40";
    for (let i = 0; i < 30; i++) {
      await POST(makeRequest(["not-in-catalog.example.com"], ip));
    }
    const res = await POST(makeRequest(["www.google.com"], ip));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/rate limit/i);
  });
});
