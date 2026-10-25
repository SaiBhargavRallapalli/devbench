import { describe, expect, it } from "vitest";
import {
  MAX_EXPORT_UPSCALE,
  SIGNATURE_SIZES,
  mmToPx,
  resamplePoints,
  signatureExportScale,
  smoothPoints,
  strokeBBox,
  strokesBBox,
  trimToContent,
  typedSignatureLayout,
  type Stroke,
} from "./signature";

function stroke(points: Array<{ x: number; y: number }>, width = 4): Stroke {
  return { points, width, color: "#111111" };
}

describe("strokeBBox", () => {
  it("returns a zero rect for an empty stroke", () => {
    expect(strokeBBox(stroke([]))).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it("computes the axis-aligned bounds", () => {
    const b = strokeBBox(stroke([{ x: 10, y: 20 }, { x: 40, y: 8 }, { x: 25, y: 60 }]));
    expect(b).toEqual({ x: 10, y: 8, w: 30, h: 52 });
  });
});

describe("strokesBBox", () => {
  it("returns a zero rect for no strokes / only empty strokes", () => {
    expect(strokesBBox([])).toEqual({ x: 0, y: 0, w: 0, h: 0 });
    expect(strokesBBox([stroke([])])).toEqual({ x: 0, y: 0, w: 0, h: 0 });
  });

  it("unions strokes and pads by half the max pen width per side", () => {
    const a = stroke([{ x: 0, y: 0 }, { x: 10, y: 10 }], 4);
    const b = stroke([{ x: 30, y: 20 }, { x: 50, y: 40 }], 8);
    const box = strokesBBox([a, b]);
    // Union of raw bounds = (0,0)-(50,40); pad = max width (8) / 2 = 4.
    expect(box).toEqual({ x: -4, y: -4, w: 58, h: 48 });
  });
});

describe("trimToContent", () => {
  it("expands the bbox by padPx", () => {
    const r = trimToContent(100, 100, { x: 40, y: 40, w: 20, h: 20 }, 5);
    expect(r).toEqual({ sx: 35, sy: 35, sw: 30, sh: 30 });
  });

  it("clamps to the canvas bounds", () => {
    // Overflows bottom-right corner → clamped to the canvas edge.
    expect(trimToContent(100, 100, { x: 90, y: 90, w: 40, h: 40 }, 10)).toEqual({
      sx: 80,
      sy: 80,
      sw: 20,
      sh: 20,
    });
    // Overflows top-left → clamped to 0.
    expect(trimToContent(100, 100, { x: -10, y: -10, w: 20, h: 20 }, 5)).toEqual({
      sx: 0,
      sy: 0,
      sw: 15,
      sh: 15,
    });
  });

  it("always returns at least 1px and stays inside the source", () => {
    const r = trimToContent(100, 100, { x: 200, y: 200, w: 10, h: 10 }, 5);
    expect(r.sw).toBeGreaterThanOrEqual(1);
    expect(r.sh).toBeGreaterThanOrEqual(1);
    expect(r.sx + r.sw).toBeLessThanOrEqual(100);
    expect(r.sy + r.sh).toBeLessThanOrEqual(100);
  });
});

describe("SIGNATURE_SIZES / mmToPx", () => {
  it("has four presets with unique ids", () => {
    expect(SIGNATURE_SIZES).toHaveLength(4);
    expect(new Set(SIGNATURE_SIZES.map((s) => s.id)).size).toBe(4);
    for (const s of SIGNATURE_SIZES) {
      expect(s.wMm).toBeGreaterThan(0);
      expect(s.hMm).toBeGreaterThan(0);
      expect(s.label).toContain(`${s.wMm}×${s.hMm}mm`);
    }
  });

  it("converts mm to px at 300 DPI", () => {
    expect(mmToPx(20, 300)).toBe(236); // 20/25.4*300 = 236.2
    expect(mmToPx(25.4, 300)).toBe(300);
    expect(mmToPx(60, 300)).toBe(709);
    // 96 DPI base works too.
    expect(mmToPx(25.4, 96)).toBe(96);
  });
});

describe("signatureExportScale", () => {
  it("scales down to fit the target width", () => {
    expect(signatureExportScale({ x: 0, y: 0, w: 400, h: 100 }, 200)).toBeCloseTo(0.5, 6);
  });

  it("never upscales beyond 4×", () => {
    expect(signatureExportScale({ x: 0, y: 0, w: 50, h: 20 }, 709)).toBe(MAX_EXPORT_UPSCALE);
    expect(MAX_EXPORT_UPSCALE).toBe(4);
  });

  it("returns 1 for degenerate input", () => {
    expect(signatureExportScale({ x: 0, y: 0, w: 0, h: 0 }, 500)).toBe(1);
    expect(signatureExportScale({ x: 0, y: 0, w: 100, h: 20 }, 0)).toBe(1);
  });
});

describe("typedSignatureLayout", () => {
  const family = '"Segoe Script", cursive';

  it("shrinks the font size as text gets longer", () => {
    const short = typedSignatureLayout("AB", family, 600, 180);
    const medium = typedSignatureLayout("Albert Einstein", family, 600, 180);
    const long = typedSignatureLayout(
      "Bartholomew Fitzgerald Wellington the Third",
      family,
      600,
      180,
    );
    expect(short.fontSize).toBeGreaterThanOrEqual(medium.fontSize);
    expect(medium.fontSize).toBeGreaterThan(long.fontSize);
    // The fitted width estimate never exceeds the target box.
    expect(long.avgCharWidth * "Bartholomew Fitzgerald Wellington the Third".trim().length)
      .toBeLessThanOrEqual(600 + long.fontSize);
  });

  it("keeps short text within the available height", () => {
    const { fontSize } = typedSignatureLayout("Sam", family, 600, 180);
    expect(fontSize).toBeLessThanOrEqual(180);
    expect(fontSize).toBeGreaterThanOrEqual(4);
  });

  it("always returns a positive size even for empty/absurd input", () => {
    const { fontSize } = typedSignatureLayout("   ", family, 600, 180);
    expect(fontSize).toBeGreaterThanOrEqual(4);
    const huge = typedSignatureLayout("x".repeat(500), family, 600, 180);
    expect(huge.fontSize).toBeGreaterThanOrEqual(4);
  });
});

describe("resamplePoints / smoothPoints", () => {
  it("resamples a straight line to uniform spacing", () => {
    const pts = resamplePoints([{ x: 0, y: 0 }, { x: 100, y: 0 }], 10);
    expect(pts.length).toBe(11);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[10]).toEqual({ x: 100, y: 0 });
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].x - pts[i - 1].x).toBeCloseTo(10, 5);
    }
  });

  it("keeps degenerate inputs intact", () => {
    expect(resamplePoints([], 5)).toEqual([]);
    expect(resamplePoints([{ x: 1, y: 2 }], 5)).toEqual([{ x: 1, y: 2 }]);
    expect(resamplePoints([{ x: 1, y: 2 }, { x: 3, y: 4 }], 0)).toEqual([
      { x: 1, y: 2 },
      { x: 3, y: 4 },
    ]);
  });

  it("smoothPoints preserves array length and endpoints", () => {
    const jitter = [
      { x: 0, y: 0 },
      { x: 10, y: 6 },
      { x: 20, y: -4 },
      { x: 30, y: 5 },
      { x: 40, y: 0 },
    ];
    const smoothed = smoothPoints(jitter);
    expect(smoothed.length).toBe(jitter.length);
    expect(smoothed[0]).toEqual(jitter[0]);
    expect(smoothed[smoothed.length - 1]).toEqual(jitter[jitter.length - 1]);
    // Interior point is the average of its window.
    expect(smoothed[1]).toEqual({ x: 10, y: (0 + 6 + -4) / 3 });
    // Smoothing reduces total vertical jitter.
    const total = (arr: Array<{ y: number }>) =>
      arr.slice(1).reduce((acc, p, i) => acc + Math.abs(p.y - arr[i].y), 0);
    expect(total(smoothed)).toBeLessThan(total(jitter));
    // Tiny inputs pass through as copies.
    expect(smoothPoints([])).toEqual([]);
    expect(smoothPoints([{ x: 5, y: 5 }])).toEqual([{ x: 5, y: 5 }]);
  });
});
