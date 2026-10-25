// Copyright (c) 2026 DevBench contributors. MIT License.
import { describe, expect, it } from "vitest";
import {
  ASPECT_PRESET_NAMES,
  ASPECT_PRESETS,
  FLIP_MATRIXES,
  MIN_CROP_PX,
  applyAspect,
  clampCropRect,
  cropRectFromCanvasDrag,
  detectOrientationWarning,
  flipPoint,
  normalizeAngle,
  resolveAspect,
  rotatedBounds,
} from "./image-geometry";

describe("ASPECT_PRESETS", () => {
  it("lists every documented preset in UI order", () => {
    expect([...ASPECT_PRESET_NAMES]).toEqual([
      "Free",
      "Original",
      "1:1",
      "4:3",
      "3:4",
      "16:9",
      "9:16",
      "3:2",
      "2:3",
    ]);
  });

  it("exposes a ratio (or null) for every preset", () => {
    for (const name of ASPECT_PRESET_NAMES) {
      const value = ASPECT_PRESETS[name];
      expect(value === null || (typeof value === "number" && Number.isFinite(value))).toBe(true);
    }
    expect(ASPECT_PRESETS["1:1"]).toBe(1);
    expect(ASPECT_PRESETS["16:9"]).toBeCloseTo(16 / 9, 10);
    expect(ASPECT_PRESETS["9:16"]).toBeCloseTo(9 / 16, 10);
    expect(ASPECT_PRESETS["Free"]).toBeNull();
  });

  it("resolveAspect resolves static ratios and the image's own ratio", () => {
    expect(resolveAspect("4:3", 100, 100)).toBeCloseTo(4 / 3, 10);
    expect(resolveAspect("Free", 800, 600)).toBeNull();
    expect(resolveAspect("Original", 800, 600)).toBeCloseTo(800 / 600, 10);
    expect(resolveAspect("Original", 0, 600)).toBeNull();
  });
});

describe("clampCropRect", () => {
  it("passes through a valid rect", () => {
    expect(clampCropRect({ x: 10, y: 20, w: 100, h: 50 }, 800, 600)).toEqual({
      x: 10,
      y: 20,
      w: 100,
      h: 50,
    });
  });

  it("clamps out-of-bounds x/y into the image", () => {
    expect(clampCropRect({ x: -50, y: -5, w: 100, h: 100 }, 800, 600)).toEqual({
      x: 0,
      y: 0,
      w: 100,
      h: 100,
    });
    expect(clampCropRect({ x: 750, y: 550, w: 100, h: 100 }, 800, 600)).toEqual({
      x: 700,
      y: 500,
      w: 100,
      h: 100,
    });
  });

  it("never lets x + w or y + h exceed the image", () => {
    const r = clampCropRect({ x: 799, y: 599, w: 500, h: 500 }, 800, 600);
    expect(r.x + r.w).toBeLessThanOrEqual(800);
    expect(r.y + r.h).toBeLessThanOrEqual(600);
  });

  it("clamps oversized w/h to the image size", () => {
    expect(clampCropRect({ x: 0, y: 0, w: 5000, h: 5000 }, 800, 600)).toEqual({
      x: 0,
      y: 0,
      w: 800,
      h: 600,
    });
  });

  it("bumps zero / negative / non-finite sizes up to the 1px minimum", () => {
    expect(clampCropRect({ x: 5, y: 5, w: 0, h: 0 }, 800, 600)).toEqual({
      x: 5,
      y: 5,
      w: MIN_CROP_PX,
      h: MIN_CROP_PX,
    });
    expect(clampCropRect({ x: 5, y: 5, w: -10, h: -10 }, 800, 600).w).toBe(MIN_CROP_PX);
    expect(clampCropRect({ x: 5, y: 5, w: NaN, h: NaN }, 800, 600)).toEqual({
      x: 5,
      y: 5,
      w: MIN_CROP_PX,
      h: MIN_CROP_PX,
    });
  });

  it("keeps a 1px rect anchored at the far edge inside the image", () => {
    expect(clampCropRect({ x: 800, y: 600, w: 1, h: 1 }, 800, 600)).toEqual({
      x: 799,
      y: 599,
      w: 1,
      h: 1,
    });
  });

  it("returns an all-zero rect for invalid image dimensions", () => {
    expect(clampCropRect({ x: 0, y: 0, w: 100, h: 100 }, 0, 0)).toEqual({ x: 0, y: 0, w: 0, h: 0 });
    expect(clampCropRect({ x: 0, y: 0, w: 100, h: 100 }, -5, 100)).toEqual({ x: 0, y: 0, w: 0, h: 0 });
    expect(clampCropRect({ x: 0, y: 0, w: 100, h: 100 }, NaN, 100)).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });
});

