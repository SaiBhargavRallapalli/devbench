// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Pure helpers behind the Random Number Generator tool. Every function takes
 * an injectable `rng` returning [0, 1) so the tests are deterministic; the
 * component passes `Math.random`.
 */

export interface RandomIntOptions {
  min: number;
  max: number;
  /** How many numbers to draw. Defaults to 1. */
  count?: number;
  /** Draw without repetition (needs count ≤ range size). Defaults to false. */
  unique?: boolean;
  /** Sort the result ascending. Defaults to false (draw order). */
  sort?: boolean;
}

/** Inclusive integer in [min, max]. */
export function randomInt(
  min: number,
  max: number,
  rng: () => number = Math.random,
): number {
  if (!Number.isInteger(min) || !Number.isInteger(max)) {
    throw new RangeError(`bounds must be integers, got ${min} and ${max}`);
  }
  if (max < min) {
    throw new RangeError(`max (${max}) must be >= min (${min})`);
  }
  return min + Math.floor(rng() * (max - min + 1));
}

/** Inclusive draw of `count` integers in [min, max]. */
export function randomInts(
  options: RandomIntOptions,
  rng: () => number = Math.random,
): number[] {
  const { min, max, count = 1, unique = false, sort = false } = options;
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`count must be a positive integer, got ${count}`);
  }
  const rangeSize = max - min + 1;
  if (rangeSize < 1) {
    throw new RangeError(`max (${max}) must be >= min (${min})`);
  }
  if (unique && count > rangeSize) {
    throw new RangeError(
      `cannot draw ${count} unique values from a range of ${rangeSize}`,
    );
  }

  let values: number[];
  if (unique) {
    // Partial Fisher–Yates over the full range, tracked lazily in a Map so we
    // never materialise the whole range: O(count) and every subset is equally
    // likely. Position p defaults to min + p until swapped.
    const pool = new Map<number, number>();
    const at = (idx: number): number => (pool.has(idx) ? pool.get(idx)! : min + idx);
    values = [];
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(rng() * (rangeSize - i));
      const vi = at(i);
      const vj = at(j);
      pool.set(i, vj);
      pool.set(j, vi);
      values.push(pool.get(i)!);
    }
  } else {
    values = Array.from({ length: count }, () => randomInt(min, max, rng));
  }

  if (sort) values.sort((a, b) => a - b);
  return values;
}

/** Uniform float in [min, max). */
export function randomFloat(
  min: number,
  max: number,
  rng: () => number = Math.random,
): number {
  if (max < min) {
    throw new RangeError(`max (${max}) must be >= min (${min})`);
  }
  return min + rng() * (max - min);
}
