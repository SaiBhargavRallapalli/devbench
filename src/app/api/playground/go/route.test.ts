// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/playground/go", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function mockUpstream(opts: {
  ok?: boolean;
  status?: number;
  json?: object;
  throws?: Error;
}) {
  if (opts.throws) {
    return vi.fn().mockRejectedValue(opts.throws);
  }
  const jsonFn = opts.json
    ? vi.fn().mockResolvedValue(opts.json)
    : vi.fn().mockRejectedValue(new SyntaxError("bad json"));
  return vi.fn().mockResolvedValue({
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    json: jsonFn,
  } as unknown as Response);
}

describe("POST /api/playground/go", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns 400 for non-JSON body", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/playground/go", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid JSON/i);
  });

  it("returns 400 for missing code field", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ lang: "go" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 400 for empty code string", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ code: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when code exceeds size limit", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ code: "x".repeat(96_001) }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/size limit/i);
  });

  it("wraps bare function in package main", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Events: [{ Message: "hello\n", Kind: "stdout" }] }),
    } as unknown as Response);

    await POST(makeRequest({ code: 'import "fmt"\nfunc main() { fmt.Println("hello") }' }));

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.body).toMatch(/^package main/);
  });

  it("does not double-wrap code that already has package declaration", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Events: [] }),
    } as unknown as Response);

    const code = 'package main\nimport "fmt"\nfunc main() { fmt.Println("hi") }';
    await POST(makeRequest({ code }));

    const [, init] = vi.mocked(fetch).mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.body).toBe(code);
  });

  it("returns combined stdout output", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        Events: [
          { Message: "hello\n", Kind: "stdout" },
          { Message: "world\n", Kind: "stdout" },
        ],
      }),
    } as unknown as Response);

    const res = await POST(makeRequest({ code: "fmt.Println()" }));
    expect(res.status).toBe(200);
    const json = await res.json();
    // Each event's trailing newline is preserved; events themselves are joined with "\n"
    expect(json.output).toBe("hello\n\nworld");
  });

  it("prefixes stderr events", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        Events: [{ Message: "undefined: x\n", Kind: "stderr" }],
      }),
    } as unknown as Response);

    const res = await POST(makeRequest({ code: "var _ = x" }));
    const json = await res.json();
    expect(json.output).toContain("[stderr]");
  });

  it("includes Errors field in output when present", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Errors: "syntax error", Events: [] }),
    } as unknown as Response);

    const res = await POST(makeRequest({ code: "broken code" }));
    const json = await res.json();
    expect(json.output).toContain("syntax error");
  });

  it("returns (no output) when there are no events", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ Events: [] }),
    } as unknown as Response);

    const res = await POST(makeRequest({ code: "package main\nfunc main(){}" }));
    const json = await res.json();
    expect(json.output).toBe("(no output)");
  });

  it("returns 502 when upstream fetch throws", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    const res = await POST(makeRequest({ code: "fmt.Println()" }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/network error/i);
  });

  it("returns 502 when upstream returns non-OK status", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn(),
    } as unknown as Response);

    const res = await POST(makeRequest({ code: "fmt.Println()" }));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/503/);
  });
});