describe("applyAspect", () => {
  it("shrinks width when the rect is wider than a square", () => {
    // 400×200 anchored at centre (100, 50) in a 600×300 image → 200×200.
    const r = applyAspect(1, { x: 100, y: 50, w: 400, h: 200 }, 600, 300);
    expect(r).toEqual({ x: 200, y: 50, w: 200, h: 200 });
    expect(r.w / r.h).toBeCloseTo(1, 10);
  });

  it("shrinks height when the rect is taller than a square", () => {
    // centre (300, 150) → 200×200 centred on the same point.
    const r = applyAspect(1, { x: 200, y: 25, w: 200, h: 250 }, 600, 300);
    expect(r).toEqual({ x: 200, y: 50, w: 200, h: 200 });
    expect(r.w / r.h).toBeCloseTo(1, 10);
  });

  it("applies a wide ratio (16:9) by trimming height", () => {
    const r = applyAspect(16 / 9, { x: 0, y: 0, w: 900, h: 900 }, 900, 900);
    expect(r.w / r.h).toBeCloseTo(16 / 9, 6);
    expect(r.x + r.w).toBeLessThanOrEqual(900);
    expect(r.y + r.h).toBeLessThanOrEqual(900);
  });

  it("applies a tall ratio (9:16) by trimming width", () => {
    const r = applyAspect(9 / 16, { x: 0, y: 0, w: 900, h: 900 }, 900, 900);
    expect(r.w / r.h).toBeCloseTo(9 / 16, 6);
    expect(r.x + r.w).toBeLessThanOrEqual(900);
  });

  it("anchors on the rect centre", () => {
    const rect = { x: 100, y: 100, w: 300, h: 100 };
    const r = applyAspect(1, rect, 1000, 1000);
    expect(r.x + r.w / 2).toBeCloseTo(rect.x + rect.w / 2, 6);
    expect(r.y + r.h / 2).toBeCloseTo(rect.y + rect.h / 2, 6);
  });

  it("keeps the result inside the image near the edges", () => {
    const r = applyAspect(1, { x: 0, y: 0, w: 400, h: 100 }, 500, 500);
    expect(r.x).toBeGreaterThanOrEqual(0);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.x + r.w).toBeLessThanOrEqual(500);
    expect(r.y + r.h).toBeLessThanOrEqual(500);
    expect(r.w / r.h).toBeCloseTo(1, 6);
  });

  it("returns the clamped rect for a null/invalid ratio and is idempotent", () => {
    const rect = { x: 10, y: 10, w: 300, h: 200 };
    expect(applyAspect(null, rect, 800, 600)).toEqual(clampCropRect(rect, 800, 600));
    expect(applyAspect(0, rect, 800, 600)).toEqual(clampCropRect(rect, 800, 600));
    // Square result keeps exact integer coordinates, so re-applying is a no-op.
    const once = applyAspect(1, rect, 800, 600);
    expect(applyAspect(1, once, 800, 600)).toEqual(once);
  });
});

