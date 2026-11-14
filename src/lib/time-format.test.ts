import { describe, expect, it } from "vitest";
import { countdownParts, formatClock, formatStopwatch } from "./time-format";

describe("formatStopwatch", () => {
  it("formats zero and sub-second values", () => {
    expect(formatStopwatch(0)).toBe("00:00.00");
    expect(formatStopwatch(5)).toBe("00:00.00");
    expect(formatStopwatch(999)).toBe("00:00.99");
  });

  it("formats minutes, seconds and centiseconds", () => {
    expect(formatStopwatch(1_000)).toBe("00:01.00");
    expect(formatStopwatch(93_250)).toBe("01:33.25");
    expect(formatStopwatch(3_723_456)).toBe("62:03.45");
  });

  it("clamps negatives to zero", () => {
    expect(formatStopwatch(-120)).toBe("00:00.00");
  });
});

describe("formatClock", () => {
  it("rounds up so the final second displays fully", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(1)).toBe("00:01");
    expect(formatClock(1_500)).toBe("00:02");
    expect(formatClock(59_999)).toBe("01:00");
  });

  it("switches to H:MM:SS at one hour", () => {
    expect(formatClock(60_000)).toBe("01:00");
    expect(formatClock(3_600_000)).toBe("1:00:00");
    expect(formatClock(3_661_000)).toBe("1:01:01");
  });

  it("clamps negatives to zero", () => {
    expect(formatClock(-5)).toBe("00:00");
  });
});

describe("countdownParts", () => {
  it("splits into day/hour/minute/second buckets", () => {
    expect(countdownParts(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    expect(countdownParts(86_400_000 + 3_600_000 + 60_000 + 1_000)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
    });
    expect(countdownParts(59_999)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 59 });
  });

  it("clamps negatives to zero", () => {
    expect(countdownParts(-1)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});
