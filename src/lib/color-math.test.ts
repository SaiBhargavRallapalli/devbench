import { describe, expect, it } from "vitest";
import {
  hexToRgb,
  hslToRgb,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "./color-math";

describe("hexToRgb", () => {
  it("parses 6-digit hex with hash", () => {
    expect(hexToRgb("#6366f1")).toEqual([99, 102, 241]);
  });

  it("parses without hash", () => {
    expect(hexToRgb("000000")).toEqual([0, 0, 0]);
  });

  it("returns null for invalid input", () => {
    expect(hexToRgb("#fff")).toBeNull();
    expect(hexToRgb("")).toBeNull();
    expect(hexToRgb("#gg0000")).toBeNull();
  });
});

describe("rgbToHex", () => {
  it("formats known RGB", () => {
    expect(rgbToHex(99, 102, 241)).toBe("#6366f1");
  });

  it("clamps out-of-range values", () => {
    expect(rgbToHex(-10, 300, 128)).toBe("#00ff80");
  });
});

describe("round-trip", () => {
  it("HSL → RGB → HSL stays close for a saturated mid tone", () => {
    const [r, g, b] = hslToRgb(220, 70, 50);
    const [h, s, l] = rgbToHsl(r, g, b);
    expect(Math.abs(h - 220)).toBeLessThanOrEqual(1);
    expect(Math.abs(s - 70)).toBeLessThanOrEqual(1);
    expect(Math.abs(l - 50)).toBeLessThanOrEqual(1);
    expect(b).toBeGreaterThan(r);
  });

  it("rgbToHsv returns 0 saturation for gray", () => {
    expect(rgbToHsv(128, 128, 128)).toEqual([0, 0, 50]);
  });
});
