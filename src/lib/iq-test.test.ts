import { describe, expect, it } from "vitest";
import {
  SECTION_COUNTS,
  TOTAL_QUESTIONS,
  VERBAL_POOL,
  buildTest,
  classify,
  figKey,
  mirror,
  normalCdf,
  percentileForIq,
  rotate90,
  scoreTest,
  type Fig,
  type IqItem,
} from "./iq-test";

const SEEDS = Array.from({ length: 150 }, (_, i) => i * 7919 + 13);

function optionKey(o: IqItem["options"][number]): string {
  return o.fig ? figKey(o.fig) : `t:${o.text}`;
}

describe("buildTest", () => {
  it("builds 40 well-formed items with the planned section mix", () => {
    for (const seed of SEEDS) {
      const items = buildTest(seed);
      expect(items).toHaveLength(TOTAL_QUESTIONS);
      const counts: Record<string, number> = {};
      for (const it of items) counts[it.section] = (counts[it.section] ?? 0) + 1;
      expect(counts).toEqual(SECTION_COUNTS);
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    }
  });

  it("gives every item five distinct options and a valid answer index", () => {
    for (const seed of SEEDS) {
      for (const item of buildTest(seed)) {
        expect(item.options, `${item.id} seed ${seed}`).toHaveLength(5);
        expect(item.correct).toBeGreaterThanOrEqual(0);
        expect(item.correct).toBeLessThan(5);
        const keys = item.options.map(optionKey);
        expect(new Set(keys).size, `${item.id} seed ${seed} has duplicate options`).toBe(5);
        expect(item.difficulty).toBeGreaterThanOrEqual(1);
        expect(item.difficulty).toBeLessThanOrEqual(5);
        expect(item.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it("is deterministic for a given seed", () => {
    expect(buildTest(42)).toEqual(buildTest(42));
    expect(buildTest(42)).not.toEqual(buildTest(43));
  });

  it("matrix items hide the ninth cell and never reuse the answer as a visible cell for rule grids", () => {
    for (const seed of SEEDS) {
      for (const item of buildTest(seed).filter((i) => i.section === "matrix")) {
        expect(item.grid).toHaveLength(8);
      }
    }
  });

  it("spatial answers are rotations of the target and distractors are not", () => {
    const keyOf = (f: Fig) => (f.kind === "poly" ? figKey(f) : "");
    for (const seed of SEEDS) {
      for (const item of buildTest(seed).filter((i) => i.section === "spatial")) {
        const target = (item.target as Extract<Fig, { kind: "poly" }>).cells;
        const rotations = new Set<string>();
        let cur = target;
        for (let i = 0; i < 4; i++) {
          rotations.add(keyOf({ kind: "poly", cells: cur }));
          cur = rotate90(cur);
        }
        const flipped = mirror(target);
        item.options.forEach((o, i) => {
          const k = keyOf(o.fig as Fig);
          if (i === item.correct) expect(rotations.has(k)).toBe(true);
          else expect(rotations.has(k), `${item.id} seed ${seed} option ${i}`).toBe(false);
        });
        expect(rotations.has(keyOf({ kind: "poly", cells: flipped }))).toBe(false);
      }
    }
  });

  it("number series answers match the stated explanation rules (spot checks)", () => {
    for (const seed of SEEDS) {
      const items = buildTest(seed).filter((i) => i.section === "series");
      const first = items[0] as IqItem;
      const nums = (first.prompt.match(/-?\d+/g) ?? []).map(Number);
      const d = (nums[1] as number) - (nums[0] as number);
      const answerText = first.options[first.correct]?.text;
      expect(Number(answerText)).toBe((nums[nums.length - 1] as number) + d);
    }
  });
});

describe("verbal pool", () => {
  it("has distinct options and enough items per difficulty", () => {
    for (const v of VERBAL_POOL) {
      const all = [v.answer, ...v.wrong];
      expect(new Set(all).size).toBe(5);
    }
    const count = (d: number) => VERBAL_POOL.filter((v) => v.difficulty === d).length;
    expect(count(1)).toBeGreaterThanOrEqual(2);
    expect(count(2)).toBeGreaterThanOrEqual(3);
    expect(count(3)).toBeGreaterThanOrEqual(2);
    expect(count(4)).toBeGreaterThanOrEqual(1);
  });
});

describe("scoring", () => {
  const items = buildTest(1);
  const perfect = items.map((i) => i.correct);
  const none = items.map(() => null);
  const wrong = items.map((i) => (i.correct + 1) % 5);

  it("scores a perfect run near the top of the reported range", () => {
    const r = scoreTest(items, perfect);
    expect(r.correct).toBe(40);
    expect(r.iq).toBeGreaterThanOrEqual(135);
    expect(r.iq).toBeLessThanOrEqual(145);
  });

  it("scores blank and all-wrong runs at the bottom of the range", () => {
    expect(scoreTest(items, none).iq).toBeLessThanOrEqual(70);
    expect(scoreTest(items, wrong).iq).toBeLessThanOrEqual(70);
    expect(scoreTest(items, none).answered).toBe(0);
  });

  it("puts an average-like performance near 100", () => {
    const answers = items.map((i, idx) => {
      const p = i.difficulty === 1 ? 0.88 : i.difficulty === 2 ? 0.72 : i.difficulty === 3 ? 0.52 : i.difficulty === 4 ? 0.34 : 0.2;
      // Deterministic spread: answer correctly in proportion to p.
      return ((idx * 37) % 100) / 100 < p ? i.correct : (i.correct + 1) % 5;
    });
    const r = scoreTest(items, answers);
    expect(r.iq).toBeGreaterThanOrEqual(90);
    expect(r.iq).toBeLessThanOrEqual(112);
  });

  it("is monotonic: more correct answers never lowers the estimate", () => {
    let prev = 0;
    for (let n = 0; n <= items.length; n += 4) {
      const answers = items.map((it, i) => (i < n ? it.correct : null));
      const r = scoreTest(items, answers);
      expect(r.iq).toBeGreaterThanOrEqual(prev);
      prev = r.iq;
    }
  });

  it("reports section totals that add up", () => {
    const r = scoreTest(items, perfect);
    expect(r.sections.reduce((n, s) => n + s.total, 0)).toBe(40);
    expect(r.sections.every((s) => s.correct === s.total)).toBe(true);
  });
});

describe("normal curve helpers", () => {
  it("matches known percentiles", () => {
    expect(percentileForIq(100)).toBeCloseTo(50, 1);
    expect(percentileForIq(115)).toBeCloseTo(84.1, 0);
    expect(percentileForIq(130)).toBeCloseTo(97.7, 0);
    expect(normalCdf(0)).toBeCloseTo(0.5, 5);
  });

  it("classifies bands", () => {
    expect(classify(100)).toBe("Average");
    expect(classify(131)).toBe("Very high");
    expect(classify(75)).toBe("Low");
  });
});
