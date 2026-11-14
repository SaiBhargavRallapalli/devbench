import { describe, expect, it } from "vitest";
import {
  moonAgeDays,
  moonStateAt,
  nextPhaseEvents,
  phaseDiscPath,
  phaseName,
  SYNODIC_MONTH_DAYS,
} from "./moon-phases";

const MIN = 60_000;

// Published November/December 2026 phase instants (timeanddate.com,
// converted from IST to UTC) — used to pin the ported astronomy to the
// real world rather than only to itself.
const PUBLISHED = {
  newMoon: new Date(Date.UTC(2026, 10, 9, 7, 2)),
  firstQuarter: new Date(Date.UTC(2026, 10, 17, 11, 47)),
  fullMoon: new Date(Date.UTC(2026, 10, 24, 14, 53)),
  lastQuarter: new Date(Date.UTC(2026, 11, 1, 6, 8)),
  // "Moon: 20.4%" as published for 14 Nov 2026, 09:03:48 IST
  illuminationAt: new Date(Date.UTC(2026, 10, 14, 3, 33, 48)),
  illuminationFraction: 0.204,
};

describe("moonStateAt", () => {
  it("stays within physical bounds across a year of samples", () => {
    for (let day = 0; day < 365; day += 3) {
      const s = moonStateAt(new Date(Date.UTC(2026, 0, 1 + day, 12)));
      expect(s.phase).toBeGreaterThanOrEqual(0);
      expect(s.phase).toBeLessThan(1);
      expect(s.fraction).toBeGreaterThanOrEqual(0);
      expect(s.fraction).toBeLessThanOrEqual(1);
      expect(s.waxing).toBe(s.phase < 0.5);
      expect(s.distanceKm).toBeGreaterThan(350_000);
      expect(s.distanceKm).toBeLessThan(410_000);
    }
  });

  it("matches the published illumination for 14 Nov 2026", () => {
    const s = moonStateAt(PUBLISHED.illuminationAt);
    expect(s.fraction).toBeCloseTo(PUBLISHED.illuminationFraction, 1);
    expect(s.waxing).toBe(true);
    expect(phaseName(s.phase)).toBe("Waxing Crescent");
  });
});

describe("phaseName", () => {
  it("names the principal phases at their exact values", () => {
    expect(phaseName(0)).toBe("New Moon");
    expect(phaseName(0.25)).toBe("First Quarter");
    expect(phaseName(0.5)).toBe("Full Moon");
    expect(phaseName(0.75)).toBe("Last Quarter");
  });

  it("names the intermediate phases and wraps near zero", () => {
    expect(phaseName(0.1)).toBe("Waxing Crescent");
    expect(phaseName(0.4)).toBe("Waxing Gibbous");
    expect(phaseName(0.6)).toBe("Waning Gibbous");
    expect(phaseName(0.9)).toBe("Waning Crescent");
    expect(phaseName(0.999)).toBe("New Moon");
    expect(phaseName(-0.25)).toBe("Last Quarter");
  });
});

describe("nextPhaseEvents", () => {
  const from = PUBLISHED.illuminationAt;

  it("returns events strictly after `from`, in order, ~7.4 days apart", () => {
    const events = nextPhaseEvents(from, 6);
    expect(events).toHaveLength(6);
    for (let i = 0; i < events.length; i++) {
      expect(events[i].date.getTime()).toBeGreaterThan(from.getTime());
      if (i > 0) {
        expect(events[i].date.getTime()).toBeGreaterThan(events[i - 1].date.getTime());
        const gapDays = (events[i].date.getTime() - events[i - 1].date.getTime()) / 86_400_000;
        expect(gapDays).toBeGreaterThan(6);
        expect(gapDays).toBeLessThan(9);
      }
    }
  });

  it("cycles through the four kinds in order", () => {
    const events = nextPhaseEvents(from, 8);
    expect(events.map((e) => e.name)).toEqual([
      "First Quarter",
      "Full Moon",
      "Last Quarter",
      "New Moon",
      "First Quarter",
      "Full Moon",
      "Last Quarter",
      "New Moon",
    ]);
  });

  it("lands within minutes of the published November 2026 phases", () => {
    const events = nextPhaseEvents(new Date(Date.UTC(2026, 10, 9, 0, 0)), 4);
    expect(events.map((e) => e.name)).toEqual([
      "New Moon",
      "First Quarter",
      "Full Moon",
      "Last Quarter",
    ]);
    expect(Math.abs(events[0].date.getTime() - PUBLISHED.newMoon.getTime())).toBeLessThan(15 * MIN);
    expect(Math.abs(events[1].date.getTime() - PUBLISHED.firstQuarter.getTime())).toBeLessThan(15 * MIN);
    expect(Math.abs(events[2].date.getTime() - PUBLISHED.fullMoon.getTime())).toBeLessThan(15 * MIN);
    expect(Math.abs(events[3].date.getTime() - PUBLISHED.lastQuarter.getTime())).toBeLessThan(15 * MIN);
  });

  it("produces near-zero, near-full and half illumination at the right instants", () => {
    const events = nextPhaseEvents(new Date(Date.UTC(2026, 10, 9, 0, 0)), 4);
    const fractions = events.map((e) => moonStateAt(e.date).fraction);
    expect(fractions[0]).toBeLessThan(0.01); // new
    expect(fractions[1]).toBeGreaterThan(0.45); // first quarter
    expect(fractions[1]).toBeLessThan(0.55);
    expect(fractions[2]).toBeGreaterThan(0.99); // full
    expect(fractions[3]).toBeGreaterThan(0.45); // last quarter
    expect(fractions[3]).toBeLessThan(0.55);
  });
});

describe("phaseDiscPath", () => {
  it("draws a closed two-arc path from top to bottom and back", () => {
    const path = phaseDiscPath(0.3, 100, 100, 80);
    expect(path.startsWith("M 100 20")).toBe(true);
    expect(path).toContain("A 80 80 0 0 1 100 180"); // waxing limb, right side
    expect(path.endsWith("Z")).toBe(true);
    expect((path.match(/A /g) || []).length).toBe(2);
  });

  it("mirrors the limb arc for a waning phase", () => {
    const path = phaseDiscPath(0.7, 100, 100, 80);
    expect(path).toContain("A 80 80 0 0 0 100 180"); // left side
  });

  it("collapses the terminator to a straight line at quarter phases", () => {
    const path = phaseDiscPath(0.25, 100, 100, 80);
    expect(path).toContain("A 0.000 80 0 0"); // rx = |cos(π/2)|·r ≈ 0
  });

  it("keeps the terminator inside the disc for crescent and gibbous", () => {
    // waxing crescent: k > 0 → terminator sweeps through +x
    expect(phaseDiscPath(0.1, 0, 0, 10)).toContain("A 8.090 10 0 0 0");
    // waxing gibbous: k < 0 → terminator sweeps through −x
    expect(phaseDiscPath(0.4, 0, 0, 10)).toContain("A 8.090 10 0 0 1");
  });
});

describe("moonAgeDays", () => {
  it("spans zero to one synodic month", () => {
    expect(moonAgeDays(0)).toBe(0);
    expect(moonAgeDays(0.5)).toBeCloseTo(SYNODIC_MONTH_DAYS / 2, 10);
    expect(moonAgeDays(1.25)).toBeCloseTo(SYNODIC_MONTH_DAYS / 4, 10);
  });
});