describe("cropRectFromCanvasDrag", () => {
  it("builds a rect from a forward drag", () => {
    expect(cropRectFromCanvasDrag({ x: 100, y: 100 }, { x: 300, y: 250 }, 1000, 1000)).toEqual({
      x: 100,
      y: 100,
      w: 200,
      h: 150,
    });
  });

  it("handles a negative drag (pointer up-left of the start)", () => {
    const r = cropRectFromCanvasDrag({ x: 300, y: 250 }, { x: 100, y: 100 }, 1000, 1000);
    expect(r).toEqual({ x: 100, y: 100, w: 200, h: 150 });
    expect(r.w).toBeGreaterThan(0);
    expect(r.h).toBeGreaterThan(0);
  });

  it("handles mixed-direction drags (right + up)", () => {
    const r = cropRectFromCanvasDrag({ x: 100, y: 300 }, { x: 400, y: 150 }, 1000, 1000);
    expect(r).toEqual({ x: 100, y: 150, w: 300, h: 150 });
  });

  it("respects the aspect ratio while dragging", () => {
    const r = cropRectFromCanvasDrag({ x: 0, y: 0 }, { x: 400, y: 100 }, 1000, 1000, 1);
    expect(r.w / r.h).toBeCloseTo(1, 6);
    expect(r.x).toBe(0);
    expect(r.y).toBe(0);
    // Grows to still cover the pointer on both axes.
    expect(r.w).toBeGreaterThanOrEqual(400);
    expect(r.h).toBeGreaterThanOrEqual(100);
  });

  it("clamps drags that leave the image", () => {
    const r = cropRectFromCanvasDrag({ x: 800, y: 800 }, { x: 1200, y: 900 }, 1000, 1000);
    expect(r.x + r.w).toBeLessThanOrEqual(1000);
    expect(r.y + r.h).toBeLessThanOrEqual(1000);
    expect(r.w).toBeGreaterThan(0);
  });

  it("degrades a zero-length drag to the 1px minimum", () => {
    const r = cropRectFromCanvasDrag({ x: 400, y: 400 }, { x: 400, y: 400 }, 1000, 1000);
    expect(r).toEqual({ x: 400, y: 400, w: MIN_CROP_PX, h: MIN_CROP_PX });
    const withRatio = cropRectFromCanvasDrag({ x: 400, y: 400 }, { x: 400, y: 400 }, 1000, 1000, 16 / 9);
    expect(withRatio.w).toBeGreaterThanOrEqual(MIN_CROP_PX);
    expect(withRatio.h).toBeGreaterThanOrEqual(MIN_CROP_PX);
  });
});

describe("normalizeAngle", () => {
  it("maps -90 → 270", () => {
    expect(normalizeAngle(-90)).toBe(270);
  });

  it("keeps in-range angles", () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(45)).toBe(45);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(359)).toBe(359);
  });

  it("wraps multiples of 360 and huge values", () => {
    expect(normalizeAngle(360)).toBe(0);
    expect(normalizeAngle(725)).toBe(5);
    expect(normalizeAngle(-450)).toBe(270);
    expect(normalizeAngle(-720)).toBe(0);
  });

  it("returns 0 for non-finite input", () => {
    expect(normalizeAngle(NaN)).toBe(0);
    expect(normalizeAngle(Infinity)).toBe(0);
  });

  it("always lands in [0, 360)", () => {
    for (const deg of [-1000, -361, -1, 0, 1, 359, 360, 361, 1000]) {
      const n = normalizeAngle(deg);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(360);
    }
  });
});

describe("rotatedBounds", () => {
  it("returns the same size at 0°", () => {
    expect(rotatedBounds(800, 600, 0)).toEqual({ w: 800, h: 600 });
    expect(rotatedBounds(800, 600, 360)).toEqual({ w: 800, h: 600 });
    expect(rotatedBounds(800, 600, 180)).toEqual({ w: 800, h: 600 });
  });

  it("swaps sides at 90°/270° without float creep", () => {
    expect(rotatedBounds(800, 600, 90)).toEqual({ w: 600, h: 800 });
    expect(rotatedBounds(800, 600, -90)).toEqual({ w: 600, h: 800 });
    expect(rotatedBounds(800, 600, 270)).toEqual({ w: 600, h: 800 });
  });

  it("rounds 45° up to the nearest pixel", () => {
    // 100×100 at 45° → 100·√2 ≈ 141.42 → 142
    expect(rotatedBounds(100, 100, 45)).toEqual({ w: 142, h: 142 });
    // 800×600 at 45° → (800+600)/√2 ≈ 989.95 → 990
    expect(rotatedBounds(800, 600, 45)).toEqual({ w: 990, h: 990 });
  });

  it("grows for arbitrary angles and is symmetric for ±deg", () => {
    const a = rotatedBounds(800, 600, 30);
    const b = rotatedBounds(800, 600, -30);
    expect(a).toEqual(b);
    expect(a.w).toBeGreaterThanOrEqual(800);
    expect(a.h).toBeGreaterThanOrEqual(600);
    // Both exceed the un-rotated frame.
    expect(a.w).toBeGreaterThan(800);
    expect(a.h).toBeGreaterThan(600);
  });

  it("never returns dimensions smaller than the rotated rectangle needs", () => {
    for (const deg of [0, 15, 30, 45, 60, 89, 90, 123, 180, 270, 359]) {
      const rad = (deg * Math.PI) / 180;
      const exactW = 800 * Math.abs(Math.cos(rad)) + 600 * Math.abs(Math.sin(rad));
      const exactH = 800 * Math.abs(Math.sin(rad)) + 600 * Math.abs(Math.cos(rad));
      const bounds = rotatedBounds(800, 600, deg);
      expect(bounds.w).toBeGreaterThanOrEqual(Math.floor(exactW));
      expect(bounds.h).toBeGreaterThanOrEqual(Math.floor(exactH));
      expect(bounds.w).toBeLessThanOrEqual(Math.ceil(exactW));
      expect(bounds.h).toBeLessThanOrEqual(Math.ceil(exactH));
    }
  });

  it("returns zeros for invalid input", () => {
    expect(rotatedBounds(NaN, 100, 45)).toEqual({ w: 0, h: 0 });
    expect(rotatedBounds(100, -1, 45)).toEqual({ w: 0, h: 0 });
    expect(rotatedBounds(100, 100, Infinity)).toEqual({ w: 0, h: 0 });
  });
});

