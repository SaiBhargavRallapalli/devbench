import { describe, expect, it } from "vitest";
import {
  analyzeDate,
  buildDigitFormats,
  classifyDigits,
  daysUntilOccurrence,
  isoWeekOf,
  nextPalindromeDates,
} from "./date-pattern";

const TODAY = new Date(Date.UTC(2026, 10, 14)); // Sat 14 Nov 2026

describe("classifyDigits", () => {
  it("detects palindromes", () => {
    expect(classifyDigits("02022020")).toContain("palindrome"); // 02/02/2020 US
    expect(classifyDigits("01022010")).toContain("palindrome"); // 01/02/2010 EU
    expect(classifyDigits("12344321")).toContain("palindrome");
    expect(classifyDigits("12345")).not.toContain("palindrome");
  });

  it("detects a single digit repeated", () => {
    expect(classifyDigits("11111111")).toEqual(
      expect.arrayContaining(["palindrome", "repeating"]),
    );
    expect(classifyDigits("112233")).toEqual([]);
  });

  it("detects ascending and descending runs", () => {
    expect(classifyDigits("01234567")).toEqual(["ascending"]);
    expect(classifyDigits("87654321")).toEqual(["descending"]);
    expect(classifyDigits("0123")).toEqual(["ascending"]);
    expect(classifyDigits("13579")).toEqual([]);
  });
});

describe("buildDigitFormats", () => {
  it("renders the five common numeric forms, zero-padded", () => {
    const formats = buildDigitFormats(2026, 3, 5);
    expect(formats.map((f) => f.digits)).toEqual([
      "03052026",
      "05032026",
      "20260305",
      "030526",
      "050326",
    ]);
    expect(formats.map((f) => f.label)).toContain("MM/DD/YYYY (US)");
  });
});

describe("analyzeDate", () => {
  it("flags 02/02/2020 as a US-format palindrome", () => {
    const a = analyzeDate(2020, 2, 2, TODAY);
    const us = a.matches.find((m) => m.label === "MM/DD/YYYY (US)");
    expect(us?.digits).toBe("02022020");
    expect(us?.kinds).toContain("palindrome");
  });

  it("flags 01/02/2010 as a Europe-format palindrome", () => {
    const a = analyzeDate(2010, 2, 1, TODAY); // 1 February 2010 → 01022010
    const eu = a.matches.find((m) => m.label === "DD/MM/YYYY (Europe)");
    expect(eu?.digits).toBe("01022010");
    expect(eu?.kinds).toContain("palindrome");
  });

  it("reports no pattern for an ordinary date", () => {
    const a = analyzeDate(2026, 11, 14, TODAY);
    expect(a.matches).toEqual([]);
    expect(a.formats).toHaveLength(5);
  });

  it("computes calendar facts (weekday, day-of-year, ISO week, leap)", () => {
    const a = analyzeDate(2026, 11, 14, TODAY);
    expect(a.iso).toBe("2026-11-14");
    expect(a.facts.weekday).toBe("Saturday");
    expect(a.facts.monthName).toBe("November");
    expect(a.facts.dayOfYear).toBe(318);
    expect(a.facts.isoWeek).toBe(46);
    expect(a.facts.isoWeekYear).toBe(2026);
    expect(a.facts.leapYear).toBe(false);
    expect(a.facts.twinDate).toBe(false);
  });

  it("detects twin dates and counts down to the next occurrence", () => {
    const twin = analyzeDate(2026, 5, 5, TODAY);
    expect(twin.facts.twinDate).toBe(true);
    // 14 Nov 2026 → 5 May 2027 = 172 days
    expect(twin.facts.nextOccurrenceDays).toBe(172);

    const sameDay = analyzeDate(2026, 11, 14, TODAY);
    expect(sameDay.facts.nextOccurrenceDays).toBe(0);

    const past = analyzeDate(2026, 1, 1, TODAY);
    // 14 Nov 2026 → 1 Jan 2027 = 48 days
    expect(past.facts.nextOccurrenceDays).toBe(48);
  });
});

describe("isoWeekOf", () => {
  it("places a Thursday in week 1 of its own year", () => {
    expect(isoWeekOf(new Date(Date.UTC(2026, 0, 1)))).toEqual({ week: 1, year: 2026 });
  });

  it("rolls a year-end Monday into week 1 of the next year", () => {
    // 29 Dec 2025 is the Monday of ISO week 1, 2026
    expect(isoWeekOf(new Date(Date.UTC(2025, 11, 29)))).toEqual({ week: 1, year: 2026 });
    expect(isoWeekOf(new Date(Date.UTC(2024, 11, 30)))).toEqual({ week: 1, year: 2025 });
  });

  it("keeps a date after a 52-week year in that year's last week", () => {
    // 28 Dec 2025 closes ISO week 52 of 2025
    expect(isoWeekOf(new Date(Date.UTC(2025, 11, 28)))).toEqual({ week: 52, year: 2025 });
  });

  it("handles a 53-week year", () => {
    // 1 Jan 2021 belongs to ISO week 53 of 2020
    expect(isoWeekOf(new Date(Date.UTC(2021, 0, 1)))).toEqual({ week: 53, year: 2020 });
  });
});

describe("daysUntilOccurrence", () => {
  it("returns 0 on the day itself", () => {
    expect(daysUntilOccurrence(11, 14, TODAY)).toBe(0);
  });

  it("counts forward across a year boundary", () => {
    expect(daysUntilOccurrence(1, 1, TODAY)).toBe(48); // → 1 Jan 2027
    expect(daysUntilOccurrence(12, 31, TODAY)).toBe(47); // → 31 Dec 2026
  });
});

describe("nextPalindromeDates", () => {
  it("finds the next dates that read the same both ways", () => {
    const found = nextPalindromeDates(TODAY, 3);
    // Derived from the format algebra: in DD/MM/YYYY a 20XY date is a
    // palindrome when day = reversed(XY) and month = 02 — so 2030 → 03/02/2030.
    expect(found[0].iso).toBe("2030-02-03");
    expect(found[0].formats).toContain("DD/MM/YYYY (Europe)");
    // The same digit string is also 03/02/2030 in US order.
    expect(found[1].iso).toBe("2030-03-02");
    expect(found.map((f) => f.iso)).toEqual([...found.map((f) => f.iso)].sort());
  });

  it("returns dates strictly after `from`, each with a real pattern", () => {
    const found = nextPalindromeDates(TODAY, 5);
    expect(found).toHaveLength(5);
    for (const f of found) {
      expect(f.iso > "2026-11-14").toBe(true);
      expect(f.formats.length).toBeGreaterThan(0);
    }
    // Every returned date really is a palindrome when re-analysed
    for (const f of found) {
      const [y, m, d] = f.iso.split("-").map(Number);
      const analysis = analyzeDate(y, m, d, TODAY);
      const palindromes = analysis.matches.filter((x) => x.kinds.includes("palindrome"));
      expect(palindromes.length).toBeGreaterThan(0);
    }
  });

  it("returns an empty list when nothing is found in range", () => {
    expect(nextPalindromeDates(TODAY, 3, 0)).toEqual([]);
  });
});
