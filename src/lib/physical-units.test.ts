import { describe, expect, it } from "vitest";
import {
  A4_SHEET_200DPI,
  DPI_PRESETS,
  PASSPORT_PRESETS,
  PX_PER_INCH,
  equivalentDims,
  fitToFrame,
  fromPixels,
  sheetLayout,
  toPixels,
} from "./physical-units";

describe("toPixels / fromPixels", () => {
  it("uses 96 px per inch as the screen reference", () => {
    expect(PX_PER_INCH).toBe(96);
    expect(toPixels(1, "in", 96)).toBe(96);
  });

  it("converts 3.5cm to 413px at 300dpi (round-trip)", () => {
    const px = toPixels(3.5, "cm", 300);
    expect(px).toBe(413);
    // round-trip back to cm lands within half a pixel's worth of cm
    expect(fromPixels(px, "cm", 300)).toBeCloseTo(3.5, 2);
  });

  it("converts mm and inches consistently", () => {
    expect(toPixels(25.4, "mm", 300)).toBe(300);
    expect(toPixels(2, "in", 300)).toBe(600);
    expect(fromPixels(600, "in", 300)).toBe(2);
    expect(fromPixels(300, "mm", 300)).toBeCloseTo(25.4, 6);
  });

  it("passes px through untouched regardless of dpi", () => {
    expect(toPixels(1234, "px", 300)).toBe(1234);
    expect(fromPixels(1234, "px", 72)).toBe(1234);
  });

  it("always returns an integer ≥ 1", () => {
    expect(toPixels(0.01, "mm", 72)).toBeGreaterThanOrEqual(1);
    expect(Number.isInteger(toPixels(0.003, "in", 72))).toBe(true);
    expect(toPixels(Number.NaN, "cm", 300)).toBe(1);
  });

  it("returns 0 from fromPixels for invalid input", () => {
    expect(fromPixels(Number.NaN, "cm", 300)).toBe(0);
    expect(fromPixels(-5, "cm", 300)).toBe(0);
  });

  it("has sane DPI presets", () => {
    expect(DPI_PRESETS).toEqual([72, 96, 150, 300, 600]);
  });
});

describe("equivalentDims", () => {
  it("expresses the same pixel box in cm / mm / in", () => {
    const d = equivalentDims(413, 531, 300);
    expect(d.cm.w).toBeCloseTo(3.5, 1);
    expect(d.cm.h).toBeCloseTo(4.5, 1);
    expect(d.mm.w).toBeCloseTo(35, 0);
    expect(d.mm.h).toBeCloseTo(45, 0);
    expect(d.in.w).toBeCloseTo(1.377, 2);
    expect(d.in.h).toBeCloseTo(1.77, 2);
  });
});

describe("PASSPORT_PRESETS", () => {
  it("has at least 10 entries with unique ids and positive dimensions", () => {
    expect(PASSPORT_PRESETS.length).toBeGreaterThanOrEqual(10);
    const ids = PASSPORT_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PASSPORT_PRESETS) {
      expect(p.wMm).toBeGreaterThan(0);
      expect(p.hMm).toBeGreaterThan(0);
      expect(p.label.length).toBeGreaterThan(0);
    }
  });

  it("includes real-world sizes", () => {
    const us = PASSPORT_PRESETS.find((p) => p.id === "us");
    expect(us).toMatchObject({ wMm: 50.8, hMm: 50.8 }); // 2×2 in
    const india = PASSPORT_PRESETS.find((p) => p.id === "india");
    expect(india).toMatchObject({ wMm: 35, hMm: 45, bg: "#ffffff" });
    const china = PASSPORT_PRESETS.find((p) => p.id === "china");
    expect(china).toMatchObject({ wMm: 33, hMm: 48 });
    const bangladesh = PASSPORT_PRESETS.find((p) => p.id === "bangladesh");
    expect(bangladesh).toMatchObject({ wMm: 45, hMm: 55 });
    expect(PASSPORT_PRESETS.some((p) => p.id === "custom")).toBe(true);
  });
});

