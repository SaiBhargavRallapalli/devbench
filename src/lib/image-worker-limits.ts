/**
 * Decode/output caps for the blob image worker — keep in sync with `image-worker.ts` (inlined script).
 */

export const IMAGE_WORKER_MAX_SIDE = 16384;
export const IMAGE_WORKER_MAX_PIXELS = 50_000_000;

const MP = Math.round(IMAGE_WORKER_MAX_PIXELS / 1_000_000);

/** Shown on compressor / resizer tool pages */
export const IMAGE_WORKER_LIMITS_HELP =
  `For stability, images are capped at ${IMAGE_WORKER_MAX_SIDE.toLocaleString()}px per side and about ${MP} megapixels total (~${IMAGE_WORKER_MAX_PIXELS.toLocaleString()} pixels).`;

/** Worker-style message when decoded bitmap is too large */
export function rejectInputImageDimensions(w: number, h: number): string | null {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    return "Invalid image dimensions.";
  }
  if (w > IMAGE_WORKER_MAX_SIDE || h > IMAGE_WORKER_MAX_SIDE) {
    return `Image exceeds safe limits (${IMAGE_WORKER_MAX_SIDE.toLocaleString()}px per side, max ~${MP}MP).`;
  }
  if (w * h > IMAGE_WORKER_MAX_PIXELS) {
    return `Image has too many pixels (max ~${MP}MP).`;
  }
  return null;
}

/** Matches worker message when resize target is too large */
export function rejectOutputDimensions(w: number, h: number): string | null {
  if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
    return "Enter positive width and height.";
  }
  if (w > IMAGE_WORKER_MAX_SIDE || h > IMAGE_WORKER_MAX_SIDE || w * h > IMAGE_WORKER_MAX_PIXELS) {
    return "Output dimensions are too large.";
  }
  return null;
}
