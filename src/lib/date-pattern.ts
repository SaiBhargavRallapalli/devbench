// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Pure date-pattern analysis: how a date looks as digits, which numeric
 * patterns it satisfies (palindrome, repeating, ascending/descending runs),
 * the calendar facts around it, and a forward scan for the next palindrome
 * dates. Kept out of the component so the maths is unit-testable.
 */

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export type PatternKind = "palindrome" | "repeating" | "ascending" | "descending";

export interface DigitFormat {
  label: string;
  digits: string;
}

export interface PatternMatch extends DigitFormat {
  kinds: PatternKind[];
}

export interface DateFacts {
  iso: string;
  monthName: string;
  weekday: string;
  /** 1–366, counting from 1 January. */
  dayOfYear: number;
  /** ISO 8601 week number (1–53) and its ISO year (may differ near year-end). */
  isoWeek: number;
  isoWeekYear: number;
  leapYear: boolean;
  /** True when the day of month equals the month number (05/05, 11/11). */
  twinDate: boolean;
  /** Whole days from `today` until the next occurrence of this day/month. */
  nextOccurrenceDays: number;
}

export interface DateAnalysis {
  iso: string;
  facts: DateFacts;
  /** Every numeric rendering of the date, whether or not it has a pattern. */
  formats: DigitFormat[];
  /** The subset of `formats` that matched at least one pattern. */
  matches: PatternMatch[];
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Zero-padded ISO date string for a y/m/d triple (1-based month). */
export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** The numeric renderings people actually write dates in. */
export function buildDigitFormats(year: number, month: number, day: number): DigitFormat[] {
  const mm = pad2(month);
  const dd = pad2(day);
  const yy = String(year).slice(-2);
  const yyyy = String(year);
  return [
    { label: "MM/DD/YYYY (US)", digits: `${mm}${dd}${yyyy}` },
    { label: "DD/MM/YYYY (Europe)", digits: `${dd}${mm}${yyyy}` },
    { label: "YYYYMMDD (ISO)", digits: `${yyyy}${mm}${dd}` },
    { label: "MM/DD/YY", digits: `${mm}${dd}${yy}` },
    { label: "DD/MM/YY", digits: `${dd}${mm}${yy}` },
  ];
}

/**
 * Which numeric patterns a digit string satisfies. A run of identical
 * digits (11111111) is both repeating and a palindrome — both are reported
 * rather than picking a winner, so the UI can badge every true statement.
 */
export function classifyDigits(digits: string): PatternKind[] {
  const kinds: PatternKind[] = [];
  if (digits.length < 2) return kinds;
  const chars = [...digits];
  // NOTE: copy before reversing — Array.reverse mutates in place and would
  // corrupt the ascending/descending checks below.
  if (digits === [...chars].reverse().join("")) kinds.push("palindrome");
  if (chars.every((c) => c === chars[0])) kinds.push("repeating");
  const nums = chars.map(Number);
  if (nums.every((n, i) => i === 0 || n === nums[i - 1] + 1)) kinds.push("ascending");
  if (nums.every((n, i) => i === 0 || n === nums[i - 1] - 1)) kinds.push("descending");
  return kinds;
}

export function describePattern(kind: PatternKind, digits: string, label: string): string {
  switch (kind) {
    case "palindrome":
      return `${digits} reads the same forwards and backwards in ${label}.`;
    case "repeating":
      return `${digits} is one digit repeated across the whole ${label} string.`;
    case "ascending":
      return `${digits} counts straight up, one step per digit, in ${label}.`;
    case "descending":
      return `${digits} counts straight down, one step per digit, in ${label}.`;
  }
}

/** The Monday on or before 4 January — every ISO week 1 contains 4 January. */
function mondayOnOrBeforeJan4(year: number): number {
  const jan4 = Date.UTC(year, 0, 4);
  const dayNum = (new Date(jan4).getUTCDay() + 6) % 7;
  return jan4 - dayNum * 86_400_000;
}

/**
 * ISO 8601 week number + week-year for a UTC date.
 *
 * Anchored on the Monday of the date's week rather than "nearest Thursday",
 * because the nearest Thursday can sit in the previous calendar year while
 * the week itself already belongs to week 1 of the next (29 Dec 2025 is
 * Monday of week 1, 2026 — its Thursday is still 2025).
 */
export function isoWeekOf(date: Date): { week: number; year: number } {
  const dayNum = (date.getUTCDay() + 6) % 7; // Monday = 0
  const monday = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ) - dayNum * 86_400_000;
  const yearOfMonday = new Date(monday).getUTCFullYear();
  const week1 = mondayOnOrBeforeJan4(yearOfMonday);
  const week1Next = mondayOnOrBeforeJan4(yearOfMonday + 1);
  const weeksInYear = Math.round((week1Next - week1) / (7 * 86_400_000));
  let week = Math.round((monday - week1) / (7 * 86_400_000)) + 1;
  let year = yearOfMonday;
  if (week > weeksInYear) {
    week = 1;
    year = yearOfMonday + 1;
  }
  return { week, year };
}

