import { describe, expect, it } from "vitest";
import {
  EMBED_MAX_ECHO_CHARS,
  EMBED_MAX_INPUT_CHARS,
  clampEmbedOutboundEvent,
  normalizeEmbedConfig,
  parseEmbedCommand,
  truncateEmbedField,
} from "./embed-api";

describe("parseEmbedCommand", () => {
  it("accepts valid SET_INPUT", () => {
    expect(parseEmbedCommand({ source: "devbench-embed", type: "SET_INPUT", input: "hi" })).toEqual({
      source: "devbench-embed",
      type: "SET_INPUT",
      input: "hi",
    });
  });

  it("rejects oversize SET_INPUT", () => {
    expect(
      parseEmbedCommand({
        source: "devbench-embed",
        type: "SET_INPUT",
        input: "x".repeat(EMBED_MAX_INPUT_CHARS + 1),
      }),
    ).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(
      parseEmbedCommand({ source: "devbench-embed", type: "SET_INPUT", input: 42 }),
    ).toBeNull();
  });

  it("validates CONFIGURE", () => {
    expect(
      parseEmbedCommand({
        source: "devbench-embed",
        type: "CONFIGURE",
        config: { theme: "dark", autoRun: false },
      }),
    ).toEqual({
      source: "devbench-embed",
      type: "CONFIGURE",
      config: { theme: "dark", autoRun: false },
    });
    expect(
      parseEmbedCommand({
        source: "devbench-embed",
        type: "CONFIGURE",
        config: { autoRun: "yes" },
      }),
    ).toBeNull();
  });
});

describe("normalizeEmbedConfig", () => {
  it("rejects invalid theme", () => {
    expect(normalizeEmbedConfig({ theme: "neon" })).toBeNull();
  });
});

describe("clampEmbedOutboundEvent", () => {
  it("truncates large OUTPUT", () => {
    const big = "a".repeat(EMBED_MAX_ECHO_CHARS + 100);
    const out = clampEmbedOutboundEvent({ type: "OUTPUT", output: big, error: "" });
    expect(out.type).toBe("OUTPUT");
    if (out.type === "OUTPUT") {
      expect(out.output.length).toBeLessThan(big.length);
      expect(out.output).toContain("truncated");
    }
  });
});

describe("truncateEmbedField", () => {
  it("leaves small strings unchanged", () => {
    expect(truncateEmbedField("ok", 10)).toBe("ok");
  });
});
