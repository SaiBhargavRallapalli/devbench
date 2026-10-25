/**
 * Pure math for physical image sizing (px ↔ cm / mm / inches at a given DPI)
 * plus passport-photo frame fitting and A4 print-sheet packing.
 * No DOM access — safe for unit tests and reuse across tools.
 */

/** CSS reference pixel: 1 inch = 96 px on screen. */
export const PX_PER_INCH = 96;

export type PhysicalUnit = "px" | "cm" | "mm" | "in";

export const DPI_PRESETS = [72, 96, 150, 300, 600];

const MM_PER_INCH = 25.4;
const CM_PER_INCH = 2.54;

function safeDpi(dpi: number): number {
  return Number.isFinite(dpi) && dpi > 0 ? dpi : PX_PER_INCH;
}

/**
 * Convert a length in the given unit to whole pixels at `dpi`.
 * Rounded to an integer and clamped to ≥ 1 (canvas dimensions must be positive).
 */
export function toPixels(value: number, unit: PhysicalUnit, dpi: number): number {
  if (!Number.isFinite(value)) return 1;
  const d = safeDpi(dpi);
  let px: number;
  switch (unit) {
    case "cm":
      px = (value / CM_PER_INCH) * d;
      break;
    case "mm":
      px = (value / MM_PER_INCH) * d;
      break;
    case "in":
      px = value * d;
      break;
    default:
      px = value;
  }
  return Math.max(1, Math.round(px));
}

/**
 * Convert pixels back to a display length in the given unit at `dpi`.
 * Returns a float (callers round for display). Invalid input → 0.
 */
export function fromPixels(px: number, unit: PhysicalUnit, dpi: number): number {
  if (!Number.isFinite(px) || px <= 0) return 0;
  const d = safeDpi(dpi);
  switch (unit) {
    case "cm":
      return (px / d) * CM_PER_INCH;
    case "mm":
      return (px / d) * MM_PER_INCH;
    case "in":
      return px / d;
    default:
      return px;
  }
}

export interface Dims {
  w: number;
  h: number;
}

/** The same pixel dimensions expressed in cm / mm / inches — for live cross-unit display. */
export function equivalentDims(
  px: number,
  py: number,
  dpi: number
): { cm: Dims; mm: Dims; in: Dims } {
  return {
    cm: { w: fromPixels(px, "cm", dpi), h: fromPixels(py, "cm", dpi) },
    mm: { w: fromPixels(px, "mm", dpi), h: fromPixels(py, "mm", dpi) },
    in: { w: fromPixels(px, "in", dpi), h: fromPixels(py, "in", dpi) },
  };
}

export interface PassportPreset {
  id: string;
  label: string;
  wMm: number;
  hMm: number;
  /** Commonly required background for this country, if any. */
  bg?: string;
}

/** Real-world passport / ID photo sizes. `custom` is the editable fallback. */
export const PASSPORT_PRESETS: PassportPreset[] = [
  { id: "us", label: "United States (2×2 in)", wMm: 50.8, hMm: 50.8 },
  { id: "canada", label: "Canada (2×2 in)", wMm: 50.8, hMm: 50.8 },
  { id: "india", label: "India (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "schengen", label: "Schengen / EU (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "uk", label: "United Kingdom (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "china", label: "China (33×48 mm)", wMm: 33, hMm: 48, bg: "#ffffff" },
  { id: "japan", label: "Japan (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "australia", label: "Australia (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "russia", label: "Russia (35×45 mm)", wMm: 35, hMm: 45, bg: "#ffffff" },
  { id: "pakistan", label: "Pakistan (35×45 mm)", wMm: 35, hMm: 45, bg: "#dbeafe" },
  { id: "bangladesh", label: "Bangladesh (45×55 mm)", wMm: 45, hMm: 55, bg: "#ffffff" },
  { id: "custom", label: "Custom size", wMm: 35, hMm: 45 },
];

export type FitMode = "contain" | "cover";

export interface FitResult {
  /** Drawn size of the source image, in target-frame pixels. */
  width: number;
  height: number;
  /** Centered offset of the drawn image inside the target frame (may be negative for "cover"). */
  offsetX: number;
  offsetY: number;
  scale: number;
}

/**
 * Fit a source image into an exact-size frame.
 * - "contain": whole photo visible, letterboxed inside the frame (offsets ≥ 0).
 * - "cover": photo fills the frame and is cropped (offsets ≤ 0).
 * Offsets center the image both ways. Pure geometry — no background cutout magic.
 */
export function fitToFrame(
  srcW: number,
  srcH: number,
  targetW: number,
  targetH: number,
  mode: FitMode
): FitResult {
  if (
    !Number.isFinite(srcW) || !Number.isFinite(srcH) || srcW < 1 || srcH < 1 ||
    !Number.isFinite(targetW) || !Number.isFinite(targetH) || targetW < 1 || targetH < 1
  ) {
    return { width: Math.max(1, Math.round(targetW)), height: Math.max(1, Math.round(targetH)), offsetX: 0, offsetY: 0, scale: 1 };
  }
  const scale = mode === "cover"
    ? Math.max(targetW / srcW, targetH / srcH)
    : Math.min(targetW / srcW, targetH / srcH);
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));
  const offsetX = Math.round((targetW - width) / 2);
  const offsetY = Math.round((targetH - height) / 2);
  return { width, height, offsetX, offsetY, scale };
}

/** A4 sheet at 200 DPI (common inkjet print resolution). */
export const A4_SHEET_200DPI: Dims = { w: 1654, h: 2339 };

export interface SheetPosition {
  index: number;
  x: number;
  y: number;
}

/**
 * Simple grid packing of identical photos onto a print sheet.
 * Keeps a `gap` margin on all sides (white surround) and between photos.
 * Returns at most as many positions as physically fit on the sheet.
 */
export function sheetLayout(
  copies: number,
  sheetW: number,
  sheetH: number,
  photoW: number,
  photoH: number,
  gap: number
): SheetPosition[] {
  if (
    !Number.isFinite(copies) || copies < 1 ||
    !Number.isFinite(photoW) || photoW < 1 ||
    !Number.isFinite(photoH) || photoH < 1 ||
    !Number.isFinite(sheetW) || sheetW < photoW ||
    !Number.isFinite(sheetH) || sheetH < photoH
  ) {
    return [];
  }
  const g = Math.max(0, gap);
  const cols = Math.max(1, Math.floor((sheetW + g) / (photoW + g)));
  const rows = Math.max(1, Math.floor((sheetH + g) / (photoH + g)));
  const n = Math.min(Math.floor(copies), cols * rows);
  const positions: SheetPosition[] = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols;
    const r = Math.floor(i / cols);
    positions.push({
      index: i,
      x: Math.round(g + c * (photoW + g)),
      y: Math.round(g + r * (photoH + g)),
    });
  }
  return positions;
}
