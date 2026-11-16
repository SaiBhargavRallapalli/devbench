// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * IQ-style reasoning test: item generation and scoring.
 *
 * Everything here is pure and client-side. Visual and numeric items are generated
 * from rules at the start of each attempt, so every answer key is computed rather
 * than typed in by hand (and unit tests check many seeds). Verbal items
 * come from a small hand-written pool.
 *
 * The score is an ESTIMATE on the usual IQ scale (mean 100, SD 15). It is not
 * calibrated against a real norm group, and it is not a clinical assessment.
 */

export type SectionId = "matrix" | "series" | "verbal" | "numerical" | "spatial";

export const SECTIONS: ReadonlyArray<{ id: SectionId; label: string; blurb: string }> = [
  { id: "matrix", label: "Matrix reasoning", blurb: "Find the missing figure in a 3×3 pattern" },
  { id: "series", label: "Number & letter series", blurb: "Work out what comes next" },
  { id: "verbal", label: "Verbal reasoning", blurb: "Analogies, logic and word relationships" },
  { id: "numerical", label: "Numerical reasoning", blurb: "Short word problems with numbers" },
  { id: "spatial", label: "Spatial reasoning", blurb: "Mentally rotate shapes" },
];

export const SECTION_COUNTS: Record<SectionId, number> = {
  matrix: 12,
  series: 8,
  verbal: 8,
  numerical: 6,
  spatial: 6,
};

export const TOTAL_QUESTIONS = 40;
export const TIME_LIMIT_SECONDS = 35 * 60;

/* ── Figures ──────────────────────────────────────────────── */

export type ShapeKind = 0 | 1 | 2; // circle, square, triangle
export type Fig =
  | { kind: "shapes"; shape: number; fill: number; count: number; size: number }
  | { kind: "dots"; bits: boolean[] }
  | { kind: "poly"; cells: Array<[number, number]> };

export interface IqOption {
  text?: string;
  fig?: Fig;
}

export interface IqItem {
  id: string;
  section: SectionId;
  /** 1 (easy) to 5 (hard). */
  difficulty: number;
  prompt: string;
  /** Matrix items: the eight visible cells in reading order; the ninth is missing. */
  grid?: Fig[];
  /** Spatial items: the figure to rotate. */
  target?: Fig;
  options: IqOption[];
  correct: number;
  explanation: string;
}

/* ── Seeded random numbers ────────────────────────────────── */

export type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function pick<T>(rng: Rng, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)] as T;
}

export function shuffle<T>(rng: Rng, list: readonly T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i] as T;
    out[i] = out[j] as T;
    out[j] = tmp;
  }
  return out;
}

/** Puts the correct option at a random position among the distractors. */
function placeCorrect<T>(rng: Rng, correct: T, distractors: T[]): { options: T[]; correct: number } {
  const options = shuffle(rng, [correct, ...distractors]);
  return { options, correct: options.indexOf(correct) };
}

/* ── Matrix items ─────────────────────────────────────────── */

type Attr = "shape" | "fill" | "count" | "size";
type AttrRule = "row" | "col" | "latinA" | "latinB";

function ruleValue(rule: AttrRule, r: number, c: number): number {
  switch (rule) {
    case "row":
      return r;
    case "col":
      return c;
    case "latinA":
      return (r + c) % 3;
    case "latinB":
      return (r + 2 * c) % 3;
  }
}

const RULE_TEXT: Record<AttrRule, string> = {
  row: "stays the same along each row and changes from one row to the next",
  col: "stays the same down each column and changes from one column to the next",
  latinA: "uses each of its three values exactly once in every row and every column",
  latinB: "uses each of its three values exactly once in every row and every column",
};

const ATTR_NAME: Record<Attr, string> = {
  shape: "shape",
  fill: "shading",
  count: "number of shapes",
  size: "size",
};

export function figKey(f: Fig): string {
  if (f.kind === "shapes") return `s${f.shape}${f.fill}${f.count}${f.size}`;
  if (f.kind === "dots") return `d${f.bits.map((b) => (b ? 1 : 0)).join("")}`;
  return `p${f.cells
    .map(([x, y]) => `${x}.${y}`)
    .sort()
    .join("|")}`;
}

function shapesFig(values: Record<Attr, number>): Fig {
  return {
    kind: "shapes",
    shape: values.shape,
    fill: values.fill,
    count: values.count + 1,
    size: values.size,
  };
}

