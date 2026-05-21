import { describe, expect, it } from "vitest";
import { fixCommonMistakes } from "./json-repair";

/** JSONLint repair examples: https://jsonlint.com/json-repair */
const JSONLINT_EXAMPLES: [string, string][] = [
  ["trailing commas", '{"a": 1,}'],
  ["single quotes", "{'a': 1}"],
  ["unquoted keys", "{a: 1}"],
  ["missing commas", '{"a": 1 "b": 2}'],
  ["comments", '{"a": 1} // note'],
  ["truncated", '{"a": [1, 2'],
  ["markdown wrapper", "```json\n{\"name\": \"John\"}\n```"],
];

describe("fixCommonMistakes", () => {
  it.each(JSONLINT_EXAMPLES)("fixes %s", (_label, broken) => {
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
});
