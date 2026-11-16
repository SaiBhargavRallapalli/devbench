// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  SAMPLE_HAR,
  buildSummaryText,
  groupBytes,
  parseHar,
  summarize,
} from "./har-analyzer";

const entry = (over: Record<string, unknown> = {}) => ({
  startedDateTime: "2026-11-16T10:00:00.000Z",
  time: 250,
  request: { method: "GET", url: "https://a.test/?session=SECRETTOKEN" },
  response: { status: 200, bodySize: 1200, _transferSize: 1500, content: { size: 5000, mimeType: "text/html" } },
  timings: { blocked: 3, dns: -1, ssl: 40, connect: 80, send: 1, wait: 120, receive: 20 },
  ...over,
});
const har = (entries: unknown[]) => JSON.stringify({ log: { entries } });

describe("parseHar", () => {
  it("parses the bundled sample", () => {
    const rows = parseHar(SAMPLE_HAR);
    expect(rows).toHaveLength(9);
    const s = summarize(rows);
    expect(s.failed.map((r) => r.status).sort()).toEqual([0, 404, 500]);
    expect(s.domains).toBe(4);
  });
  it("prefers transfer size and does not double count ssl inside connect", () => {
    const [r] = parseHar(har([entry()]));
    expect(r.size).toBe(1500);
    expect(r.preMs).toBe(3 + 80 + 1);
    expect(r.type).toBe("document");
  });
  it("treats -1 timings and bodySize as zero (Firefox/Chrome)", () => {
    const [r] = parseHar(
      har([
        entry({
          response: { status: 304, bodySize: -1, content: { size: 3000, mimeType: "application/javascript" } },
          timings: { blocked: -1, dns: -1, connect: -1, ssl: -1, send: 0, wait: 50, receive: 50 },
          time: -1,
        }),
      ]),
    );
    expect(r.size).toBe(3000);
    expect(r.totalMs).toBe(100);
    expect(r.type).toBe("script");
  });
  it("rejects malformed input with readable errors", () => {
    expect(() => parseHar("hello")).toThrow();
    expect(() => parseHar("{}")).toThrow(/missing log.entries/);
    expect(() => parseHar(har([]))).toThrow(/no usable entries/);
    expect(() => parseHar(har([null, 1, {}]))).toThrow(/no usable entries/);
  });
  it("keeps invalid URLs without echoing a query string", () => {
    const [r] = parseHar(har([entry({ request: { method: "GET", url: "nonsense?token=SECRET" } })]));
    expect(r.host).toBe("(invalid URL)");
    expect(`${r.host}${r.path}${r.search}`).not.toContain("SECRET");
  });
  it("handles tens of thousands of entries", () => {
    const many = Array.from({ length: 30000 }, (_, n) =>
      entry({ request: { method: "GET", url: `https://h${n % 40}.test/p/${n}.js?x=${n}` } }),
    );
    const rows = parseHar(har(many));
    expect(summarize(rows).count).toBe(30000);
    expect(groupBytes(rows, "host")).toHaveLength(40);
  });
});

describe("buildSummaryText", () => {
  it("never includes query strings, headers or cookies", () => {
    const rows = parseHar(
      har([
        entry({
          request: {
            method: "GET",
            url: "https://a.test/x?token=SECRETQ",
            headers: [{ name: "Authorization", value: "Bearer SECRETHDR" }],
            cookies: [{ name: "sid", value: "SECRETCOOKIE" }],
          },
        }),
      ]),
    );
    const text = buildSummaryText(rows);
    expect(text).not.toMatch(/SECRET/);
    expect(text).toContain("a.test/x");
  });
});