function generateRuleMatrix(rng: Rng, attrCount: 1 | 2 | 3, id: string, difficulty: number): IqItem {
  const allAttrs: Attr[] = ["shape", "fill", "count", "size"];
  const varying = shuffle(rng, allAttrs).slice(0, attrCount);
  const rules = shuffle<AttrRule>(rng, ["row", "col", "latinA", "latinB"]);
  const assigned = new Map<Attr, AttrRule>();
  varying.forEach((a, i) => {
    // The first attribute always uses a latin rule on harder items so the grid is not trivial.
    assigned.set(a, rules[i] as AttrRule);
  });
  // Constant attributes get a fixed random value.
  const constants: Record<Attr, number> = {
    shape: randInt(rng, 0, 2),
    fill: randInt(rng, 0, 2),
    count: randInt(rng, 0, 2),
    size: randInt(rng, 0, 2),
  };
  // Value permutation per varying attribute so "0,1,2" is not always the visual order.
  const perms = new Map<Attr, number[]>();
  for (const a of varying) perms.set(a, shuffle(rng, [0, 1, 2]));

  const cellValues = (r: number, c: number): Record<Attr, number> => {
    const v = { ...constants };
    for (const a of varying) {
      const rule = assigned.get(a) as AttrRule;
      v[a] = (perms.get(a) as number[])[ruleValue(rule, r, c)] as number;
    }
    return v;
  };

  const grid: Fig[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (r === 2 && c === 2) continue;
      grid.push(shapesFig(cellValues(r, c)));
    }
  }
  const answerValues = cellValues(2, 2);
  const answer = shapesFig(answerValues);

  // Distractors: change one or two varying attributes of the answer.
  const seen = new Set<string>([figKey(answer)]);
  const distractors: Fig[] = [];
  let guard = 0;
  while (distractors.length < 4 && guard++ < 200) {
    const v = { ...answerValues };
    const changeCount = attrCount === 1 ? 1 : randInt(rng, 1, 2);
    const attrsToChange = shuffle(rng, varying).slice(0, Math.min(changeCount, varying.length));
    for (const a of attrsToChange) {
      v[a] = (v[a] + randInt(rng, 1, 2)) % 3;
    }
    const f = shapesFig(v);
    const key = figKey(f);
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(f);
  }
  // With a single varying attribute there are only two other values; pad with a changed constant.
  guard = 0;
  while (distractors.length < 4 && guard++ < 200) {
    const v = { ...answerValues };
    const a = pick(rng, allAttrs);
    v[a] = (v[a] + randInt(rng, 1, 2)) % 3;
    if (attrCount > 1 && rng() < 0.5) {
      const b = pick(rng, varying);
      v[b] = (v[b] + randInt(rng, 1, 2)) % 3;
    }
    const f = shapesFig(v);
    const key = figKey(f);
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(f);
  }

  const placed = placeCorrect<Fig>(rng, answer, distractors);
  const lines = varying.map((a) => `The ${ATTR_NAME[a]} ${RULE_TEXT[assigned.get(a) as AttrRule]}.`);
  return {
    id,
    section: "matrix",
    difficulty,
    prompt: "Which figure completes the pattern?",
    grid,
    options: placed.options.map((fig) => ({ fig })),
    correct: placed.correct,
    explanation: `${lines.join(" ")} Applying the same rules to the empty cell gives the correct figure.`,
  };
}

type DotsOp = "union" | "xor" | "minus";

function applyDots(op: DotsOp, a: boolean[], b: boolean[]): boolean[] {
  return a.map((x, i) => {
    const y = b[i] as boolean;
    if (op === "union") return x || y;
    if (op === "xor") return x !== y;
    return x && !y;
  });
}

const DOTS_TEXT: Record<DotsOp, string> = {
  union: "The third figure in each row shows every dot that appears in either of the first two figures.",
  xor: "The third figure in each row keeps the dots that appear in exactly one of the first two figures and removes the dots that appear in both.",
  minus: "The third figure in each row keeps the dots of the first figure that do not appear in the second figure.",
};

const DOTS_OPS: readonly DotsOp[] = ["union", "xor", "minus"];

/**
 * Other supported dot rules that also explain the two completed rows but would
 * give a different figure for the missing cell. A puzzle with any is ambiguous.
 * `grid` holds the eight visible figures in reading order.
 */
export function competingDotsOps(op: DotsOp, grid: Fig[], answerBits: boolean[]): DotsOp[] {
  const bitsAt = (i: number): boolean[] => {
    const f = grid[i];
    return f && f.kind === "dots" ? f.bits : [];
  };
  const answerKey = figKey({ kind: "dots", bits: answerBits });
  return DOTS_OPS.filter((other) => {
    if (other === op) return false;
    for (const row of [0, 1]) {
      const a = bitsAt(row * 3);
      const b = bitsAt(row * 3 + 1);
      const c = bitsAt(row * 3 + 2);
      const out = applyDots(other, a, b);
      if (out.some((v, i) => v !== c[i])) return false;
    }
    const alt = applyDots(other, bitsAt(6), bitsAt(7));
    return figKey({ kind: "dots", bits: alt }) !== answerKey;
  });
}

function randomBits(rng: Rng, minOn: number, maxOn: number): boolean[] {
  for (;;) {
    const bits = Array.from({ length: 9 }, () => rng() < 0.45);
    const n = bits.filter(Boolean).length;
    if (n >= minOn && n <= maxOn) return bits;
  }
}

function generateDotsMatrix(rng: Rng, op: DotsOp, id: string, difficulty: number): IqItem {
  for (let attempt = 0; attempt < 200; attempt++) {
    const rows: boolean[][][] = [];
    for (let r = 0; r < 3; r++) {
      const a = randomBits(rng, 2, 6);
      const b = randomBits(rng, 2, 6);
      rows.push([a, b, applyDots(op, a, b)]);
    }
    const answerBits = (rows[2] as boolean[][])[2] as boolean[];
    const answerOn = answerBits.filter(Boolean).length;
    if (answerOn === 0) continue;
    // Rows must be distinct so the rule is readable.
    const keys = rows.map((row) => row.map((x) => x.map((v) => (v ? 1 : 0)).join("")).join("/"));
    if (new Set(keys).size < 3) continue;
    const grid: Fig[] = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r === 2 && c === 2) continue;
        grid.push({ kind: "dots", bits: (rows[r] as boolean[][])[c] as boolean[] });
      }
    }
    // Reject puzzles where another supported rule also fits but points to a different figure.
    if (competingDotsOps(op, grid, answerBits).length > 0) continue;
    const answer: Fig = { kind: "dots", bits: answerBits };
    const seen = new Set<string>([figKey(answer)]);
    const distractors: Fig[] = [];
    let guard = 0;
    while (distractors.length < 4 && guard++ < 300) {
      const bits = answerBits.slice();
      const flips = randInt(rng, 1, 2);
      for (let k = 0; k < flips; k++) {
        const i = randInt(rng, 0, 8);
        bits[i] = !bits[i];
      }
      if (!bits.some(Boolean)) continue;
      const f: Fig = { kind: "dots", bits };
      const key = figKey(f);
      if (seen.has(key)) continue;
      seen.add(key);
      distractors.push(f);
    }
    if (distractors.length < 4) continue;
    const placed = placeCorrect<Fig>(rng, answer, distractors);
    return {
      id,
      section: "matrix",
      difficulty,
      prompt: "Which figure completes the pattern?",
      grid,
      options: placed.options.map((fig) => ({ fig })),
      correct: placed.correct,
      explanation: `${DOTS_TEXT[op]} Applying that rule to the last row gives the correct figure.`,
    };
  }
  // Practically unreachable; fall back to a simple rule matrix.
  return generateRuleMatrix(rng, 2, id, difficulty);
}

