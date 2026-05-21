// Copyright (c) 2026 DevBench contributors. MIT License.
/** Sample broken JSON — mirrors https://jsonlint.com/json-repair “Try an example”. */

export type JsonRepairExample = {
  id: string;
  label: string;
  broken: string;
};

export const JSON_REPAIR_EXAMPLES: JsonRepairExample[] = [
  { id: "trailing", label: "Trailing commas", broken: '{"a": 1, "b": 2,}' },
  { id: "single-quotes", label: "Single quotes", broken: "{'a': 1, 'b': 2}" },
  { id: "unquoted-keys", label: "Unquoted keys", broken: "{a: 1, b: 2}" },
  { id: "markdown", label: "Markdown wrapper", broken: "```json\n{\"name\": \"John\"}\n```" },
  { id: "comments", label: "Comments", broken: '{\n  "a": 1 // note\n}' },
  { id: "truncated", label: "Truncated JSON", broken: '{"a": [1, 2' },
  { id: "missing-commas", label: "Missing commas", broken: '{"a": 1 "b": 2 "c": 3}' },
  {
    id: "over-escaped",
    label: "Over-escaped quotes",
    broken: String.raw`{\"name\": \"John\", \"age\": 30}`,
  },
];