describe("fitToFrame", () => {
  it("contain: letterboxes a landscape photo inside a square frame", () => {
    const r = fitToFrame(800, 600, 400, 400, "contain");
    expect(r.scale).toBeCloseTo(0.5, 6);
    expect(r.width).toBe(400);
    expect(r.height).toBe(300);
    expect(r.offsetX).toBe(0);
    expect(r.offsetY).toBe(50); // centered vertically
  });

  it("contain: portrait source in a wider frame centers horizontally", () => {
    const r = fitToFrame(300, 600, 400, 400, "contain");
    expect(r.width).toBe(200);
    expect(r.height).toBe(400);
    expect(r.offsetX).toBe(100);
    expect(r.offsetY).toBe(0);
  });

  it("cover: fills the frame and crops with negative centered offsets", () => {
    const r = fitToFrame(900, 600, 400, 400, "cover");
    expect(r.width).toBe(600);
    expect(r.height).toBe(400);
    expect(r.offsetX).toBe(-100);
    expect(r.offsetY).toBe(0);
  });

  it("already-correct aspect leaves the photo exactly in frame", () => {
    const contain = fitToFrame(413, 531, 413, 531, "contain");
    expect(contain).toMatchObject({ width: 413, height: 531, offsetX: 0, offsetY: 0 });
    const cover = fitToFrame(413, 531, 413, 531, "cover");
    expect(cover).toMatchObject({ width: 413, height: 531, offsetX: 0, offsetY: 0 });
  });

  it("rounding never overflows past the frame bounds by more than 1px", () => {
    const r = fitToFrame(1001, 997, 413, 531, "contain");
    expect(r.width).toBeLessThanOrEqual(414);
    expect(r.height).toBeLessThanOrEqual(532);
    expect(r.offsetX + r.width).toBeLessThanOrEqual(414);
    expect(r.offsetY + r.height).toBeLessThanOrEqual(532);
  });

  it("degenerate input falls back to the target frame", () => {
    const r = fitToFrame(0, 0, 400, 300, "contain");
    expect(r).toMatchObject({ width: 400, height: 300, offsetX: 0, offsetY: 0 });
  });
});

describe("sheetLayout", () => {
  it("packs a 4×6 grid of 413×531 photos on A4 with gaps", () => {
    const positions = sheetLayout(999, A4_SHEET_200DPI.w, A4_SHEET_200DPI.h, 413, 531, 16);
    // A4 @200dpi: fits 3 across (3×413 + margins) and 4 down
    expect(positions.length).toBeGreaterThanOrEqual(8);
    expect(positions.length).toBeLessThan(999); // capped by what fits
  });

  it("returns no more than the requested number of copies", () => {
    const positions = sheetLayout(3, A4_SHEET_200DPI.w, A4_SHEET_200DPI.h, 413, 531, 16);
    expect(positions).toHaveLength(3);
    expect(positions.map((p) => p.index)).toEqual([0, 1, 2]);
  });

  it("positions never overlap and stay inside the sheet", () => {
    const photoW = 378; // 45mm @200dpi
    const photoH = 472; // 55mm @200dpi
    const gap = 32; // 4mm @200dpi
    const positions = sheetLayout(999, A4_SHEET_200DPI.w, A4_SHEET_200DPI.h, photoW, photoH, gap);
    expect(positions.length).toBeGreaterThan(1);
    for (const p of positions) {
      expect(p.x).toBeGreaterThanOrEqual(gap);
      expect(p.y).toBeGreaterThanOrEqual(gap);
      expect(p.x + photoW).toBeLessThanOrEqual(A4_SHEET_200DPI.w);
      expect(p.y + photoH).toBeLessThanOrEqual(A4_SHEET_200DPI.h);
    }
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const overlapX = a.x < b.x + photoW && b.x < a.x + photoW;
        const overlapY = a.y < b.y + photoH && b.y < a.y + photoH;
        expect(overlapX && overlapY).toBe(false);
      }
    }
  });

  it("returns [] for impossible requests", () => {
    expect(sheetLayout(0, 1000, 1000, 100, 100, 10)).toEqual([]);
    expect(sheetLayout(5, 50, 1000, 100, 100, 10)).toEqual([]); // photo wider than sheet
    expect(sheetLayout(Number.NaN, 1000, 1000, 100, 100, 10)).toEqual([]);
  });
});