/* ── Series items ─────────────────────────────────────────── */

interface SeriesBuild {
  shown: number[];
  answer: number;
  explanation: string;
  difficulty: number;
  /** Plausible wrong answers produced by a wrong rule. */
  traps: number[];
}

function buildSeries(rng: Rng, kind: number): SeriesBuild {
  switch (kind) {
    case 0: {
      const a = randInt(rng, 2, 20);
      const d = randInt(rng, 3, 9);
      const all = Array.from({ length: 6 }, (_, i) => a + d * i);
      return {
        shown: all.slice(0, 5),
        answer: all[5] as number,
        explanation: `Each number is ${d} more than the one before.`,
        difficulty: 1,
        traps: [(all[4] as number) + d + 1, (all[4] as number) + d - 1],
      };
    }
    case 1: {
      const a = randInt(rng, 1, 4);
      const k = randInt(rng, 2, 3);
      const all = Array.from({ length: 6 }, (_, i) => a * k ** i);
      return {
        shown: all.slice(0, 5),
        answer: all[5] as number,
        explanation: `Each number is ${k} times the one before.`,
        difficulty: 2,
        traps: [(all[4] as number) + (all[4] as number) - (all[3] as number), (all[4] as number) * (k + 1)],
      };
    }
    case 2: {
      // Two interleaved arithmetic series.
      const a = randInt(rng, 2, 12);
      const da = randInt(rng, 2, 5);
      const b = randInt(rng, 30, 60);
      const db = randInt(rng, 3, 7);
      const shown: number[] = [];
      for (let i = 0; i < 6; i++) shown.push(i % 2 === 0 ? a + da * (i / 2) : b - db * ((i - 1) / 2));
      const answer = a + da * 3;
      return {
        shown,
        answer,
        explanation: `Two series are interleaved. Every other number goes up by ${da} (${a}, ${a + da}, ${a + 2 * da}, ...) and the numbers in between go down by ${db}.`,
        difficulty: 3,
        traps: [b - db * 3, (shown[5] as number) - db, answer + da],
      };
    }
    case 3: {
      // Differences grow by one each step.
      const a = randInt(rng, 1, 10);
      const d0 = randInt(rng, 1, 3);
      const all = [a];
      for (let i = 0; i < 5; i++) all.push((all[i] as number) + d0 + i);
      return {
        shown: all.slice(0, 5),
        answer: all[5] as number,
        explanation: `The gaps between numbers are ${d0}, ${d0 + 1}, ${d0 + 2}, ${d0 + 3}, so the next gap is ${d0 + 4}.`,
        difficulty: 3,
        traps: [(all[4] as number) + d0 + 3, (all[4] as number) + d0 + 5],
      };
    }
    case 4: {
      // Each term is the sum of the previous two.
      const a = randInt(rng, 1, 5);
      const b = randInt(rng, 2, 7);
      const all = [a, b];
      for (let i = 2; i < 7; i++) all.push((all[i - 1] as number) + (all[i - 2] as number));
      return {
        shown: all.slice(0, 6),
        answer: all[6] as number,
        explanation: "Each number is the sum of the two numbers before it.",
        difficulty: 3,
        traps: [(all[5] as number) + (all[4] as number) + 1, (all[5] as number) * 2],
      };
    }
    case 5: {
      // Square numbers plus a constant.
      const k = randInt(rng, 1, 9);
      const start = randInt(rng, 1, 4);
      const all = Array.from({ length: 6 }, (_, i) => (start + i) ** 2 + k);
      return {
        shown: all.slice(0, 5),
        answer: all[5] as number,
        explanation: `The numbers are the squares ${Array.from({ length: 5 }, (_, i) => (start + i) ** 2).join(", ")}... each increased by ${k}.`,
        difficulty: 3,
        traps: [(all[4] as number) + (all[4] as number) - (all[3] as number), (start + 5) ** 2],
      };
    }
    case 6: {
      // Alternating operations: multiply, then add.
      const a = randInt(rng, 1, 5);
      const m = randInt(rng, 2, 3);
      const p = randInt(rng, 2, 6);
      const all = [a];
      for (let i = 0; i < 6; i++) all.push(i % 2 === 0 ? (all[i] as number) * m : (all[i] as number) + p);
      return {
        shown: all.slice(0, 6),
        answer: all[6] as number,
        explanation: `The rule alternates: multiply by ${m}, then add ${p}, then repeat.`,
        difficulty: 4,
        traps: [(all[5] as number) + p, (all[5] as number) * m + p],
      };
    }
    default: {
      // Multiply by 2 then subtract a growing amount (hard).
      const a = randInt(rng, 2, 5);
      const all = [a];
      for (let i = 0; i < 5; i++) all.push((all[i] as number) * 2 - (i + 1));
      return {
        shown: all.slice(0, 5),
        answer: all[5] as number,
        explanation: "Each number is double the previous one, minus a step that grows: 1, then 2, then 3, then 4.",
        difficulty: 5,
        traps: [(all[4] as number) * 2, (all[4] as number) * 2 - 4],
      };
    }
  }
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
function letterAt(i: number): string {
  return LETTERS[((i % 26) + 26) % 26] as string;
}

function generateLetterSeries(rng: Rng, id: string, variant: number): IqItem {
  if (variant === 0) {
    const start = randInt(rng, 0, 7);
    const step = randInt(rng, 2, 3);
    const shown = Array.from({ length: 5 }, (_, i) => letterAt(start + step * i));
    const answer = letterAt(start + step * 5);
    const wrong = [letterAt(start + step * 5 + 1), letterAt(start + step * 5 - 1), letterAt(start + step * 4 + 1), letterAt(start + step * 6)];
    return finishText(rng, id, "series", 2, `What comes next?  ${shown.join("  ")}  ?`, answer, wrong, `Each letter is ${step} places after the previous one in the alphabet.`);
  }
  // Two letter streams moving in opposite directions: A Z B Y C X ...
  const start = randInt(rng, 0, 6);
  const fwd = (i: number) => letterAt(start + i);
  const back = (i: number) => letterAt(25 - i);
  const shown = [fwd(0), back(0), fwd(1), back(1), fwd(2), back(2), fwd(3)];
  const answer = back(3);
  const wrong = [fwd(4), back(4), letterAt(25 - 3 + 1), letterAt(start + 4)];
  return finishText(rng, id, "series", 4, `What comes next?  ${shown.join("  ")}  ?`, answer, wrong, "Two sequences alternate: one moves forward through the alphabet and the other moves backward from Z.");
}

function finishText(
  rng: Rng,
  id: string,
  section: SectionId,
  difficulty: number,
  prompt: string,
  answer: string,
  wrong: string[],
  explanation: string,
): IqItem {
  const seen = new Set<string>([answer]);
  const distractors: string[] = [];
  for (const w of wrong) {
    if (seen.has(w)) continue;
    seen.add(w);
    distractors.push(w);
  }
  // Pad with nearby letters when a rule produced duplicates.
  let k = 1;
  while (distractors.length < 4 && k < 30) {
    const base = answer.length === 1 ? answer.charCodeAt(0) - 65 : -1;
    if (base >= 0) {
      const cand = letterAt(base + k * (k % 2 === 0 ? -1 : 1));
      if (!seen.has(cand)) {
        seen.add(cand);
        distractors.push(cand);
      }
    }
    k++;
  }
  const placed = placeCorrect<string>(rng, answer, distractors.slice(0, 4));
  return {
    id,
    section,
    difficulty,
    prompt,
    options: placed.options.map((text) => ({ text })),
    correct: placed.correct,
    explanation,
  };
}

function numberOptions(rng: Rng, answer: number, traps: number[]): { options: string[]; correct: number } {
  const seen = new Set<number>([answer]);
  const distractors: number[] = [];
  const consider = (n: number) => {
    if (n <= 0 && answer > 0) return;
    if (!Number.isFinite(n) || seen.has(n) || distractors.length >= 4) return;
    seen.add(n);
    distractors.push(n);
  };
  for (const t of traps) consider(t);
  const spread = Math.max(2, Math.round(Math.abs(answer) * 0.08));
  const offsets = shuffle(rng, [1, -1, 2, -2, spread, -spread, spread + 1, -(spread + 1), 3, -3, 4, -4, 5, -5, 6]);
  for (const o of offsets) consider(answer + o);
  let extra = 7;
  while (distractors.length < 4) consider(answer + extra++);
  const placed = placeCorrect<number>(rng, answer, distractors);
  return { options: placed.options.map(String), correct: placed.correct };
}

function generateNumberSeries(rng: Rng, id: string, kind: number): IqItem {
  const b = buildSeries(rng, kind);
  const o = numberOptions(rng, b.answer, b.traps);
  return {
    id,
    section: "series",
    difficulty: b.difficulty,
    prompt: `What comes next?  ${b.shown.join(",  ")},  ?`,
    options: o.options.map((text) => ({ text })),
    correct: o.correct,
    explanation: b.explanation,
  };
}

/* ── Numerical reasoning ──────────────────────────────────── */

function generateNumerical(rng: Rng, id: string, kind: number): IqItem {
  switch (kind) {
    case 0: {
      // Ratio.
      const a = randInt(rng, 2, 7);
      const b = randInt(rng, 2, 7) + (a === 2 ? 1 : 0);
      const unit = randInt(rng, 10, 40) * 5;
      const flour = a * unit;
      const sugar = b * unit;
      const o = numberOptions(rng, sugar, [flour - sugar, sugar + unit, Math.round((flour * a) / b)]);
      return {
        id,
        section: "numerical",
        difficulty: 2,
        prompt: `A recipe mixes flour and sugar in the ratio ${a}:${b}. If you use ${flour} g of flour, how many grams of sugar do you need?`,
        options: o.options.map((text) => ({ text })),
        correct: o.correct,
        explanation: `${flour} g is ${a} parts, so one part is ${unit} g. Sugar is ${b} parts, which is ${sugar} g.`,
      };
    }
    case 1: {
      // Discount then increase, as a percentage of the original.
      const price = randInt(rng, 4, 20) * 100;
      const down = pick(rng, [10, 20, 25, 30, 40]);
      const up = pick(rng, [10, 20, 50]);
      const final = (price * (100 - down) * (100 + up)) / 10000;
      const naive = price * (1 + (up - down) / 100);
      const o = numberOptions(rng, final, [naive, price]);
      return {
        id,
        section: "numerical",
        difficulty: 3,
        prompt: `An item costs ${price}. The price is cut by ${down}%, and then the reduced price is raised by ${up}%. What is the final price?`,
        options: o.options.map((text) => ({ text })),
        correct: o.correct,
        explanation: `After the cut the price is ${(price * (100 - down)) / 100}. Raising that by ${up}% gives ${final}. The two percentages apply to different amounts, so they do not simply cancel.`,
      };
    }
    case 2: {
      // Speed, distance, time.
      const speed = pick(rng, [40, 45, 48, 55, 60, 72]);
      const hours = randInt(rng, 2, 5);
      const dist = speed * hours;
      const hours2 = hours + randInt(rng, 1, 3);
      const answer = speed * hours2;
      const o = numberOptions(rng, answer, [dist + speed, dist * 2, Math.round(dist / hours2)]);
      return {
        id,
        section: "numerical",
        difficulty: 1,
        prompt: `A train covers ${dist} km in ${hours} hours at a steady speed. How far does it travel in ${hours2} hours at that speed?`,
        options: o.options.map((text) => ({ text })),
        correct: o.correct,
        explanation: `Speed is ${dist} ÷ ${hours} = ${speed} km per hour. In ${hours2} hours it covers ${speed} × ${hours2} = ${answer} km.`,
      };
    }
    case 3: {
      // Work rate.
      const machines = randInt(rng, 2, 4);
      const hours = randInt(rng, 2, 4);
      const rate = randInt(rng, 5, 12) * 2;
      const items = machines * hours * rate;
      const m2 = machines + randInt(rng, 1, 3);
      const h2 = hours + randInt(rng, 1, 3);
      const answer = m2 * h2 * rate;
      const o = numberOptions(rng, answer, [items * m2, Math.round((items * h2) / hours), (items / machines) * m2]);
      return {
        id,
        section: "numerical",
        difficulty: 3,
        prompt: `${machines} identical machines make ${items} parts in ${hours} hours. How many parts do ${m2} of the same machines make in ${h2} hours?`,
        options: o.options.map((text) => ({ text })),
        correct: o.correct,
        explanation: `One machine makes ${rate} parts per hour (${items} ÷ ${machines} ÷ ${hours}). ${m2} machines for ${h2} hours make ${m2} × ${h2} × ${rate} = ${answer}.`,
      };
    }
    case 4: {
      // Averages: sixth value.
      const n = randInt(rng, 4, 6);
      const avg = randInt(rng, 12, 30);
      const raise = randInt(rng, 2, 5);
      const answer = (avg + raise) * (n + 1) - avg * n;
      const o = numberOptions(rng, answer, [avg + raise, avg + raise * n, avg + raise * (n + 1) - n]);
      return {
        id,
        section: "numerical",
        difficulty: 4,
        prompt: `The average of ${n} numbers is ${avg}. When one more number is added, the average of all ${n + 1} numbers becomes ${avg + raise}. What is the new number?`,
        options: o.options.map((text) => ({ text })),
        correct: o.correct,
        explanation: `The first ${n} numbers total ${avg * n}. All ${n + 1} must total ${(avg + raise) * (n + 1)}. The new number is the difference, ${answer}.`,
      };
    }
    default: {
      // Ages.
      const ben = randInt(rng, 6, 14);
      const mult = pick(rng, [2, 3]);
      const anna = ben * mult;
      const years = randInt(rng, 4, 10);
      const total = anna + years + ben + years;
      const o2 = numberOptions(rng, total, [anna + ben, anna + years, (anna + years) * 2]);
      return {
        id,
        section: "numerical",
        difficulty: 3,
        prompt: `Anna is ${mult} times as old as Ben, and Ben is ${ben}. How old will their combined ages be in ${years} years?`,
        options: o2.options.map((text) => ({ text })),
        correct: o2.correct,
        explanation: `Anna is ${mult} × ${ben} = ${anna} now. In ${years} years Anna is ${anna + years} and Ben is ${ben + years}, together ${total}. Each person gains ${years} years, so the total rises by ${years * 2}.`,
      };
    }
  }
}

/* ── Spatial reasoning ────────────────────────────────────── */

type Cell = [number, number];

function normalize(cells: Cell[]): Cell[] {
  const minX = Math.min(...cells.map((c) => c[0]));
  const minY = Math.min(...cells.map((c) => c[1]));
  return cells
    .map(([x, y]) => [x - minX, y - minY] as Cell)
    .sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}

function cellsKey(cells: Cell[]): string {
  return normalize(cells)
    .map(([x, y]) => `${x}.${y}`)
    .join("|");
}

export function rotate90(cells: Cell[]): Cell[] {
  return normalize(cells.map(([x, y]) => [-y, x] as Cell));
}

export function mirror(cells: Cell[]): Cell[] {
  return normalize(cells.map(([x, y]) => [-x, y] as Cell));
}

function allRotations(cells: Cell[]): Cell[][] {
  const out: Cell[][] = [normalize(cells)];
  for (let i = 1; i < 4; i++) out.push(rotate90(out[i - 1] as Cell[]));
  return out;
}

function randomPolyomino(rng: Rng, size: number): Cell[] {
  const cells: Cell[] = [[1, 1]];
  const has = (x: number, y: number) => cells.some((c) => c[0] === x && c[1] === y);
  while (cells.length < size) {
    const base = pick(rng, cells);
    const dir = pick(rng, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const);
    const nx = base[0] + dir[0];
    const ny = base[1] + dir[1];
    if (nx < 0 || ny < 0 || nx > 3 || ny > 3 || has(nx, ny)) continue;
    cells.push([nx, ny]);
  }
  return normalize(cells);
}

function fitsFourByFour(cells: Cell[]): boolean {
  return Math.max(...cells.map((c) => c[0])) <= 3 && Math.max(...cells.map((c) => c[1])) <= 3;
}

function isConnected(cells: Cell[]): boolean {
  const key = (c: Cell) => `${c[0]}.${c[1]}`;
  const set = new Set(cells.map(key));
  const seen = new Set<string>([key(cells[0] as Cell)]);
  const stack: Cell[] = [cells[0] as Cell];
  while (stack.length) {
    const [x, y] = stack.pop() as Cell;
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ] as const) {
      const k = `${x + dx}.${y + dy}`;
      if (set.has(k) && !seen.has(k)) {
        seen.add(k);
        stack.push([x + dx, y + dy]);
      }
    }
  }
  return seen.size === cells.length;
}

