// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/code-run", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json", ...headers },
  });
}

const VALID_BODY = {
  language: "python",
  version: "cpython-3.13.8",
  code: 'print("hello")',
};

/** Realistic Wandbox success fixture (verified live 2026-10). */
function wandboxSuccess(programOutput: string, programMessage?: string) {
  return {
    status: "0",
    signal: "",
    compiler_output: "",
    compiler_error: "",
    compiler_message: "",
    program_output: programOutput,
    program_error: "",
    program_message: programMessage ?? programOutput,
    permlink: "",
    url: "",
  };
}

describe("POST /api/code-run", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.useRealTimers();
  });

  it("returns 403 for a disallowed origin", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest(VALID_BODY, { Origin: "https://evil.example.com" }),
    );
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/forbidden/i);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 400 for non-JSON body", async () => {
    const { POST } = await import("./route");
    const req = new Request("http://localhost/api/code-run", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "text/plain" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/invalid json/i);
  });

  it("returns 400 for missing language", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({ version: "cpython-3.13.8", code: "print(1)" }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 400 for an invalid compiler id (version)", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({ ...VALID_BODY, version: "not a valid id!" }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/compiler id/i);
  });

  it("returns 400 for empty code", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ ...VALID_BODY, code: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/missing.*code/i);
  });

  it("returns 400 when code exceeds the size limit", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({ ...VALID_BODY, code: "x".repeat(100_001) }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/size limit/i);
  });

  it("returns 400 when stdin exceeds the size limit", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      makeRequest({ ...VALID_BODY, stdin: "y".repeat(50_001) }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/stdin/i);
  });

  it("returns 429 after 10 requests in a minute", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(wandboxSuccess("")),
    } as unknown as Response);

    for (let i = 0; i < 10; i++) {
      const res = await POST(makeRequest(VALID_BODY));
      expect(res.status).toBe(200);
    }

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toMatch(/rate limit/i);
  });

  it("posts {compiler, code, stdin} to the Wandbox compile endpoint", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(wandboxSuccess("hi\n")),
    } as unknown as Response);

    await POST(makeRequest({ ...VALID_BODY, stdin: "typed input" }));

    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe("https://wandbox.org/api/compile.json");
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent).toEqual({
      compiler: "cpython-3.13.8",
      code: 'print("hello")',
      stdin: "typed input",
    });
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["User-Agent"]).toBe("DevBench/1.0 (+https://www.devbench.co.in)");
  });

  it("omits stdin from the upstream body when empty", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(wandboxSuccess("")),
    } as unknown as Response);

    await POST(makeRequest(VALID_BODY));
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    expect("stdin" in sent).toBe(false);
  });

  it("joins multi-file submissions with a blank line", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(wandboxSuccess("")),
    } as unknown as Response);

    await POST(
      makeRequest({
        language: "cpp",
        version: "clang-15.0.7",
        files: [{ content: "// helpers" }, { content: "int main() {}" }],
      }),
    );
    const [, init] = vi.mocked(fetch).mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent.code).toBe("// helpers\n\nint main() {}");
    expect(sent.compiler).toBe("clang-15.0.7");
  });

  it("normalizes a successful run", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(wandboxSuccess("hello\n")),
    } as unknown as Response);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      output: "hello",
      exitCode: 0,
      stderr: "",
      compileError: null,
      language: "python",
      version: "cpython-3.13.8",
    });
  });

  it("normalizes a compiled-language build failure", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: "1",
        signal: "",
        compiler_output: "",
        compiler_error:
          "\u001b[1mprog.cc:2:27: \u001b[0merror: use of undeclared identifier 'oops'\n1 error generated.\n",
        compiler_message:
          "\u001b[1mprog.cc:2:27: \u001b[0merror: use of undeclared identifier 'oops'\n1 error generated.\n",
        program_output: "",
        program_error: "",
        program_message: "",
        permlink: "",
        url: "",
      }),
    } as unknown as Response);

    const res = await POST(
      makeRequest({ language: "cpp", version: "clang-15.0.7", code: "int main(){}" }),
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.compileError).toContain("use of undeclared identifier 'oops'");
    expect(json.compileError).not.toContain("\u001b");
    expect(json.output).toBe("");
    expect(json.exitCode).toBe(1);
    expect(json.stderr).toBe("");
    expect(json.language).toBe("cpp");
    expect(json.version).toBe("clang-15.0.7");
  });

  it("normalizes a runtime error (program_error → stderr, output kept)", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        status: "1",
        signal: "",
        compiler_output: "",
        compiler_error: "",
        compiler_message: "",
        program_output: "1\n",
        program_error: "Traceback (most recent call last):\nValueError: boom\n",
        program_message: "1\nTraceback (most recent call last):\nValueError: boom\n",
        permlink: "",
        url: "",
      }),
    } as unknown as Response);

    const res = await POST(makeRequest(VALID_BODY));
    const json = await res.json();
    expect(json.output).toBe("1");
    expect(json.exitCode).toBe(1);
    expect(json.stderr).toContain("ValueError: boom");
    expect(json.compileError).toBeNull();
  });

  it("returns 502 when upstream fetch throws", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/network error/i);
  });

  it("returns 502 with the plain-text body on non-OK (unknown compiler)", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Error: Unknown compiler"),
    } as unknown as Response);

    const res = await POST(
      makeRequest({ ...VALID_BODY, version: "nope-99.9" }),
    );
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/unknown compiler/i);
  });

  it("surfaces a JSON `message` body on non-OK responses", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 429,
      text: vi.fn().mockResolvedValue('{"message":"quota exceeded"}'),
    } as unknown as Response);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/quota exceeded/i);
  });

  it("returns 502 when upstream JSON is unparseable", async () => {
    const { POST } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockRejectedValue(new Error("bad json")),
    } as unknown as Response);

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
  });

  it("returns 504 when the upstream request times out", async () => {
    const { POST } = await import("./route");
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation(
      (_input: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    );

    const pending = POST(makeRequest(VALID_BODY));
    await vi.advanceTimersByTimeAsync(24_000);
    const res = await pending;
    expect(res.status).toBe(504);
    const json = await res.json();
    expect(json.error).toMatch(/timed out/i);
  });
});

