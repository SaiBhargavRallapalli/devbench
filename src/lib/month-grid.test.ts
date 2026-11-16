import { describe, expect, it } from "vitest";
import { daysInMonth, firstWeekdayColumn, getMonthGrid, isLeapYear, isSundayColumn } from "./month-grid";

describe("isLeapYear", () => {
  it("applies the Gregorian leap rules", () => {
    expect(isLeapYear(2024)).toBe(true); // divisible by 4
    expect(isLeapYear(2000)).toBe(true); // divisible by 400
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false); // divisible by 100 but not 400
    expect(isLeapYear(2100)).toBe(false);
  });
});

describe("daysInMonth", () => {
  it("returns the correct length for every month", () => {
    expect(daysInMonth(2026, 1)).toBe(31);
    expect(daysInMonth(2026, 4)).toBe(30);
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2024, 12)).toBe(31);
  });
});

describe("firstWeekdayColumn", () => {
  it("places 1 January 2026 (a Thursday) correctly for both week starts", () => {
    expect(firstWeekdayColumn(2026, 1, 0)).toBe(4); // Sunday-first → 4th column
    expect(firstWeekdayColumn(2026, 1, 1)).toBe(3); // Monday-first → 3rd column
  });

  it("never returns a value outside 0–6", () => {
    for (let month = 1; month <= 12; month++) {
      expect(firstWeekdayColumn(2026, month, 0)).toBeGreaterThanOrEqual(0);
      expect(firstWeekdayColumn(2026, month, 0)).toBeLessThanOrEqual(6);
      expect(firstWeekdayColumn(2026, month, 1)).toBeGreaterThanOrEqual(0);
      expect(firstWeekdayColumn(2026, month, 1)).toBeLessThanOrEqual(6);
    }
  });
});

describe("getMonthGrid", () => {
  it("covers every day exactly once, in order", () => {
    const grid = getMonthGrid(2026, 2, 0); // February 2026, 28 days
    const flat = grid.weeks.flat().filter((d) => d !== 0);
    expect(flat).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(grid.leadingBlanks).toBe(0); // 1 Feb 2026 is a Sunday → col 0 (Sunday-first)
    // Monday-first puts that same Sunday in the last column instead
    expect(getMonthGrid(2026, 2, 1).leadingBlanks).toBe(6);
  });

  it("emits only full 7-cell rows, padding with zeros", () => {
    const grid = getMonthGrid(2026, 6, 0); // June 2026 starts on a Monday
    expect(grid.leadingBlanks).toBe(1);
    for (const week of grid.weeks) expect(week).toHaveLength(7);
    const flat = grid.weeks.flat();
    expect(flat.length % 7).toBe(0);
    expect(flat.length).toBeGreaterThanOrEqual(grid.leadingBlanks + grid.days);
    expect(flat.filter((d) => d !== 0)).toHaveLength(grid.days);
  });

  it("handles a February that starts on a Sunday (leap year)", () => {
    const grid = getMonthGrid(2024, 2, 0); // 1 Feb 2024 = Thursday
    expect(grid.leadingBlanks).toBe(4);
    expect(grid.days).toBe(29);
    expect(grid.weeks[0]).toEqual([0, 0, 0, 0, 1, 2, 3]);
    expect(grid.weeks.at(-1)).toEqual([25, 26, 27, 28, 29, 0, 0]);
  });

  it("shifts the grid when the week starts on Monday", () => {
    const sun = getMonthGrid(2026, 1, 0);
    const mon = getMonthGrid(2026, 1, 1);
    expect(mon.leadingBlanks).toBe((sun.leadingBlanks + 6) % 7);
  });
});

describe("isSundayColumn", () => {
  it("tracks Sunday for either week start", () => {
    expect(Array.from({ length: 7 }, (_, c) => isSundayColumn(c, 0))).toEqual([true, false, false, false, false, false, false]);
    expect(Array.from({ length: 7 }, (_, c) => isSundayColumn(c, 1))).toEqual([false, false, false, false, false, false, true]);
  });
});
