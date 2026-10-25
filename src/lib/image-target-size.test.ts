import { describe, expect, it } from "vitest";
import {
  TARGET_MIN_AREA_RATIO,
  TARGET_MIN_QUALITY,
  TARGET_MAX_QUALITY,
  TARGET_MIN_SIDE,
  TARGET_TOLERANCE,
  formatBytes,
  minimumAchievableMessage,
  nextQuality,
  parseTargetSize,
  scaleForTarget,
} from "./image-target-size";

describe("parseTargetSize", () => {
  it("parses plain numbers in KB", () => {
    expect(parseTargetSize(50, "KB")).toBe(50 * 1024);
    expect(parseTargetSize("50", "KB")).toBe(50 * 1024);
  });

  it("parses decimals in MB", () => {
    expect(parseTargetSize(0.5, "MB")).toBe(0.5 * 1024 * 1024);
    expect(parseTargetSize("0.5", "MB")).toBe(0.5 * 1024 * 1024);
  });

  it("tolerates pasted unit suffixes and whitespace", () => {
    expect(parseTargetSize(" 0.5MB ", "MB")).toBe(0.5 * 1024 * 1024);
    expect(parseTargetSize("50kb", "KB")).toBe(50 * 1024);
    expect(parseTargetSize("50 KB", "KB")).toBe(50 * 1024);
  });

  it("tolerates thousands separators", () => {
    expect(parseTargetSize("1,024", "KB")).toBe(1024 * 1024);
  });

  it("rejects zero, negatives, NaN and garbage", () => {
    expect(parseTargetSize(0, "KB")).toBeNull();
    expect(parseTargetSize(-100, "KB")).toBeNull();
    expect(parseTargetSize("0", "MB")).toBeNull();
    expect(parseTargetSize("-5", "KB")).toBeNull();
    expect(parseTargetSize("abc", "KB")).toBeNull();
    expect(parseTargetSize("", "KB")).toBeNull();
    expect(parseTargetSize(NaN, "KB")).toBeNull();
    expect(parseTargetSize(Infinity, "KB")).toBeNull();
    expect(parseTargetSize("NaN", "MB")).toBeNull();
  });
});

