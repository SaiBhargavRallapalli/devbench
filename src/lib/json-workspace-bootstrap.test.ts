import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  buildJsonQueryShareUrl,
  fetchRemoteJsonForWorkspace,
  readJsonBootstrapFromSearch,
  readTabFromSearch,
} from "./json-workspace-bootstrap";

describe("readJsonBootstrapFromSearch", () => {
  it("reads ?json= parameter", () => {
    const src = readJsonBootstrapFromSearch("?json=%7B%22a%22%3A1%7D");
    expect(src).toEqual({ kind: "inline", text: '{"a":1}' });
  });

  it("reads ?url= parameter", () => {
    const src = readJsonBootstrapFromSearch("?url=https://example.com/data.json");
    expect(src).toEqual({ kind: "url", url: "https://example.com/data.json" });
  });

  it("reads ?tab= parameter", () => {
    expect(readTabFromSearch("?tab=format")).toBe("format");
    expect(readTabFromSearch("?tab=tree")).toBe("tree");
    expect(readTabFromSearch("?tab=invalid")).toBeNull();
  });
});

describe("buildJsonQueryShareUrl", () => {
  it("builds ?json= share link for small JSON", () => {
    const url = buildJsonQueryShareUrl("https://devbench.test", "/json", '{"hi":1}');
    expect(url).toBe("https://devbench.test/json?json=%7B%22hi%22%3A1%7D");
  });
});

describe("fetchRemoteJsonForWorkspace", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        json: async () => ({
          status: 200,
          body: '{"loaded":true}',
          contentType: "application/json",
          finalUrl: "https://example.com/a.json",
        }),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pretty-prints valid JSON from proxy", async () => {
    const r = await fetchRemoteJsonForWorkspace("https://example.com/a.json");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(JSON.parse(r.text)).toEqual({ loaded: true });
    }
  });
});
