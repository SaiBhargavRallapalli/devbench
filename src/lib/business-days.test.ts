import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEEKEND,
  WEEKEND_PRESETS,
  addBusinessDays,
  countBusinessDays,
  countBusinessDaysExclusive,
} from "./business-days";

describe("countBusinessDays", () => {
  it("counts a full Mon–Fri week as 5", () => {
    // 2026-11-02 is a Monday, 2026-11-06 a Friday
    const r = countBusinessDays("2026-11-02", "2026-11-06");
    expect(r).not.toBeNull();
    expect(r!.businessDays).toBe(5);
    expect(r!.calendarDays).toBe(5);
  });

  it("skips a weekend inside the range", () => {
    // Fri 2026-11-06 → Mon 2026-11-09 inclusive: Fri + Mon = 2 business days
    const r = countBusinessDays("2026-11-06", "2026-11-09")!;
    expect(r.businessDays).toBe(2);
    expect(r.calendarDays).toBe(4);
    expect(r.weekendsSkipped).toBe(2);
  });

  it("counts only weekdays when the range is entirely a weekend", () => {
    // Sat 2026-11-07 → Sun 2026-11-08
    const r = countBusinessDays("2026-11-07", "2026-11-08")!;
    expect(r.businessDays).toBe(0);
    expect(r.weekendsSkipped).toBe(2);
  });

  it("is order-independent (endpoints may be reversed)", () => {
    const fwd = countBusinessDays("2026-11-02", "2026-11-06")!;
    const rev = countBusinessDays("2026-11-06", "2026-11-02")!;
    expect(rev.businessDays).toBe(fwd.businessDays);
  });

  it("subtracts supplied holidays", () => {
    // Weekday range Mon–Fri (5) minus one holiday on the Wednesday
    const r = countBusinessDays(
      "2026-11-02",
      "2026-11-06",
      DEFAULT_WEEKEND,
      ["2026-11-04"],
    )!;
    expect(r.businessDays).toBe(4);
    expect(r.holidaysSkipped).toBe(1);
  });

  it("respects a Fri–Sat weekend preset", () => {
    // Range Fri 2026-11-06 → Sat 2026-11-07: with Fri–Sat weekend both are off
    const r = countBusinessDays(
      "2026-11-06",
      "2026-11-07",
      WEEKEND_PRESETS["Fri–Sat"],
    )!;
    expect(r.businessDays).toBe(0);
  });

  it("returns null for malformed dates", () => {
    expect(countBusinessDays("nope", "2026-11-06")).toBeNull();
    expect(countBusinessDays("2026-11-02", "2026-13-40")).toBeNull();
  });
});

describe("addBusinessDays", () => {
  it("adds business days, skipping the weekend", () => {
    // From Fri 2026-11-06, +1 business day → Mon 2026-11-09
    expect(addBusinessDays("2026-11-06", 1)).toBe("2026-11-09");
    // +5 from Mon 2026-11-02 → Mon 2026-11-09 (Tue,Wed,Thu,Fri,Mon)
    expect(addBusinessDays("2026-11-02", 5)).toBe("2026-11-09");
  });

  it("returns the start when adding zero", () => {
    expect(addBusinessDays("2026-11-02", 0)).toBe("2026-11-02");
  });

  it("subtracts business days with a negative count", () => {
    // From Mon 2026-11-09, −1 business day → Fri 2026-11-06
    expect(addBusinessDays("2026-11-09", -1)).toBe("2026-11-06");
    // −5 from Mon 2026-11-09 → Mon 2026-11-02
    expect(addBusinessDays("2026-11-09", -5)).toBe("2026-11-02");
  });

  it("skips holidays when landing", () => {
    // From Fri 2026-11-06, +1 with Monday a holiday → Tuesday 2026-11-10
    expect(
      addBusinessDays("2026-11-06", 1, DEFAULT_WEEKEND, ["2026-11-09"]),
    ).toBe("2026-11-10");
  });

  it("rejects non-integer and malformed input", () => {
    expect(addBusinessDays("2026-11-02", 1.5)).toBeNull();
    expect(addBusinessDays("bogus", 1)).toBeNull();
  });
});

describe("countBusinessDaysExclusive", () => {
  it("excludes both endpoints", () => {
    // Mon–Fri inclusive is 5; excluding Mon and Fri leaves Tue–Thu = 3
    expect(countBusinessDaysExclusive("2026-11-02", "2026-11-06")).toBe(3);
  });

  it("never returns a negative count", () => {
    expect(countBusinessDaysExclusive("2026-11-02", "2026-11-02")).toBe(0);
  });
});

describe("presets", () => {
  it("exposes the documented weekend presets", () => {
    expect(WEEKEND_PRESETS["Sat–Sun"]).toEqual([0, 6]);
    expect(WEEKEND_PRESETS["Fri–Sat"]).toEqual([5, 6]);
    expect(WEEKEND_PRESETS["Sun–Thu"]).toEqual([0, 5]);
    expect(WEEKEND_PRESETS["None"]).toEqual([]);
  });
});