describe("formatBytes", () => {
  it("formats KB with one decimal", () => {
    expect(formatBytes(3.4 * 1024)).toBe("3.4 KB");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(48.2 * 1024)).toBe("48.2 KB");
  });

  it("formats MB with one decimal", () => {
    expect(formatBytes(1.2 * 1024 * 1024)).toBe("1.2 MB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });

  it("rounds tiny sizes to bytes", () => {
    expect(formatBytes(800)).toBe("800 B");
    expect(formatBytes(1)).toBe("1 B");
  });

  it("rounds at boundaries (511.6 B → 512 B)", () => {
    expect(formatBytes(511.6)).toBe("512 B");
    expect(formatBytes(1023.9)).toBe("1024 B"); // still under the KB threshold
    expect(formatBytes(1024 * 1024 - 1)).toBe("1024.0 KB");
  });

  it("handles invalid input", () => {
    expect(formatBytes(NaN)).toBe("0 B");
    expect(formatBytes(-5)).toBe("0 B");
  });
});

describe("nextQuality", () => {
  // Fake encoder: size grows linearly with quality.
  // size(q) = target * (0.4 + 1.2 * q)  →  hits target around q ≈ 0.5.
  const fakeSize = (q: number, target: number) => Math.round(target * (0.4 + 1.2 * q));

  it("returns the midpoint of the bracket", () => {
    expect(nextQuality(0.35, 0.92, 100, 50)).toBe(0.635);
  });

  it("converges toward the target in ≤7 iterations (monotonic fake encoder)", () => {
    const target = 50 * 1024;
    let lo = TARGET_MIN_QUALITY;
    let hi = TARGET_MAX_QUALITY;
    let q = nextQuality(lo, hi, fakeSize(hi, target), target);

    let got = 0;
    for (let i = 0; i < 7; i++) {
      got = fakeSize(q, target);
      if (got > target) hi = q;
      else lo = q;
      const within = Math.abs(got - target) / target <= TARGET_TOLERANCE;
      if (within) break;
      q = nextQuality(lo, hi, got, target);
    }
    expect(Math.abs(got - target) / target).toBeLessThanOrEqual(TARGET_TOLERANCE);
  });

  it("converges for a target where the ideal quality is low", () => {
    const target = 20 * 1024;
    let lo = TARGET_MIN_QUALITY;
    let hi = TARGET_MAX_QUALITY;
    let q = nextQuality(lo, hi, fakeSize(hi, target), target);
    let got = 0;
    for (let i = 0; i < 7; i++) {
      got = fakeSize(q, target);
      if (got > target) hi = q;
      else lo = q;
      const within = Math.abs(got - target) / target <= TARGET_TOLERANCE;
      if (within) break;
      q = nextQuality(lo, hi, got, target);
    }
    expect(Math.abs(got - target) / target).toBeLessThanOrEqual(TARGET_TOLERANCE);
  });

  it("produces qualities inside the [0, 1] range", () => {
    let lo = TARGET_MIN_QUALITY;
    let hi = TARGET_MAX_QUALITY;
    const target = 50 * 1024;
    for (let i = 0; i < 10; i++) {
      const q = nextQuality(lo, hi, fakeSize(qSafe(lo, hi), target), target);
      expect(q).toBeGreaterThan(0);
      expect(q).toBeLessThan(1);
      const got = fakeSize(q, target);
      if (got > target) hi = q;
      else lo = q;
      if (hi - lo < 1e-3) break;
    }
  });
});

// Helper so the last-but-one quality is used (keeps the loop above readable).
function qSafe(lo: number, hi: number): number {
  return (lo + hi) / 2;
}

describe("scaleForTarget", () => {
  it("returns null when the image is already under the target", () => {
    expect(scaleForTarget(40 * 1024, 50 * 1024, 1000, 800)).toBeNull();
    expect(scaleForTarget(50 * 1024, 50 * 1024, 1000, 800)).toBeNull();
  });

  it("returns null for invalid inputs", () => {
    expect(scaleForTarget(NaN, 50 * 1024, 1000, 800)).toBeNull();
    expect(scaleForTarget(100 * 1024, 0, 1000, 800)).toBeNull();
    expect(scaleForTarget(100 * 1024, 50 * 1024, 0, 800)).toBeNull();
  });

  it("scales area proportionally (1/4 bytes → 1/2 each side)", () => {
    expect(scaleForTarget(400 * 1024, 100 * 1024, 2000, 1000)).toEqual({
      width: 1000,
      height: 500,
    });
  });

  it("respects aspect ratio", () => {
    const dims = scaleForTarget(800 * 1024, 100 * 1024, 4000, 2000);
    expect(dims).not.toBeNull();
    expect(dims!.width / dims!.height).toBeCloseTo(2, 2);
  });

  it("clamps the area ratio to ≥ 0.25 (never cuts more than 75% of pixels)", () => {
    const dims = scaleForTarget(10_000 * 1024, 10 * 1024, 2000, 2000);
    expect(dims).toEqual({ width: 1000, height: 1000 });
    const areaRatio = (1000 * 1000) / (2000 * 2000);
    expect(areaRatio).toBeGreaterThanOrEqual(TARGET_MIN_AREA_RATIO);
  });

  it("never goes below the 32px minimum side", () => {
    // 40px side × 0.5 (area clamp) = 20px → clamped up to 32px.
    expect(scaleForTarget(5000, 100, 40, 40)).toEqual({
      width: TARGET_MIN_SIDE,
      height: TARGET_MIN_SIDE,
    });
    // Both sides clamp independently when aspect-scaled sizes fall below 32px.
    expect(scaleForTarget(10_000, 100, 60, 30)).toEqual({
      width: TARGET_MIN_SIDE,
      height: TARGET_MIN_SIDE,
    });
    // One side can keep a value above the floor while the other is clamped.
    expect(scaleForTarget(10_000, 100, 120, 30)).toEqual({
      width: 60,
      height: TARGET_MIN_SIDE,
    });
  });
});

describe("minimumAchievableMessage", () => {
  it("mentions the formatted target", () => {
    const msg = minimumAchievableMessage(50 * 1024);
    expect(msg).toContain("50.0 KB");
    expect(msg).toContain("minimum quality");
  });
});
