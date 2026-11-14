// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Pure randomness helpers for the fun tools: coin flips, dice rolls and
 * the Magic 8-Ball's answer deck. Every function takes an injectable
 * `rng` so the tests are deterministic; the components pass `Math.random`.
 */

export type CoinSide = "heads" | "tails";

/** Flip one coin. `rng` returns [0, 1). */
export function flipCoin(rng: () => number = Math.random): CoinSide {
  return rng() < 0.5 ? "heads" : "tails";
}

export interface DiceRoll {
  values: number[];
  total: number;
}

/**
 * Roll `count` dice of `sides` faces each. Throws a RangeError on
 * count < 1 or sides < 2 so a caller bug never silently rolls nothing.
 */
export function rollDice(
  count: number,
  sides: number,
  rng: () => number = Math.random,
): DiceRoll {
  if (!Number.isInteger(count) || count < 1) {
    throw new RangeError(`dice count must be a positive integer, got ${count}`);
  }
  if (!Number.isInteger(sides) || sides < 2) {
    throw new RangeError(`die must have at least 2 sides, got ${sides}`);
  }
  const values: number[] = [];
  for (let i = 0; i < count; i++) {
    values.push(1 + Math.floor(rng() * sides));
  }
  return { values, total: values.reduce((sum, v) => sum + v, 0) };
}

/** The Magic 8-Ball's canonical 20 answers, by outlook. */
export const MAGIC_8_ANSWERS = {
  positive: [
    "It is certain",
    "It is decidedly so",
    "Without a doubt",
    "Yes — definitely",
    "You may rely on it",
    "As I see it, yes",
    "Most likely",
    "Outlook good",
    "Yes",
    "Signs point to yes",
  ],
  negative: [
    "Don't count on it",
    "My reply is no",
    "My sources say no",
    "Outlook not so good",
    "Very doubtful",
  ],
  neutral: [
    "Reply hazy — try again",
    "Ask again later",
    "Better not tell you now",
    "Cannot predict now",
    "Concentrate and ask again",
  ],
} as const;

export type Outlook = keyof typeof MAGIC_8_ANSWERS;

/** All 20 answers flattened, in deck order. */
export const ALL_8_ANSWERS: readonly string[] = [
  ...MAGIC_8_ANSWERS.positive,
  ...MAGIC_8_ANSWERS.negative,
  ...MAGIC_8_ANSWERS.neutral,
];

/** One draw from the deck. */
export function randomAnswer(rng: () => number = Math.random): string {
  return ALL_8_ANSWERS[Math.floor(rng() * ALL_8_ANSWERS.length)];
}

/** Which outlook bucket an answer belongs to (for colouring/history). */
export function outlookOf(answer: string): Outlook | null {
  if ((MAGIC_8_ANSWERS.positive as readonly string[]).includes(answer)) return "positive";
  if ((MAGIC_8_ANSWERS.negative as readonly string[]).includes(answer)) return "negative";
  if ((MAGIC_8_ANSWERS.neutral as readonly string[]).includes(answer)) return "neutral";
  return null;
}

/** Pip positions (3×3 grid indexes) for each face of a six-sided die. */
export const DIE_PIPS: Record<number, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};