function generateSpatial(rng: Rng, id: string, size: number, mode: "mirror" | "modify", difficulty: number): IqItem {
  for (let attempt = 0; attempt < 500; attempt++) {
    const target = randomPolyomino(rng, size);
    const rots = allRotations(target);
    const rotKeys = new Set(rots.map(cellsKey));
    // The shape must be chiral (its mirror image is not one of its rotations).
    const mirrorRots = allRotations(mirror(target));
    if (mirrorRots.some((m) => rotKeys.has(cellsKey(m)))) continue;
    // Need four distinct orientations so the rotated answer differs from the target.
    if (rotKeys.size < 4) continue;
    const answerCells = pick(rng, rots.slice(1));
    const distractors: Cell[][] = [];
    const seen = new Set<string>(rotKeys);
    if (mode === "mirror") {
      for (const m of shuffle(rng, mirrorRots)) {
        const k = cellsKey(m);
        if (seen.has(k)) continue;
        seen.add(k);
        distractors.push(m);
      }
    } else {
      let guard = 0;
      while (distractors.length < 4 && guard++ < 400) {
        const rot = pick(rng, rots);
        const moved = rot.slice();
        const i = randInt(rng, 0, moved.length - 1);
        const nc: Cell = [randInt(rng, 0, 3), randInt(rng, 0, 3)];
        moved[i] = nc;
        if (new Set(moved.map((c) => `${c[0]}.${c[1]}`)).size < moved.length) continue;
        const norm = normalize(moved);
        if (!fitsFourByFour(norm) || !isConnected(norm)) continue;
        const k = cellsKey(norm);
        if (seen.has(k)) continue;
        // Reject if it is any rotation or mirror of the target.
        if (mirrorRots.some((m) => cellsKey(m) === k)) continue;
        seen.add(k);
        distractors.push(norm);
      }
    }
    if (distractors.length < 4) continue;
    const toFig = (c: Cell[]): Fig => ({ kind: "poly", cells: normalize(c) });
    const placed = placeCorrect<Fig>(rng, toFig(answerCells), distractors.slice(0, 4).map(toFig));
    return {
      id,
      section: "spatial",
      difficulty,
      prompt: "Which option shows the shape on the left turned (rotated) without flipping it over?",
      target: toFig(target),
      options: placed.options.map((fig) => ({ fig })),
      correct: placed.correct,
      explanation:
        mode === "mirror"
          ? "Turning a shape around on the page never changes which way it curls. The wrong options are mirror images, which would need the shape to be flipped over."
          : "Turning a shape around keeps every square in the same position relative to the others. The wrong options have a square in a different place.",
    };
  }
  throw new Error("could not generate spatial item");
}

