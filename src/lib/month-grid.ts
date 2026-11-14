// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Calendar grid maths shared by the calendar-generator and custom-calendar
 * tools. All dates are computed via Date.UTC so the grid never shifts with
 * the viewer's timezone (a month must start on the same weekday everywhere).
 */

/** 0 = week starts Sunday, 1 = week starts Monday. */
export type WeekStart = 0 | 1;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Days in a month, `month` is 1-based (1 = January … 12 = December). */
export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** Column (0–6) the 1st of the month lands in for the given week start. */
export function firstWeekdayColumn(
  year: number,
  month: number,
  weekStart: WeekStart,
): number {
  const weekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return (weekday - weekStart + 7) % 7;
}

export interface MonthGrid {
  year: number;
  month: number;
  /** Empty cells before day 1 (same value as the 1st's column). */
  leadingBlanks: number;
  /** Days in this month (28–31). */
  days: number;
  /**
   * Weeks as rows of 7 day numbers; days outside the month are 0 so every
   * row is exactly 7 cells wide (grid layout stays rectangular).
   */
  weeks: number[][];
}

export function getMonthGrid(
  year: number,
  month: number,
  weekStart: WeekStart,
): MonthGrid {
  const leadingBlanks = firstWeekdayColumn(year, month, weekStart);
  const days = daysInMonth(year, month);
  const cells: number[] = [
    ...Array.from({ length: leadingBlanks }, () => 0),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(0);
  const weeks: number[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return { year, month, leadingBlanks, days, weeks };
}
