// Copyright (c) 2026 DevBench contributors. MIT License.
import { JSONPath } from "jsonpath-plus";

export type JsonPathQueryResult = {
  matches: unknown[];
  matchCount: number;
  error?: string;
};

/** Run a JSONPath expression (RFC 9535 subset via jsonpath-plus). */
export function queryJsonPath(data: unknown, expression: string): JsonPathQueryResult {
  const path = expression.trim();
  if (!path) {
    return { matches: [], matchCount: 0, error: "Enter a JSONPath expression (e.g. $.store.book[*].title)." };
  }
  if (!path.startsWith("$")) {
    return { matches: [], matchCount: 0, error: "JSONPath must start with $ (root)." };
  }

  try {
    const raw = JSONPath({ path, json: data as object, wrap: true }) as unknown;
    const matches = Array.isArray(raw) ? raw : raw === undefined ? [] : [raw];
    return { matches, matchCount: matches.length };
  } catch (e) {
    return {
      matches: [],
      matchCount: 0,
      error: e instanceof Error ? e.message : "Invalid JSONPath expression.",
    };
  }
}

export const JSON_PATH_EXAMPLES: { label: string; path: string }[] = [
  { label: "All keys", path: "$..*" },
  { label: "First array item", path: "$[0]" },
  { label: "Nested field", path: "$.responses[0].type" },
  { label: "Filter by type", path: "$.responses[?(@.type=='text')]" },
];