/* ── Verbal pool ──────────────────────────────────────────── */

interface VerbalSeed {
  difficulty: number;
  prompt: string;
  answer: string;
  wrong: [string, string, string, string];
  explanation: string;
}

export const VERBAL_POOL: readonly VerbalSeed[] = [
  {
    difficulty: 1,
    prompt: "Book is to reading as fork is to ...",
    answer: "eating",
    wrong: ["sleeping", "driving", "painting", "singing"],
    explanation: "A book is used for reading, and a fork is used for eating.",
  },
  {
    difficulty: 1,
    prompt: "Hot is to cold as ascend is to ...",
    answer: "descend",
    wrong: ["climb", "rise", "hill", "tall"],
    explanation: "Hot and cold are opposites. The opposite of ascend (go up) is descend (go down).",
  },
  {
    difficulty: 1,
    prompt: "Doctor is to patient as teacher is to ...",
    answer: "student",
    wrong: ["school", "lesson", "book", "principal"],
    explanation: "A doctor treats a patient, and a teacher instructs a student.",
  },
  {
    difficulty: 1,
    prompt: "Which one does not belong with the others?",
    answer: "carrot",
    wrong: ["apple", "banana", "mango", "grape"],
    explanation: "Apple, banana, mango and grape are fruits. A carrot is a vegetable.",
  },
  {
    difficulty: 2,
    prompt: "Which one does not belong with the others?",
    answer: "sphere",
    wrong: ["triangle", "square", "pentagon", "hexagon"],
    explanation: "The other four are flat (two-dimensional) shapes. A sphere is three-dimensional.",
  },
  {
    difficulty: 2,
    prompt: "Pen is to author as scalpel is to ...",
    answer: "surgeon",
    wrong: ["hospital", "knife", "nurse", "medicine"],
    explanation: "An author writes with a pen, and a surgeon operates with a scalpel: the tool and the person who uses it.",
  },
  {
    difficulty: 2,
    prompt: "Chapter is to book as scene is to ...",
    answer: "play",
    wrong: ["actor", "stage", "theatre", "ticket"],
    explanation: "A chapter is a part of a book, and a scene is a part of a play.",
  },
  {
    difficulty: 2,
    prompt: "Which word is closest in meaning to METICULOUS?",
    answer: "careful",
    wrong: ["lazy", "hasty", "generous", "loud"],
    explanation: "Meticulous means showing great attention to detail, which is closest to careful.",
  },
  {
    difficulty: 2,
    prompt: "Which word is the opposite of SCARCE?",
    answer: "plentiful",
    wrong: ["rare", "tiny", "valuable", "costly"],
    explanation: "Scarce means hard to find or in short supply. Plentiful means there is a lot of it.",
  },
  {
    difficulty: 2,
    prompt: "All bloops are razzies. All razzies are lazzies. Which statement must be true?",
    answer: "All bloops are lazzies.",
    wrong: [
      "All lazzies are bloops.",
      "Some lazzies are not razzies.",
      "No bloops are lazzies.",
      "All razzies are bloops.",
    ],
    explanation: "If every bloop is a razzie and every razzie is a lazzie, then every bloop is a lazzie. The reverse does not follow.",
  },
  {
    difficulty: 3,
    prompt: "Some artists are musicians. All musicians practise daily. Which statement must be true?",
    answer: "Some artists practise daily.",
    wrong: [
      "All artists practise daily.",
      "No musicians are artists.",
      "Everyone who practises daily is a musician.",
      "Some musicians do not practise daily.",
    ],
    explanation: "At least one artist is a musician, and every musician practises daily, so at least one artist practises daily. Nothing is said about all artists.",
  },
  {
    difficulty: 3,
    prompt: "Tom is taller than Sara. Sara is taller than Raj. Maya is shorter than Raj. Who is the second tallest?",
    answer: "Sara",
    wrong: ["Tom", "Raj", "Maya", "It cannot be worked out"],
    explanation: "The order from tallest to shortest is Tom, Sara, Raj, Maya. Sara is second.",
  },
  {
    difficulty: 3,
    prompt: "If the day before yesterday was Thursday, what day will it be tomorrow?",
    answer: "Sunday",
    wrong: ["Friday", "Saturday", "Monday", "Thursday"],
    explanation: "The day before yesterday was Thursday, so yesterday was Friday and today is Saturday. Tomorrow is Sunday.",
  },
  {
    difficulty: 3,
    prompt: "Which pair has the same relationship as FOREST : TREE ?",
    answer: "library : book",
    wrong: ["wheel : car", "page : author", "ocean : boat", "teacher : chalk"],
    explanation: "A forest is a collection made up of trees, and a library is a collection made up of books.",
  },
  {
    difficulty: 4,
    prompt: "None of the engineers at the firm are artists. Priya is an artist at the firm. Which statement must be true?",
    answer: "Priya is not an engineer.",
    wrong: [
      "Priya is an engineer.",
      "All artists are engineers.",
      "Some engineers are artists.",
      "Priya works somewhere else.",
    ],
    explanation: "No engineer at the firm is an artist, and Priya is an artist at the firm, so she cannot be one of its engineers.",
  },
  {
    difficulty: 4,
    prompt: "Brave is to reckless as thrifty is to ...",
    answer: "stingy",
    wrong: ["wealthy", "generous", "poor", "careful"],
    explanation: "Reckless is brave taken too far, and stingy is thrifty taken too far.",
  },
];

