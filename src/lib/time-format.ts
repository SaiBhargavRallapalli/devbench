// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Pure time-formatting helpers shared by the stopwatch, timer and
 * countdown-creator tools. Kept out of the components so the display
 * maths is unit-testable without a DOM.
 */

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/**
 * Stopwatch display — MM:SS.cs with minutes rolling past 60.
 * 93_250ms → "01:33.25", 3_723_456ms → "62:03.45".
 */
export function formatStopwatch(ms: number): string {
  const total = Math.max(0, Math.floor(ms));
  const minutes = Math.floor(total / 60_000);
  const seconds = Math.floor((total % 60_000) / 1_000);
  const centiseconds = Math.floor((total % 1_000) / 10);
  return `${pad2(minutes)}:${pad2(seconds)}.${pad2(centiseconds)}`;
}

/**
 * Timer display — MM:SS below an hour, H:MM:SS above.
 * Rounds up so the final second shows in full: 1_500ms → "00:02".
 */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(seconds)}`
    : `${pad2(minutes)}:${pad2(seconds)}`;
}

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Break a remaining-time span into day/hour/minute/second buckets. */
export function countdownParts(ms: number): CountdownParts {
  const total = Math.max(0, Math.floor(ms));
  return {
    days: Math.floor(total / 86_400_000),
    hours: Math.floor((total % 86_400_000) / 3_600_000),
    minutes: Math.floor((total % 3_600_000) / 60_000),
    seconds: Math.floor((total % 60_000) / 1_000),
  };
}