describe("flip", () => {
  it("FLIP_MATRIXES mirrors the expected axis", () => {
    expect(FLIP_MATRIXES.horizontal).toEqual([-1, 0, 0, 1]);
    expect(FLIP_MATRIXES.vertical).toEqual([1, 0, 0, -1]);
  });

  it("flipPoint mirrors horizontally", () => {
    expect(flipPoint({ x: 0, y: 10 }, "horizontal", 100, 80)).toEqual({ x: 100, y: 10 });
    expect(flipPoint({ x: 100, y: 10 }, "horizontal", 100, 80)).toEqual({ x: 0, y: 10 });
    expect(flipPoint({ x: 25, y: 40 }, "horizontal", 100, 80)).toEqual({ x: 75, y: 40 });
  });

  it("flipPoint mirrors vertically", () => {
    expect(flipPoint({ x: 10, y: 0 }, "vertical", 100, 80)).toEqual({ x: 10, y: 80 });
    expect(flipPoint({ x: 10, y: 80 }, "vertical", 100, 80)).toEqual({ x: 10, y: 0 });
    expect(flipPoint({ x: 10, y: 20 }, "vertical", 100, 80)).toEqual({ x: 10, y: 60 });
  });

  it("fixes the centre and round-trips back to the original", () => {
    const centre = flipPoint({ x: 50, y: 40 }, "horizontal", 100, 80);
    expect(centre).toEqual({ x: 50, y: 40 });
    const p = { x: 30, y: 70 };
    expect(flipPoint(flipPoint(p, "horizontal", 100, 80), "horizontal", 100, 80)).toEqual(p);
    expect(flipPoint(flipPoint(p, "vertical", 100, 80), "vertical", 100, 80)).toEqual(p);
  });
});

describe("detectOrientationWarning", () => {
  it("warns about extremely wide images", () => {
    const msg = detectOrientationWarning(4000, 500);
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/wide/i);
  });

  it("warns about extremely tall images", () => {
    const msg = detectOrientationWarning(500, 4000);
    expect(msg).not.toBeNull();
    expect(msg).toMatch(/tall/i);
  });

  it("stays quiet for ordinary and square frames", () => {
    expect(detectOrientationWarning(4000, 3000)).toBeNull();
    expect(detectOrientationWarning(1000, 1000)).toBeNull();
    expect(detectOrientationWarning(500, 1999)).toBeNull(); // just inside 1:4
    expect(detectOrientationWarning(1999, 500)).toBeNull(); // just inside 4:1
  });

  it("flags invalid dimensions", () => {
    expect(detectOrientationWarning(0, 0)).not.toBeNull();
    expect(detectOrientationWarning(NaN, 100)).not.toBeNull();
    expect(detectOrientationWarning(-10, 100)).not.toBeNull();
  });
});