function generateVerbal(rng: Rng, seed: VerbalSeed, id: string): IqItem {
  const placed = placeCorrect<string>(rng, seed.answer, seed.wrong.slice());
  return {
    id,
    section: "verbal",
    difficulty: seed.difficulty,
    prompt: seed.prompt,
    options: placed.options.map((text) => ({ text })),
    correct: placed.correct,
    explanation: seed.explanation,
  };
}

/* ── Building a whole test ────────────────────────────────── */

export function buildTest(seed: number): IqItem[] {
  const rng = mulberry32(seed);
  const items: IqItem[] = [];

  // Matrix: 3 easy, 4 medium, 2 hard rule matrices and 3 dot-overlay matrices.
  const matrixSpecs: Array<() => IqItem> = [
    () => generateRuleMatrix(rng, 1, "m1", 1),
    () => generateRuleMatrix(rng, 1, "m2", 1),
    () => generateRuleMatrix(rng, 1, "m3", 2),
    () => generateRuleMatrix(rng, 2, "m4", 2),
    () => generateRuleMatrix(rng, 2, "m5", 3),
    () => generateRuleMatrix(rng, 2, "m6", 3),
    () => generateRuleMatrix(rng, 2, "m7", 3),
    () => generateDotsMatrix(rng, "union", "m8", 3),
    () => generateRuleMatrix(rng, 3, "m9", 4),
    () => generateDotsMatrix(rng, "minus", "m10", 4),
    () => generateRuleMatrix(rng, 3, "m11", 4),
    () => generateDotsMatrix(rng, "xor", "m12", 5),
  ];
  for (const make of matrixSpecs) items.push(make());

  // Series: eight different rule types, easiest first.
  const kinds = shuffle(rng, [2, 3, 4, 5]).slice(0, 3);
  const seriesPlan: Array<() => IqItem> = [
    () => generateNumberSeries(rng, "s1", 0),
    () => generateNumberSeries(rng, "s2", 1),
    () => generateLetterSeries(rng, "s3", 0),
    () => generateNumberSeries(rng, "s4", kinds[0] as number),
    () => generateNumberSeries(rng, "s5", kinds[1] as number),
    () => generateNumberSeries(rng, "s6", kinds[2] as number),
    () => generateNumberSeries(rng, "s7", 6),
    () => generateNumberSeries(rng, "s8", 7),
  ];
  for (const make of seriesPlan) items.push(make());

  // Verbal: pick eight from the pool, balanced by difficulty.
  const byDifficulty = new Map<number, VerbalSeed[]>();
  for (const v of VERBAL_POOL) byDifficulty.set(v.difficulty, [...(byDifficulty.get(v.difficulty) ?? []), v]);
  const chosen: VerbalSeed[] = [];
  const wanted: Record<number, number> = { 1: 2, 2: 3, 3: 2, 4: 1 };
  for (const d of [1, 2, 3, 4]) {
    chosen.push(...shuffle(rng, byDifficulty.get(d) ?? []).slice(0, wanted[d]));
  }
  chosen.forEach((seed, i) => items.push(generateVerbal(rng, seed, `v${i + 1}`)));

  // Numerical: six different problem types.
  const numKinds = shuffle(rng, [0, 1, 2, 3, 4, 5]);
  numKinds
    .map((k, i) => generateNumerical(rng, `n${i + 1}`, k))
    .sort((a, b) => a.difficulty - b.difficulty)
    .forEach((item, i) => items.push({ ...item, id: `n${i + 1}` }));

  // Spatial: five/six-cell shapes with modified distractors first, then mirrors.
  const spatialPlan: Array<[number, "mirror" | "modify", number]> = [
    [5, "modify", 1],
    [5, "modify", 2],
    [5, "mirror", 3],
    [6, "mirror", 3],
    [6, "mirror", 4],
    [7, "mirror", 5],
  ];
  spatialPlan.forEach(([size, mode, diff], i) => items.push(generateSpatial(rng, `p${i + 1}`, size, mode, diff)));

  return items;
}

