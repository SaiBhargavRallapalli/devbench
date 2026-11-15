// Copyright (c) 2026 DevBench contributors. MIT License.

/**
 * Pure business-day (working-day) arithmetic for the Business Day Calculator.
 * Weekends are configurable (some regions work Sun–Thu or Fri–Sat) and holidays
 * can be supplied as `YYYY-MM-DD` strings. All functions operate on calendar
 * dates at UTC midnight so DST never shifts a day boundary.
 */

/** Default weekend: Saturday + Sunday. */
export const DEFAULT_WEEKEND: readonly number[] = [0, 6]; // getDay(): 0=Sun … 6=Sat

/** Common weekend presets keyed by label, for the UI. */
export const WEEKEND_PRESETS: Record<string, readonly number[]> = {
  "Sat–Sun": [0, 6],
  "Fri–Sat": [5, 6],
  "Sun–Thu": [0, 5],
  "None": [],
};

function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (
    d.getUTCFullYear() !== Number(m[1]) ||
    d.getUTCMonth() !== Number(m[2]) - 1 ||
    d.getUTCDate() !== Number(m[3])
  ) {
    return null;
  }
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function makeChecker(weekend: readonly number[], holidays: readonly string[]) {
  const holidaySet = new Set(holidays.map((h) => h.trim()).filter(Boolean));
  return (date: Date): boolean => {
    if (weekend.includes(date.getUTCDay())) return false;
    if (holidaySet.has(isoOf(date))) return false;
    return true;
  };
}

export interface CountResult {
  /** Business days in the inclusive range. */
  businessDays: number;
  /** Calendar days in the inclusive range. */
  calendarDays: number;
  weekendsSkipped: number;
  holidaysSkipped: number;
}

/**
 * Count business days in the inclusive range between two dates (order-independent).
 * Both endpoints count if they are business days.
 */
export function countBusinessDays(
  startIso: string,
  endIso: string,
  weekend: readonly number[] = DEFAULT_WEEKEND,
  holidays: readonly string[] = [],
): CountResult | null {
  const a = parseIso(startIso);
  const b = parseIso(endIso);
  if (!a || !b) return null;

  const from = a <= b ? a : b;
  const to = a <= b ? b : a;
  const isBusiness = makeChecker(weekend, holidays);

  let businessDays = 0;
  let weekendsSkipped = 0;
  let holidaysSkipped = 0;
  const holidaySet = new Set(holidays.map((h) => h.trim()).filter(Boolean));

  const cursor = new Date(from);
  let calendarDays = 0;
  while (cursor <= to) {
    calendarDays++;
    if (weekend.includes(cursor.getUTCDay())) {
      weekendsSkipped++;
    } else if (holidaySet.has(isoOf(cursor))) {
      holidaysSkipped++;
    } else if (isBusiness(cursor)) {
      businessDays++;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return { businessDays, calendarDays, weekendsSkipped, holidaysSkipped };
}

/**
 * Add (or subtract, with a negative `days`) business days to a start date and
 * return the resulting `YYYY-MM-DD`. The start date itself is not counted —
 * counting begins on the next day.
 */
export function addBusinessDays(
  startIso: string,
  days: number,
  weekend: readonly number[] = DEFAULT_WEEKEND,
  holidays: readonly string[] = [],
): string | null {
  if (!Number.isInteger(days)) return null;
  const start = parseIso(startIso);
  if (!start) return null;
  if (days === 0) return isoOf(start);

  const isBusiness = makeChecker(weekend, holidays);
  const step = days > 0 ? 1 : -1;
  let remaining = Math.abs(days);
  let cursor = new Date(start);

  // Guard against runaway loops (e.g. every day is a weekend).
  const maxIterations = Math.abs(days) * 400 + 1000;
  let iterations = 0;
  while (remaining > 0 && iterations < maxIterations) {
    cursor = addDays(cursor, step);
    iterations++;
    if (isBusiness(cursor)) remaining--;
  }
  if (remaining > 0) return null;
  return isoOf(cursor);
}

/** Convenience: count business days strictly between two dates (endpoints excluded). */
export function countBusinessDaysExclusive(
  startIso: string,
  endIso: string,
  weekend: readonly number[] = DEFAULT_WEEKEND,
  holidays: readonly string[] = [],
): number | null {
  const r = countBusinessDays(startIso, endIso, weekend, holidays);
  if (!r) return null;
  const a = parseIso(startIso);
  const b = parseIso(endIso);
  if (!a || !b) return null;
  const isBusiness = makeChecker(weekend, holidays);
  let adjust = 0;
  if (isBusiness(a)) adjust++;
  if (isBusiness(b) && isoOf(a) !== isoOf(b)) adjust++;
  return Math.max(0, r.businessDays - adjust);
}
