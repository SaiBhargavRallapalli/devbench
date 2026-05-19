import { describe, it, expect } from "vitest";
import { computeThreeWayDiff } from "@/lib/three-way-diff";

describe("three-way diff", () => {
  it("detects conflict when both sides change from base", () => {
    const lines = computeThreeWayDiff("a\nb\nc", "a\nB\nc", "a\nx\nc");
    const conflict = lines.find((l) => l.kind === "conflict");
    expect(conflict).toBeDefined();
    expect(conflict?.left).toBe("B");
    expect(conflict?.right).toBe("x");
  });

  it("marks unchanged lines", () => {
    const lines = computeThreeWayDiff("same", "same", "same");
    expect(lines.every((l) => l.kind === "unchanged")).toBe(true);
  });
});