/* ── Scoring ──────────────────────────────────────────────── */

/**
 * Assumed share of average adults who answer an item of each difficulty correctly.
 * These are design assumptions, not measured norms.
 */
export const EXPECTED_CORRECT: Record<number, number> = { 1: 0.88, 2: 0.72, 3: 0.52, 4: 0.34, 5: 0.2 };

/** Assumed spread (SD) of weighted percent-correct among adults. */
export const ASSUMED_SPREAD = 0.165;

export const IQ_MIN = 70;
export const IQ_MAX = 145;

export interface SectionResult {
  id: SectionId;
  label: string;
  correct: number;
  total: number;
}

export interface IqResult {
  iq: number;
  /** Likely range around the estimate. */
  low: number;
  high: number;
  percentile: number;
  band: string;
  correct: number;
  total: number;
  answered: number;
  weightedPercent: number;
  sections: SectionResult[];
}

export function normalCdf(z: number): number {
  // Abramowitz & Stegun 7.1.26 approximation of erf.
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
  const erf = 1 - poly * Math.exp(-x * x);
  return z >= 0 ? 0.5 * (1 + erf) : 0.5 * (1 - erf);
}

export function percentileForIq(iq: number): number {
  return normalCdf((iq - 100) / 15) * 100;
}

export function classify(iq: number): string {
  if (iq >= 130) return "Very high";
  if (iq >= 120) return "High";
  if (iq >= 110) return "Above average";
  if (iq >= 90) return "Average";
  if (iq >= 80) return "Below average";
  return "Low";
}

