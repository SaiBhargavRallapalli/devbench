// Copyright (c) 2026 DevBench contributors. MIT License.

export function getJsonStats(input: string): { valid: boolean; size: string; keys: number; depth: number } {
  const size =
    input.length < 1024
      ? `${input.length} B`
      : input.length < 1048576
        ? `${(input.length / 1024).toFixed(1)} KB`
        : `${(input.length / 1048576).toFixed(1)} MB`;

  try {
    const parsed = JSON.parse(input);
    let keys = 0;
    let maxDepth = 0;
    function walk(v: unknown, d: number) {
      if (d > maxDepth) maxDepth = d;
      if (Array.isArray(v)) {
        v.forEach((item) => walk(item, d + 1));
      } else if (typeof v === "object" && v !== null) {
        const entries = Object.entries(v);
        keys += entries.length;
        entries.forEach(([, val]) => walk(val, d + 1));
      }
    }
    walk(parsed, 0);
    return { valid: true, size, keys, depth: maxDepth };
  } catch {
    return { valid: false, size, keys: 0, depth: 0 };
  }
}

export function computeDiff(a: string, b: string): { type: "same" | "add" | "remove"; text: string }[] {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: { type: "same" | "add" | "remove"; text: string }[] = [];
  let i = 0;
  let j = 0;

  while (i < linesA.length || j < linesB.length) {
    if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
      result.push({ type: "same", text: linesA[i] });
      i++;
      j++;
    } else if (j < linesB.length && (i >= linesA.length || !linesB.slice(j).includes(linesA[i]))) {
      result.push({ type: "add", text: linesB[j] });
      j++;
    } else if (i < linesA.length) {
      result.push({ type: "remove", text: linesA[i] });
      i++;
    }
  }
  return result;
}
