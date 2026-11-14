import { describe, expect, it } from "vitest";
import {
  ALL_8_ANSWERS,
  DIE_PIPS,
  MAGIC_8_ANSWERS,
  flipCoin,
  outlookOf,
  randomAnswer,
  rollDice,
} from "./fun-random";

/** Deterministic rng sequence. */
function seq(...values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("flipCoin", () => {
  it("maps low rng values to heads and high to tails", () => {
    expect(flipCoin(() => 0)).toBe("heads");
    expect(flipCoin(() => 0.499)).toBe("heads");
    expect(flipCoin(() => 0.5)).toBe("tails");
    expect(flipCoin(() => 0.9999)).toBe("tails");
  });

  it("stays close to 50/50 over many flips", () => {
    let heads = 0;
    for (let i = 0; i < 2000; i++) {
      if (flipCoin() === "heads") heads++;
    }
    expect(heads).toBeGreaterThan(900);
    expect(heads).toBeLessThan(1100);
  });
});

describe("rollDice", () => {
  it("rolls the requested count within the die's faces", () => {
    const roll = rollDice(4, 6, seq(0, 0.2, 0.5, 0.999999));
    expect(roll.values).toEqual([1, 2, 4, 6]);
    expect(roll.total).toBe(13);
  });

  it("produces totals inside the achievable range", () => {
    for (let i = 0; i < 50; i++) {
      const roll = rollDice(3, 6);
      expect(roll.values).toHaveLength(3);
      for (const v of roll.values) {
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(6);
      }
      expect(roll.total).toBeGreaterThanOrEqual(3);
      expect(roll.total).toBeLessThanOrEqual(18);
      expect(roll.total).toBe(roll.values[0] + roll.values[1] + roll.values[2]);
    }
  });

  it("rejects impossible requests instead of rolling nothing", () => {
    expect(() => rollDice(0, 6)).toThrow(RangeError);
    expect(() => rollDice(-2, 6)).toThrow(RangeError);
    expect(() => rollDice(1.5, 6)).toThrow(RangeError);
    expect(() => rollDice(1, 1)).toThrow(RangeError);
    expect(() => rollDice(1, 6.5)).toThrow(RangeError);
  });
});

describe("Magic 8-Ball deck", () => {
  it("holds exactly the canonical 20 unique answers, split 10/5/5", () => {
    expect(MAGIC_8_ANSWERS.positive).toHaveLength(10);
    expect(MAGIC_8_ANSWERS.negative).toHaveLength(5);
    expect(MAGIC_8_ANSWERS.neutral).toHaveLength(5);
    expect(ALL_8_ANSWERS).toHaveLength(20);
    expect(new Set(ALL_8_ANSWERS).size).toBe(20);
  });

  it("only ever draws answers from the deck", () => {
    for (let i = 0; i < 100; i++) {
      expect(ALL_8_ANSWERS).toContain(randomAnswer());
    }
    expect(randomAnswer(seq(0))).toBe(ALL_8_ANSWERS[0]);
    expect(randomAnswer(seq(0.9999))).toBe(ALL_8_ANSWERS[19]);
  });

  it("classifies every answer into an outlook bucket", () => {
    for (const a of ALL_8_ANSWERS) {
      expect(outlookOf(a)).not.toBeNull();
    }
    expect(outlookOf("Yes")).toBe("positive");
    expect(outlookOf("Very doubtful")).toBe("negative");
    expect(outlookOf("Ask again later")).toBe("neutral");
    expect(outlookOf("not an answer")).toBeNull();
  });
});

describe("DIE_PIPS", () => {
  it("covers faces 1-6 with valid, unique grid positions", () => {
    for (let face = 1; face <= 6; face++) {
      const pips = DIE_PIPS[face];
      expect(pips).toHaveLength(face === 1 ? 1 : face);
      expect(new Set(pips).size).toBe(pips.length);
      for (const p of pips) {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(8);
      }
    }
    // opposite faces on a real die sum to 7: 1↔6, 2↔5, 3↔4
    expect(DIE_PIPS[1]).toEqual([4]);
    expect(DIE_PIPS[6]).toEqual([0, 2, 3, 5, 6, 8]);
  });
});