/** answers[i] is the chosen option index for item i, or null when unanswered. */
export function scoreTest(items: IqItem[], answers: Array<number | null>): IqResult {
  let earned = 0;
  let expected = 0;
  let possible = 0;
  let correct = 0;
  let answered = 0;
  const sections = new Map<SectionId, SectionResult>();
  for (const s of SECTIONS) sections.set(s.id, { id: s.id, label: s.label, correct: 0, total: 0 });

  items.forEach((item, i) => {
    const w = item.difficulty;
    const p = EXPECTED_CORRECT[item.difficulty] ?? 0.5;
    expected += w * p;
    possible += w;
    const sec = sections.get(item.section) as SectionResult;
    sec.total += 1;
    const a = answers[i] ?? null;
    if (a !== null) answered += 1;
    if (a !== null && a === item.correct) {
      earned += w;
      correct += 1;
      sec.correct += 1;
    }
  });

  const z = possible === 0 ? 0 : (earned - expected) / (ASSUMED_SPREAD * possible);
  const raw = 100 + 15 * z;
  const iq = Math.round(Math.min(IQ_MAX, Math.max(IQ_MIN, raw)));
  const low = Math.max(IQ_MIN - 5, iq - 7);
  const high = Math.min(IQ_MAX + 5, iq + 7);
  return {
    iq,
    low,
    high,
    percentile: percentileForIq(iq),
    band: classify(iq),
    correct,
    total: items.length,
    answered,
    weightedPercent: possible === 0 ? 0 : (earned / possible) * 100,
    sections: SECTIONS.map((s) => sections.get(s.id) as SectionResult),
  };
}

export function formatPercentile(p: number): string {
  if (p >= 99.5) return "top 1% or better";
  return `higher than about ${Math.max(1, Math.round(p))}% of people`;
}
