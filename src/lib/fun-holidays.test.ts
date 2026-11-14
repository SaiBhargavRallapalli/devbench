import { describe, expect, it } from "vitest";
import {
  FUN_HOLIDAYS,
  holidaysInMonth,
  holidaysOn,
  nextHolidays,
  randomHoliday,
  todayMmdd,
} from "./fun-holidays";

describe("FUN_HOLIDAYS dataset", () => {
  it("has a well-formed MM-DD date and a real blurb on every entry", () => {
    for (const h of FUN_HOLIDAYS) {
      expect(h.date).toMatch(/^\d{2}-\d{2}$/);
      const month = Number(h.date.slice(0, 2));
      const day = Number(h.date.slice(3));
      expect(month).toBeGreaterThanOrEqual(1);
      expect(month).toBeLessThanOrEqual(12);
      expect(day).toBeGreaterThanOrEqual(1);
      expect(day).toBeLessThanOrEqual(31);
      expect(h.name.length).toBeGreaterThan(2);
      expect(h.blurb.length).toBeGreaterThan(30);
    }
  });

  it("is sorted by date and free of exact duplicates", () => {
    const dates = FUN_HOLIDAYS.map((h) => h.date);
    expect(dates).toEqual([...dates].sort());
    const keys = FUN_HOLIDAYS.map((h) => `${h.date}|${h.name}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("covers every month of the year", () => {
    for (let month = 1; month <= 12; month++) {
      expect(holidaysInMonth(month).length).toBeGreaterThan(0);
    }
  });

  it("includes known anchor days", () => {
    expect(holidaysOn("01-01").map((h) => h.name)).toContain("New Year's Day");
    expect(holidaysOn("12-25").map((h) => h.name)).toContain("Christmas Day");
    expect(holidaysOn("11-14").map((h) => h.name)).toContain("Children's Day (India)");
    expect(holidaysOn("04-01").map((h) => h.name)).toContain("April Fools' Day");
    expect(holidaysOn("02-29")).toEqual([]); // no fixed 29 Feb entries
  });
});

describe("helpers", () => {
  it("holidaysInMonth returns only that month, in order", () => {
    const may = holidaysInMonth(5);
    expect(may.length).toBeGreaterThan(5);
    expect(may.every((h) => h.date.startsWith("05-"))).toBe(true);
    expect(may.map((h) => h.date)).toEqual([...may.map((h) => h.date)].sort());
  });

  it("nextHolidays walks forward and wraps around the year", () => {
    const from = nextHolidays("12-28", 6);
    expect(from).toHaveLength(6);
    expect(from.map((h) => h.date)).toEqual(["12-31", "01-01", "01-04", "01-06", "01-07", "01-13"]);
    // Starting mid-year: every date is on or after the start
    const mid = nextHolidays("06-15", 4);
    expect(mid.every((h) => h.date >= "06-15")).toBe(true);
  });

  it("randomHoliday always returns a dataset entry", () => {
    for (let i = 0; i < 25; i++) {
      expect(FUN_HOLIDAYS).toContain(randomHoliday());
    }
  });

  it("todayMmdd formats local time as zero-padded MM-DD", () => {
    expect(todayMmdd(new Date(2026, 0, 5))).toBe("01-05");
    expect(todayMmdd(new Date(2026, 11, 31))).toBe("12-31");
  });
});
