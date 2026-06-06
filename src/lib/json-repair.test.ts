import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";
import { fixCommonMistakes } from "./json-repair";

const REPAIR_EXAMPLES: [string, string][] = [
  ["trailing commas", '{"a": 1,}'],
  ["single quotes", "{'a': 1}"],
  ["unquoted keys", "{a: 1}"],
  ["missing commas", '{"a": 1 "b": 2}'],
  ["comments", '{"a": 1} // note'],
  ["truncated", '{"a": [1, 2'],
  ["markdown wrapper", "```json\n{\"name\": \"John\"}\n```"],
];

describe("fixCommonMistakes", () => {
  it.each(REPAIR_EXAMPLES)("fixes %s", (_label, broken) => {
    const result = fixCommonMistakes(broken);
    expect(result.success).toBe(true);
    expect(() => JSON.parse(result.text)).not.toThrow();
    expect(result.fixes.length).toBeGreaterThan(0);
  });

  it("leaves valid JSON unchanged", () => {
    const result = fixCommonMistakes('{"ok": true}');
    expect(result.success).toBe(true);
    expect(JSON.parse(result.text)).toEqual({ ok: true });
  });

  it("fixes over-escaped quotes (Swiggy-style API dump)", () => {
    const broken = String.raw`{\"responses\": [{\"type\": \"text\", \"text\": \"Place this order with Cash?\"}]}`;
    const result = fixCommonMistakes(broken);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.text) as { responses: { type: string }[] };
    expect(parsed.responses[0].type).toBe("text");
  });

  it("fixes full Swiggy cart response with over-escaped quotes", () => {
    const broken = readFileSync(
      join(__dirname, "fixtures/swiggy-escaped.json.txt"),
      "utf8",
    );
    const result = fixCommonMistakes(broken);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.text) as {
      responses: { type: string; card?: string }[];
    };
    expect(parsed.responses).toHaveLength(3);
    expect(parsed.responses[0].type).toBe("text");
    expect(parsed.responses[1].card).toBe("swiggy_response");
  });

  it("expands a single embedded JSON string", () => {
    const result = fixCommonMistakes('{"msg":"{\\"ok\\":true}"}');
    expect(result.success).toBe(true);
    expect(JSON.parse(result.text)).toEqual({ msg: { ok: true } });
  });
});