describe("GET /api/code-run", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns the compiler catalog with a CDN cache header", async () => {
    const { GET } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([
        { name: "cpython-3.13.8", version: "3.13.8", language: "Python" },
        { name: "nodejs-20.17.0", version: "20.17.0", language: "JavaScript" },
      ]),
    } as unknown as Response);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual([
      {
        language: "javascript",
        version: "nodejs-20.17.0",
        aliases: ["20.17.0"],
      },
      { language: "python", version: "cpython-3.13.8", aliases: ["3.13.8"] },
    ]);
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=21600");
    expect(res.headers.get("Cache-Control")).toContain("stale-while-revalidate=86400");
    const [url] = vi.mocked(fetch).mock.calls[0];
    expect(String(url)).toBe("https://wandbox.org/api/list.json");
  });

  it("canonicalizes groups, drops unstable/Lazy K entries, caps at 6", async () => {
    const { GET } = await import("./route");
    const pythonIds = [
      "cpython-3.14.0",
      "cpython-3.13.8",
      "cpython-3.12.7",
      "cpython-3.11.10",
      "cpython-3.10.15",
      "cpython-3.9.20",
      "cpython-3.8.20", // 7th → capped out
      "cpython-head", // unstable
    ].map((name) => ({ name, version: name, language: "Python" }));

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([
        ...pythonIds,
        { name: "clang-15.0.7", version: "15.0.7", language: "C++" },
        { name: "clang-15.0.7", version: "15.0.7", language: "CPP" }, // dup across groups
        { name: "gcc-head", version: "17.0.0 (experimental)", language: "C++" },
        { name: "boost-1.0", version: "1.0", language: "C++" },
        { name: "lazyk-1.0", version: "1.0", language: "Lazy K" },
        { name: "bash", version: "5.2.21(1)-release", language: "Bash script" },
        { name: "mono-6.12.0.199", version: "6.12.0.199", language: "C#" },
        "junk",
        null,
      ]),
    } as unknown as Response);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as Array<{
      language: string;
      version: string;
      aliases?: string[];
    }>;

    const python = json.filter((e) => e.language === "python");
    expect(python.map((e) => e.version)).toEqual([
      "cpython-3.14.0",
      "cpython-3.13.8",
      "cpython-3.12.7",
      "cpython-3.11.10",
      "cpython-3.10.15",
      "cpython-3.9.20",
    ]);

    expect(json.filter((e) => e.language === "cpp")).toEqual([
      { language: "cpp", version: "clang-15.0.7", aliases: ["15.0.7"] },
    ]);
    expect(json.some((e) => e.version.includes("head"))).toBe(false);
    expect(json.some((e) => e.version.includes("boost"))).toBe(false);
    expect(json.some((e) => e.language.includes("lazy"))).toBe(false);

    expect(json.find((e) => e.language === "bash")).toEqual({
      language: "bash",
      version: "bash",
      aliases: ["5.2.21(1)-release"],
    });
    expect(json.find((e) => e.language === "csharp")?.version).toBe(
      "mono-6.12.0.199",
    );
  });

  it("returns 502 when the runtimes fetch throws", async () => {
    const { GET } = await import("./route");
    vi.mocked(fetch).mockRejectedValue(new Error("dns failure"));

    const res = await GET();
    expect(res.status).toBe(502);
    const json = await res.json();
    expect(json.error).toMatch(/language list/i);
  });

  it("returns 502 when runtimes upstream returns non-OK", async () => {
    const { GET } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response);

    const res = await GET();
    expect(res.status).toBe(502);
  });

  it("returns 502 when the runtimes list is unusable/empty", async () => {
    const { GET } = await import("./route");
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([]),
    } as unknown as Response);

    const res = await GET();
    expect(res.status).toBe(502);
  });
});
