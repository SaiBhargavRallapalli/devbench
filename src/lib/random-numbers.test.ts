import { describe, expect, it } from "vitest";
import { randomFloat, randomInt, randomInts } from "./random-numbers";

describe("randomInt", () => {
  it("stays within the inclusive bounds", () => {
    for (let i = 0; i < 200; i++) {
      const v = randomInt(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it("maps rng edges onto min and max", () => {
    expect(randomInt(3, 9, () => 0)).toBe(3);
    expect(randomInt(3, 9, () => 0.9999999)).toBe(9);
  });

  it("supports a single-value range", () => {
    expect(randomInt(7, 7, () => 0.5)).toBe(7);
  });

  it("rejects non-integer bounds and inverted ranges", () => {
    expect(() => randomInt(1.5, 5)).toThrow(RangeError);
    expect(() => randomInt(1, 5.5)).toThrow(RangeError);
    expect(() => randomInt(10, 1)).toThrow(RangeError);
  });
});

describe("randomInts", () => {
  it("draws the requested count within bounds", () => {
    const values = randomInts({ min: 1, max: 6, count: 4 });
    expect(values).toHaveLength(4);
    for (const v of values) {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    }
  });

  it("returns unique values when asked, in sorted order", () => {
    const values = randomInts({ min: 1, max: 10, count: 10, unique: true, sort: true });
    expect(values).toHaveLength(10);
    expect(new Set(values).size).toBe(10);
    expect(values).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("never repeats when unique across many draws", () => {
    for (let i = 0; i < 50; i++) {
      const values = randomInts({ min: 0, max: 20, count: 15, unique: true });
      expect(new Set(values).size).toBe(15);
      for (const v of values) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(20);
      }
    }
  });

  it("sorts ascending when sort is set", () => {
    const values = randomInts({ min: 1, max: 100, count: 8, sort: true });
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThanOrEqual(values[i - 1]);
    }
  });

  it("rejects impossible unique draws and bad counts", () => {
    expect(() => randomInts({ min: 1, max: 3, count: 5, unique: true })).toThrow(RangeError);
    expect(() => randomInts({ min: 1, max: 6, count: 0 })).toThrow(RangeError);
    expect(() => randomInts({ min: 1, max: 6, count: 2.5 })).toThrow(RangeError);
    expect(() => randomInts({ min: 10, max: 1, count: 1 })).toThrow(RangeError);
  });

  it("defaults to a single draw", () => {
    expect(randomInts({ min: 1, max: 100 })).toHaveLength(1);
  });
});

describe("randomFloat", () => {
  it("stays within [min, max)", () => {
    for (let i = 0; i < 200; i++) {
      const v = randomFloat(2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThan(5);
    }
  });

  it("maps rng edges onto the range endpoints", () => {
    expect(randomFloat(1, 2, () => 0)).toBe(1);
    expect(randomFloat(1, 2, () => 0.5)).toBeCloseTo(1.5, 10);
  });

  it("rejects an inverted range", () => {
    expect(() => randomFloat(5, 1)).toThrow(RangeError);
  });
});
