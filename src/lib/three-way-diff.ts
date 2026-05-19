/**
 * Simple 3-way diff: compare left and right each against base (ancestor).
 */

export type ThreeWayLine = {
  baseNum: number | null;
  leftNum: number | null;
  rightNum: number | null;
  base: string;
  left: string;
  right: string;
  kind: "unchanged" | "left-only" | "right-only" | "both-changed" | "conflict";
};

export function computeThreeWayDiff(base: string, left: string, right: string): ThreeWayLine[] {
  const b = base.split("\n");
  const l = left.split("\n");
  const r = right.split("\n");
  const max = Math.max(b.length, l.length, r.length);
  const out: ThreeWayLine[] = [];

  for (let i = 0; i < max; i++) {
    const baseLine = b[i] ?? "";
    const leftLine = l[i] ?? "";
    const rightLine = r[i] ?? "";
    const baseNum = i < b.length ? i + 1 : null;
    const leftNum = i < l.length ? i + 1 : null;
    const rightNum = i < r.length ? i + 1 : null;

    let kind: ThreeWayLine["kind"] = "unchanged";
    if (leftLine === rightLine) {
      if (leftLine !== baseLine) kind = "both-changed";
    } else if (leftLine === baseLine) {
      kind = "right-only";
    } else if (rightLine === baseLine) {
      kind = "left-only";
    } else {
      kind = "conflict";
    }

    out.push({
      baseNum,
      leftNum,
      rightNum,
      base: baseLine,
      left: leftLine,
      right: rightLine,
      kind,
    });
  }
  return out;
}
