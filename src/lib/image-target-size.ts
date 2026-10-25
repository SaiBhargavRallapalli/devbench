// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Pure helpers for "Compress Image to Exact Size (KB/MB)".
 * No DOM / canvas / worker code here — everything is unit-testable in Node.
 */

/** Quality floor: going lower than this usually destroys images without saving much. */
export const TARGET_MIN_QUALITY = 0.35;
/** Quality ceiling: above this, savings are negligible for most encoders. */
export const TARGET_MAX_QUALITY = 0.92;
/** Stop the search once we're within this many bytes of the target. */
export const TARGET_EPSILON_BYTES = 1024;
/** Quality to resume from after a downscale (a smaller image needs less quality loss). */
export const TARGET_RESUME_QUALITY = 0.85;
/** Hard cap on worker encode attempts per run (quality search + downscale phase). */
export const TARGET_MAX_ATTEMPTS = 12;
/** "Reached the target" tolerance: within 2% below is considered a hit. */
export const TARGET_TOLERANCE = 0.02;
/** Stop bisecting when the quality window is narrower than this. */
export const TARGET_QUALITY_EPSILON = 0.02;
/** Never downscale a side below this many pixels. */
export const TARGET_MIN_SIDE = 32;
/** Clamp the area ratio so a downscale never cuts more than 75% of pixels at once. */
export const TARGET_MIN_AREA_RATIO = 0.25;

const BYTES_PER_KB = 1024;
const BYTES_PER_MB = 1024 * 1024;

export type TargetUnit = "KB" | "MB";

/**
 * Parse a user-entered target size into bytes.
 * Accepts numbers or strings ("50", "0.5MB", "1,024"), validates > 0.
 * KB = 1024 bytes, MB = 1024 KB. Returns null for anything unusable.
 */
export function parseTargetSize(input: string | number, unit: TargetUnit): number | null {
  const cleaned =
    typeof input === "number"
      ? input
      : input
          .trim()
          // Tolerate a pasted unit suffix ("0.5MB", "50 kb") — the unit select wins.
          .replace(/(kb|mb|bytes?|b)$/i, "")
          .trim()
          .replace(/,/g, "");
  const value = typeof cleaned === "number" ? cleaned : Number(cleaned);
  if (!Number.isFinite(value) || value <= 0) return null;
  const bytes = unit === "MB" ? value * BYTES_PER_MB : value * BYTES_PER_KB;
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  return bytes;
}

/** Human-readable size using binary units (KB = 1024). e.g. "3.4 KB", "1.2 MB". */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  if (bytes >= BYTES_PER_MB) return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
  if (bytes >= BYTES_PER_KB) return `${(bytes / BYTES_PER_KB).toFixed(1)} KB`;
  return `${Math.round(bytes)} B`;
}

/**
 * Binary-search step for the quality loop. Given the current bracket
 * [lo, hi] (lo = known-too-small quality, hi = known-too-large) and the
 * last measured size, return the next quality to try (the midpoint).
 * The caller updates lo/hi from the outcome and calls again — ~6-7
 * iterations cover the 0.35–0.92 range to a fine resolution.
 */
export function nextQuality(
  lo: number,
  hi: number,
  _gotBytes: number,
  _targetBytes: number,
): number {
  const mid = (lo + hi) / 2;
  // Avoid floating-point dust like 0.634999999 in the UI / worker messages.
  return Math.round(mid * 1000) / 1000;
}

/**
 * Suggest downscaled dimensions that should get close to the target by
 * area scaling. Returns null when the input is already ≤ target (nothing
 * to do) or inputs are invalid. Clamps so the area ratio never drops
 * below TARGET_MIN_AREA_RATIO (0.25) and no side goes under 32px,
 * preserving aspect ratio via a single uniform scale factor.
 */
export function scaleForTarget(
  currentBytes: number,
  targetBytes: number,
  currentWidth: number,
  currentHeight: number,
): { width: number; height: number } | null {
  if (
    !Number.isFinite(currentBytes) ||
    !Number.isFinite(targetBytes) ||
    !Number.isFinite(currentWidth) ||
    !Number.isFinite(currentHeight) ||
    currentWidth < 1 ||
    currentHeight < 1 ||
    targetBytes <= 0
  ) {
    return null;
  }
  if (currentBytes <= targetBytes) return null;
  const areaRatio = Math.min(1, targetBytes / currentBytes);
  const scale = Math.max(Math.sqrt(TARGET_MIN_AREA_RATIO), Math.sqrt(areaRatio));
  return {
    width: Math.max(TARGET_MIN_SIDE, Math.round(currentWidth * scale)),
    height: Math.max(TARGET_MIN_SIDE, Math.round(currentHeight * scale)),
  };
}

/** Honest copy for the best-effort case where the target is unreachable. */
export function minimumAchievableMessage(targetBytes: number): string {
  return (
    `Couldn't reach ${formatBytes(targetBytes)} even at minimum quality. ` +
    "Try a slightly larger target, or download the closest result below."
  );
}
