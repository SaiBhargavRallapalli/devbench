// Copyright (c) 2026 DevBench contributors. MIT License.

/**
 * Pure geometry math for the Crop Image (`image-crop`) and Rotate & Flip Image
 * (`image-rotate`) tools.
 *
 * No DOM, canvas, or browser APIs — everything here is unit-testable number
 * crunching. All rectangles and points are in IMAGE pixel coordinates
 * (origin top-left, x → right, y → down), never screen/CSS pixels.
 */

/** A rectangle in image pixel space. */
export interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A point in image pixel space. */
export interface Point {
  x: number;
  y: number;
}

/** A width/height pair in pixels. */
export interface Size {
  w: number;
  h: number;
}

/** Smallest crop we will ever produce — keeps canvas/toBlob from seeing 0×0. */
export const MIN_CROP_PX = 1;

/** Aspect-ratio preset names in UI order. */
export const ASPECT_PRESET_NAMES = [
  "Free",
  "Original",
  "1:1",
  "4:3",
  "3:4",
  "16:9",
  "9:16",
  "3:2",
  "2:3",
] as const;

export type AspectPreset = (typeof ASPECT_PRESET_NAMES)[number];

/**
 * Static width/height ratio per preset (width ÷ height), or `null` for "no
 * constraint".
 *
 * "Original" has no static ratio — it always means "the source image's own
 * ratio", which depends on the image. Read presets through {@link resolveAspect}
 * instead of indexing this record directly.
 */
export const ASPECT_PRESETS: Record<AspectPreset, number | null> = {
  "Free": null,
  "Original": null,
  "1:1": 1,
  "4:3": 4 / 3,
  "3:4": 3 / 4,
  "16:9": 16 / 9,
  "9:16": 9 / 16,
  "3:2": 3 / 2,
  "2:3": 2 / 3,
};

/**
 * Resolve a preset to a concrete width÷height ratio for a given image size.
 * Returns `null` when there is no constraint ("Free", or "Original" on an
 * image with unknown/invalid dimensions).
 */
export function resolveAspect(
  preset: AspectPreset,
  imgW: number,
  imgH: number,
): number | null {
  if (preset === "Original") {
    if (!Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW <= 0 || imgH <= 0) {
      return null;
    }
    return imgW / imgH;
  }
  const ratio = ASPECT_PRESETS[preset];
  return ratio == null ? null : ratio;
}

