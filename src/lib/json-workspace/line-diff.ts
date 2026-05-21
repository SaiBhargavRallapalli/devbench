// Copyright (c) 2026 DevBench contributors. MIT License.
import type { DiffLine } from "./types";


export function computeLineDiff(before: string, after: string): DiffLine[] {
  const a = before.split("\n");
  const b = after.split("\n");
  const MAX = 300;
  if (a.length > MAX || b.length > MAX) {
    return [
      ...a.map((t) => ({ type: "remove" as const, text: t })),
      ...b.map((t) => ({ type: "add" as const, text: t })),
    ];
  }
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--)
    for (let j = n - 1; j >= 0; j--)
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const result: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m || j < n) {
    if (i < m && j < n && a[i] === b[j]) { result.push({ type: "same", text: a[i++] }); j++; }
    else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) result.push({ type: "add", text: b[j++] });
    else result.push({ type: "remove", text: a[i++] });
  }
  return result;
}

// Collapses long runs of unchanged lines, keeping CTX context lines around each change hunk.
// Inserts a synthetic { type: "same", text: "···" } separator between collapsed sections.
export function diffWithContext(lines: DiffLine[], ctx = 2): DiffLine[] {
  const shown = new Set<number>();
  lines.forEach((l, i) => {
    if (l.type !== "same") {
      for (let d = -ctx; d <= ctx; d++) {
        const idx = i + d;
        if (idx >= 0 && idx < lines.length) shown.add(idx);
      }
    }
  });
  if (!shown.size) return [];
  const result: DiffLine[] = [];
  let gap = false;
  for (let i = 0; i < lines.length; i++) {
    if (shown.has(i)) {
      if (gap) result.push({ type: "same", text: "···" });
      gap = false;
      result.push(lines[i]);
    } else {
      gap = true;
    }
  }
  return result;
}

