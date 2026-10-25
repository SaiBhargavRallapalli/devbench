/**
 * Pure helpers for the PDF → Text extractor.
 *
 * No DOM, no pdf.js — the tool component handles reading pages and calls these
 * for range parsing, text assembly, stats, and scanned-PDF detection.
 */

/**
 * Parse a user-typed page range like `"1-3,5,7-9"` into ascending, deduped,
 * 1-based page numbers clamped to `pageCount`.
 *
 * Behavior:
 * - Blank / whitespace-only input → all pages (`[1..pageCount]`).
 * - Ranges that extend past the end are clamped (`"1-99"` on a 10-page PDF → 1–10).
 * - Duplicates are removed and the result is sorted ascending.
 * - Anything invalid (non-numeric, zero/negative, reversed like `"5-3"`,
 *   unparseable tokens) → `null` so the caller can show a friendly error.
 */
export function parsePageRange(input: string, pageCount: number): number[] | null {
  const all = (): number[] =>
    Array.from({ length: Math.max(0, Math.floor(pageCount)) }, (_, i) => i + 1);

  const trimmed = input.trim();
  if (trimmed === "") return all();

  const picked = new Set<number>();

  for (const rawToken of trimmed.split(",")) {
    const token = rawToken.trim();
    if (token === "") continue; // tolerate stray/double commas

    const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);
    if (!match) return null;

    const start = Number(match[1]);
    const end = match[2] !== undefined ? Number(match[2]) : start;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null;
    if (start < 1 || end < 1) return null;
    if (start > end) return null; // reversed range ("5-3") — treat as a typo

    const clampedStart = Math.min(start, Math.max(1, pageCount));
    const clampedEnd = Math.min(end, Math.max(1, pageCount));
    for (let p = clampedStart; p <= clampedEnd; p++) picked.add(p);
  }

  if (picked.size === 0) return null;
  return Array.from(picked).sort((a, b) => a - b);
}

/**
 * Assemble per-page texts into one document string.
 *
 * - Each page's trailing whitespace is trimmed.
 * - Pages are joined with a blank line (`"\n\n"`).
 * - Runs of 3+ newlines collapse to a single blank line.
 */
export function joinPageTexts(texts: string[]): string {
  const joined = texts
    .map((t) => t.replace(/\s+$/u, ""))
    .join("\n\n");
  return joined.replace(/\n{3,}/gu, "\n\n");
}

export interface WordStats {
  chars: number;
  words: number;
  lines: number;
}

/** Character / word / line counts for extracted text. Empty text → all zeros. */
export function wordStats(text: string): WordStats {
  if (text === "") return { chars: 0, words: 0, lines: 0 };
  const trimmed = text.trim();
  return {
    chars: text.length,
    words: trimmed === "" ? 0 : trimmed.split(/\s+/u).length,
    lines: text.split("\n").length,
  };
}

/**
 * Heuristic scanned-PDF detector: if the extracted text across all pages totals
 * fewer than 10 characters, the PDF almost certainly has no text layer (it's a
 * scan) and the caller should suggest OCR instead of showing an empty result.
 */
export function looksLikeScannedPdf(texts: string[]): boolean {
  const total = texts.reduce((sum, t) => sum + t.trim().length, 0);
  return total < 10;
}