function finiteOr(v: number, fallback: number): number {
  return Number.isFinite(v) ? v : fallback;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/**
 * Force a crop rectangle to be valid for an image of `imgW × imgH`:
 *
 * - invalid image dimensions (non-finite or `< 1px`) → `{0, 0, 0, 0}`;
 * - `w`/`h` are clamped to `[1px, image size]` (non-finite counts as 1px —
 *   a zero-size crop can never reach the canvas);
 * - `x`/`y` are clamped so the rect always sits fully inside the image
 *   (non-finite counts as 0);
 * - `x + w ≤ imgW` and `y + h ≤ imgH` always hold.
 */
export function clampCropRect(rect: CropRect, imgW: number, imgH: number): CropRect {
  if (!Number.isFinite(imgW) || !Number.isFinite(imgH) || imgW < MIN_CROP_PX || imgH < MIN_CROP_PX) {
    return { x: 0, y: 0, w: 0, h: 0 };
  }
  const w = clamp(finiteOr(rect.w, MIN_CROP_PX), MIN_CROP_PX, imgW);
  const h = clamp(finiteOr(rect.h, MIN_CROP_PX), MIN_CROP_PX, imgH);
  const x = clamp(finiteOr(rect.x, 0), 0, imgW - w);
  const y = clamp(finiteOr(rect.y, 0), 0, imgH - h);
  return { x, y, w, h };
}

/**
 * Adjust `rect` so its w÷h equals `ratio`, anchored at the rectangle's centre
 * and never growing: the result is the largest rectangle of the target ratio
 * that fits inside the current one (so it is always still inside the image
 * after clamping). `null`/invalid ratios return the rect clamped unchanged.
 *
 * Applying the same ratio twice is a no-op the second time.
 */
export function applyAspect(
  ratio: number | null,
  rect: CropRect,
  imgW: number,
  imgH: number,
): CropRect {
  const base = clampCropRect(rect, imgW, imgH);
  if (
    ratio == null ||
    !Number.isFinite(ratio) ||
    ratio <= 0 ||
    base.w < MIN_CROP_PX ||
    base.h < MIN_CROP_PX
  ) {
    return base;
  }

  // Too wide for the ratio → shrink width; otherwise shrink height.
  let w = base.w;
  let h = base.h;
  if (w / h >= ratio) {
    w = h * ratio;
  } else {
    h = w / ratio;
  }

  const cx = base.x + base.w / 2;
  const cy = base.y + base.h / 2;
  return clampCropRect({ x: cx - w / 2, y: cy - h / 2, w, h }, imgW, imgH);
}

/**
 * Marquee/resize drag math: build the rect between a fixed anchor `start`
 * (where the pointer went down — or the rectangle's opposite corner when
 * resizing a handle) and the live `current` pointer position.
 *
 * - negative drags (pointer up/left of the anchor) still produce positive
 *   `w`/`h`, with the rect on the correct side of the anchor;
 * - with a `ratio`, the rect is grown so it still covers the pointer on both
 *   axes, then anchored and clamped to the image;
 * - a zero-length drag clamps to a 1×1 crop at the anchor.
 */
export function cropRectFromCanvasDrag(
  start: Point,
  current: Point,
  imgW: number,
  imgH: number,
  ratio?: number | null,
): CropRect {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  let w = Math.abs(dx);
  let h = Math.abs(dy);

  const r = ratio != null && Number.isFinite(ratio) && ratio > 0 ? ratio : null;
  if (r != null) {
    // Grow the shorter axis so the rect reaches the pointer on both axes.
    // (0/0 → NaN → falls into the else branch and stays 0, then clamps to 1px.)
    if (w / h > r) {
      h = w / r;
    } else {
      w = h * r;
    }
  }

  const x = dx >= 0 ? start.x : start.x - w;
  const y = dy >= 0 ? start.y : start.y - h;
  return clampCropRect({ x, y, w, h }, imgW, imgH);
}

/** Normalise any angle to `[0, 360)`. Non-finite input → `0`. */
export function normalizeAngle(deg: number): number {
  if (!Number.isFinite(deg)) return 0;
  return ((deg % 360) + 360) % 360;
}

/**
 * Axis-aligned bounding-box size of a `w × h` rectangle rotated by `deg`
 * (degrees, either direction). Returns integers rounded **up** (so the output
 * canvas never clips the rotated corners) — fractional inputs are fine.
 * Invalid input → `{w: 0, h: 0}`.
 */
export function rotatedBounds(w: number, h: number, deg: number): Size {
  if (
    !Number.isFinite(w) ||
    !Number.isFinite(h) ||
    w < 0 ||
    h < 0 ||
    !Number.isFinite(deg)
  ) {
    return { w: 0, h: 0 };
  }
  const rad = (normalizeAngle(deg) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const bw = w * cos + h * sin;
  const bh = w * sin + h * cos;
  // Subtract a hair so floating-point noise at exact 90° multiples
  // (cos(90°) ≈ 6.1e-17) cannot round a whole number up by 1px.
  const EPS = 1e-9;
  return {
    w: Math.max(0, Math.ceil(bw - EPS)),
    h: Math.max(0, Math.ceil(bh - EPS)),
  };
}

/** Flip directions supported by the rotate tool. */
export type FlipDirection = "horizontal" | "vertical";

/**
 * 2×2 linear transform `[a, b, c, d]` (canvas `ctx.transform` convention:
 * `x' = a·x + c·y`, `y' = b·x + d·y`) mirroring about the origin — no
 * translation included. To flip inside a `w × h` box, translate first:
 * `ctx.translate(w, 0)` + horizontal, `ctx.translate(0, h)` + vertical.
 */
export const FLIP_MATRIXES: Record<FlipDirection, readonly [number, number, number, number]> = {
  horizontal: [-1, 0, 0, 1],
  vertical: [1, 0, 0, -1],
};

/**
 * Mirror a point inside a `imgW × imgH` box. Corners map to corners;
 * the centre maps to itself.
 */
export function flipPoint(p: Point, direction: FlipDirection, imgW: number, imgH: number): Point {
  if (direction === "horizontal") {
    return { x: imgW - p.x, y: p.y };
  }
  return { x: p.x, y: imgH - p.y };
}

/**
 * Heuristic hint for images whose frame suggests a rotation would change the
 * shape dramatically (very wide panoramas / very tall strips). Returns
 * user-facing copy, or `null` when nothing looks off. Invalid dimensions get
 * a warning too, so callers can surface it right after an upload.
 */
export function detectOrientationWarning(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 1 || height < 1) {
    return "Image dimensions look invalid — try re-uploading the image.";
  }
  const ratio = width / height;
  if (ratio >= 4) {
    return "This image is extremely wide — rotating it 90° will produce a very tall, narrow image.";
  }
  if (ratio <= 0.25) {
    return "This image is extremely tall — rotating it 90° will produce a very wide, short image.";
  }
  return null;
}
