/**
 * Pure geometry for the Signature Maker tool — no canvas, no DOM, so it stays
 * unit-testable. Rendering/export lives in the component.
 */

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  points: Point[];
  /** Pen width in canvas px. */
  width: number;
  /** CSS color (e.g. "#111111"). */
  color: string;
}

export interface BBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

const EMPTY_BBOX: BBox = { x: 0, y: 0, w: 0, h: 0 };

function dist(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Resample a polyline to `n ≈ pathLength / step` evenly spaced points along the
 * arc length. The original last point is appended verbatim so the stroke still
 * ends exactly where the user lifted the pen.
 */
export function resamplePoints(points: Point[], step: number): Point[] {
  if (points.length === 0) return [];
  if (points.length === 1 || !Number.isFinite(step) || step <= 0) {
    return points.map((p) => ({ ...p }));
  }
  // Cumulative arc length at each vertex.
  const cum: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
  }
  const length = cum[cum.length - 1];
  if (length === 0) return [{ ...points[0] }];

  const n = Math.max(1, Math.round(length / step));
  const out: Point[] = [];
  let seg = 0;
  for (let i = 0; i < n; i++) {
    const d = (i * length) / n;
    while (seg < points.length - 2 && cum[seg + 1] < d) seg++;
    const a = points[seg];
    const b = points[seg + 1];
    const segLen = cum[seg + 1] - cum[seg];
    const t = segLen > 0 ? (d - cum[seg]) / segLen : 0;
    out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  out.push({ ...points[points.length - 1] });
  return out;
}

/**
 * Moving-average smoothing (window 3). Endpoints are kept as-is so the line
 * still starts/ends exactly where the user drew it. Output length always equals
 * input length.
 */
export function smoothPoints(points: Point[]): Point[] {
  if (points.length <= 2) return points.map((p) => ({ ...p }));
  const out: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1];
    const b = points[i];
    const c = points[i + 1];
    out.push({ x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 });
  }
  out.push(points[points.length - 1]);
  return out;
}

/** Axis-aligned bounds of one stroke's points. Empty stroke → zero rect. */
export function strokeBBox(stroke: Stroke): BBox {
  const pts = stroke?.points ?? [];
  if (pts.length === 0) return { ...EMPTY_BBOX };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Union of all stroke bounds, padded by the pen thickness (half the max stroke
 * width on each side, i.e. padded by up to the max width in total) so the round
 * line caps/joins are fully inside the rect.
 * No strokes (or only empty strokes) → zero rect.
 */
export function strokesBBox(strokes: Stroke[]): BBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxWidth = 0;
  let any = false;
  for (const stroke of strokes) {
    if (!stroke?.points?.length) continue;
    const b = strokeBBox(stroke);
    any = true;
    if (b.x < minX) minX = b.x;
    if (b.y < minY) minY = b.y;
    if (b.x + b.w > maxX) maxX = b.x + b.w;
    if (b.y + b.h > maxY) maxY = b.y + b.h;
    if (stroke.width > maxWidth) maxWidth = stroke.width;
  }
  if (!any) return { ...EMPTY_BBOX };
  const pad = maxWidth / 2;
  minX -= pad;
  minY -= pad;
  maxX += pad;
  maxY += pad;
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

/**
 * Crop rect for a transparent-trim export: `bbox` expanded by `padPx` and
 * clamped inside the `w × h` source. Result is always ≥1px and inside bounds.
 */
export function trimToContent(
  w: number,
  h: number,
  bbox: BBox,
  padPx: number,
): { sx: number; sy: number; sw: number; sh: number } {
  const pad = Math.max(0, padPx);
  const maxX = Math.max(0, w);
  const maxY = Math.max(0, h);
  let sx = Math.min(Math.max(bbox.x - pad, 0), Math.max(0, maxX - 1));
  let sy = Math.min(Math.max(bbox.y - pad, 0), Math.max(0, maxY - 1));
  const ex = Math.min(Math.max(bbox.x + bbox.w + pad, sx), maxX);
  const ey = Math.min(Math.max(bbox.y + bbox.h + pad, sy), maxY);
  const sw = Math.max(1, ex - sx);
  const sh = Math.max(1, ey - sy);
  if (sx + sw > maxX) sx = Math.max(0, maxX - sw);
  if (sy + sh > maxY) sy = Math.max(0, maxY - sh);
  return { sx, sy, sw, sh };
}

export interface SignatureSize {
  id: string;
  label: string;
  wMm: number;
  hMm: number;
}

export const SIGNATURE_SIZES: SignatureSize[] = [
  { id: "standard-60x20", label: "Standard 60×20mm", wMm: 60, hMm: 20 },
  { id: "compact-50x20", label: "Compact 50×20mm", wMm: 50, hMm: 20 },
  { id: "narrow-70x15", label: "Narrow 70×15mm", wMm: 70, hMm: 15 },
  { id: "small-40x15", label: "Small 40×15mm", wMm: 40, hMm: 15 },
];

/** Millimetres → pixels at `dpi` (default 300 for print-quality exports). */
export function mmToPx(mm: number, dpi = 300): number {
  return Math.round((mm / 25.4) * dpi);
}

/** Absolute cap so a small drawing blown up to a preset never turns to mush. */
export const MAX_EXPORT_UPSCALE = 4;

/**
 * Scale factor that maps `bbox` onto `targetPxW` (downscale freely, upscale is
 * capped at MAX_EXPORT_UPSCALE so tiny drawings stay crisp on print).
 * Degenerate inputs return 1.
 */
export function signatureExportScale(bbox: BBox, targetPxW: number): number {
  if (!bbox.w || !Number.isFinite(bbox.w) || !Number.isFinite(targetPxW) || targetPxW <= 0) {
    return 1;
  }
  const scale = targetPxW / bbox.w;
  if (!Number.isFinite(scale) || scale <= 0) return 1;
  return Math.min(scale, MAX_EXPORT_UPSCALE);
}

/** Average glyph advance factor used for fitting typed signatures. */
function avgCharWidthFactor(fontFamily: string): number {
  // Script/handwriting stacks run a touch wider than the neutral 0.5 estimate.
  return /script|hand|brush|comic|chalk/i.test(fontFamily) ? 0.56 : 0.5;
}

/**
 * Font size for a typed signature that must fit inside `targetW × targetH`.
 * Width estimate: chars × fontSize × avgCharWidthFactor; start at the tallest
 * size that fits the height and shrink until the width fits.
 */
export function typedSignatureLayout(
  text: string,
  fontFamily: string,
  targetW: number,
  targetH: number,
): { fontSize: number; avgCharWidth: number } {
  const chars = Math.max(1, text.trim().length);
  const factor = avgCharWidthFactor(fontFamily);
  const maxSize = Math.max(1, Math.min(targetW, targetH));
  const fitForWidth = targetW / (chars * factor);
  const fontSize = Math.max(4, Math.min(maxSize, fitForWidth));
  return { fontSize, avgCharWidth: fontSize * factor };
}