/**
 * Days from `today` until the next time this month/day comes around
 * (0 when today IS the day, counting forward through a year boundary).
 */
export function daysUntilOccurrence(
  month: number,
  day: number,
  today: Date,
): number {
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const targetThisYear = Date.UTC(today.getUTCFullYear(), month - 1, day);
  const candidate = targetThisYear >= start ? targetThisYear : Date.UTC(today.getUTCFullYear() + 1, month - 1, day);
  return Math.round((candidate - start) / 86_400_000);
}

/**
 * Full analysis of a calendar date. `today` is injectable so tests (and the
 * "days until next occurrence" fact) stay deterministic.
 */
export function analyzeDate(
  year: number,
  month: number,
  day: number,
  today: Date = new Date(),
): DateAnalysis {
  const date = new Date(Date.UTC(year, month - 1, day));
  const formats = buildDigitFormats(year, month, day);
  const matches: PatternMatch[] = [];
  for (const f of formats) {
    const kinds = classifyDigits(f.digits);
    if (kinds.length > 0) matches.push({ ...f, kinds });
  }
  const isoWeek = isoWeekOf(date);
  return {
    iso: toIsoDate(year, month, day),
    formats,
    matches,
    facts: {
      iso: toIsoDate(year, month, day),
      monthName: MONTH_NAMES[month - 1],
      weekday: WEEKDAY_NAMES[date.getUTCDay()],
      dayOfYear: Math.round((date.getTime() - Date.UTC(year, 0, 0)) / 86_400_000),
      isoWeek: isoWeek.week,
      isoWeekYear: isoWeek.year,
      leapYear: isLeapYear(year),
      twinDate: day === month,
      nextOccurrenceDays: daysUntilOccurrence(month, day, today),
    },
  };
}

export interface PalindromeDate {
  iso: string;
  /** Labels of the formats in which this date reads as a palindrome. */
  formats: string[];
}

/**
 * The next `limit` dates after `from` that are palindromes in at least one
 * 8-digit format. Scans day by day — 120 years is ~44k iterations of pure
 * string checks, so it runs in well under a millisecond.
 */
export function nextPalindromeDates(from: Date, limit = 5, maxYears = 120): PalindromeDate[] {
  const out: PalindromeDate[] = [];
  const start = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const horizon = start + maxYears * 366 * 86_400_000;
  for (
    let t = start + 86_400_000;
    t <= horizon && out.length < limit;
    t += 86_400_000
  ) {
    const d = new Date(t);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const formats = buildDigitFormats(y, m, day).filter(
      (f) => classifyDigits(f.digits).includes("palindrome"),
    );
    if (formats.length > 0) {
      out.push({
        iso: toIsoDate(y, m, day),
        formats: formats.map((f) => f.label),
      });
    }
  }
  return out;
}
