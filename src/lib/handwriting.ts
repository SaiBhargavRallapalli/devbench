/**
 * Pure logic for the Text to Handwriting tool — no canvas, no DOM, so it stays
 * unit-testable.
 */

/**
 * NOTE: every "handwriting font" here is a web-safe / system stack — nothing is
 * downloaded, so what the user actually sees depends on the fonts installed on
 * THEIR operating system (Windows has Segoe Script, macOS has Bradley Hand /
 * Brush Script MT, etc.). When a stack has no match the browser falls back to
 * the generic `cursive` family, which is itself OS-defined. Labels are kept
 * honest about that instead of promising a specific look.
 */
export interface HandwritingFont {
  id: string;
  label: string;
  /** Canvas/CSS font stack. Multi-word families are quoted for `ctx.font`. */
  stack: string;
}

export const HANDWRITING_FONTS: HandwritingFont[] = [
  {
    id: "windows-script",
    label: "Casual script (Segoe Script / Bradley Hand)",
    stack: '"Segoe Script", "Bradley Hand", cursive',
  },
  {
    id: "bradley-hand",
    label: "Neat handwriting (Bradley Hand)",
    stack: '"Bradley Hand", "Segoe Script", cursive',
  },
  {
    id: "segoe-print",
    label: "Hand print (Segoe Print)",
    stack: '"Segoe Print", "Bradley Hand", cursive',
  },
  {
    id: "brush-script",
    label: "Brush script (Brush Script MT)",
    stack: '"Brush Script MT", cursive',
  },
  {
    id: "comic",
    label: "Casual print (Comic Sans MS)",
    stack: '"Comic Sans MS", cursive',
  },
  {
    id: "chalkboard",
    label: "Chalk style (Chalkboard / Chalkboard SE)",
    stack: '"Chalkboard SE", "Chalkboard", "Segoe Print", "Comic Sans MS", cursive',
  },
  {
    id: "generic-cursive",
    label: "System cursive (built-in fallback)",
    stack: "cursive",
  },
];

/**
 * Word-wrap `text` to at most `charsPerLine` characters per line.
 * - explicit "\n" (and "\r\n") are hard breaks and are always preserved,
 * - wrapping happens on word boundaries — words are never split mid-word unless
 *   a single word is longer than `charsPerLine` (then it is hard-split),
 * - runs of spaces collapse to a single space at join points and trailing
 *   whitespace never reaches a line (it would shift the drawn text right).
 */
export function wrapTextToLines(text: string, charsPerLine: number): string[] {
  const limit =
    Number.isFinite(charsPerLine) && charsPerLine >= 1 ? Math.floor(charsPerLine) : 1;
  const normalized = text.replace(/\r\n?/g, "\n");
  const lines: string[] = [];

  for (const paragraph of normalized.split("\n")) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      // Preserve explicit blank lines (paragraph spacing on the page).
      lines.push("");
      continue;
    }
    const words = trimmed.split(/\s+/);
    let current = "";
    for (const word of words) {
      const trial = current ? `${current} ${word}` : word;
      if (trial.length <= limit) {
        current = trial;
        continue;
      }
      if (current) {
        lines.push(current);
        current = "";
      }
      if (word.length <= limit) {
        current = word;
        continue;
      }
      // Word longer than a whole line — hard-split it into chunks.
      for (let i = 0; i < word.length; i += limit) {
        const chunk = word.slice(i, i + limit);
        if (i + limit < word.length) lines.push(chunk);
        else current = chunk;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

export interface RuleLayoutInput {
  pageWidthPx: number;
  pageHeightPx: number;
  lineSpacingPx: number;
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  /** Used to derive charsPerLine (avg char width ≈ 0.52 × fontSize). */
  fontSizePx: number;
}

export interface RuleLayout {
  /** Baseline/rule y positions, strictly increasing, inside the margins. */
  lines: Array<{ y: number }>;
  charsPerLine: number;
}

/**
 * Evenly spaced rule positions between the top and bottom margins, plus the
 * characters-per-line estimate for wrapping.
 *
 * charsPerLine = floor((pageWidth − both horizontal margins) / (fontSize × 0.52))
 * — 0.52 is a conservative average advance width for handwriting-style faces.
 */
export function ruleLayout(input: RuleLayoutInput): RuleLayout {
  const {
    pageWidthPx,
    pageHeightPx,
    lineSpacingPx,
    marginTopPx,
    marginBottomPx,
    marginLeftPx,
    fontSizePx,
  } = input;

  const marginRightPx = marginLeftPx; // symmetric page margins
  const contentWidth = Math.max(1, pageWidthPx - marginLeftPx - marginRightPx);
  const avgCharWidth = Math.max(1, fontSizePx * 0.52);
  const charsPerLine = Math.max(1, Math.floor(contentWidth / avgCharWidth));

  const spacing = Math.max(1, lineSpacingPx);
  const available = Math.max(0, pageHeightPx - marginTopPx - marginBottomPx);
  const count = Math.max(0, Math.floor(available / spacing));

  const lines: Array<{ y: number }> = [];
  for (let i = 0; i < count; i++) {
    // First rule sits one spacing below the top margin so text drawn with its
    // baseline on the rule never clips against the margin.
    lines.push({ y: marginTopPx + (i + 1) * spacing });
  }
  return { lines, charsPerLine };
}

/** Split `lines` into pages of `linesPerPage` rows (last page may be partial). */
export function paginateLines(lines: string[], linesPerPage: number): string[][] {
  if (lines.length === 0) return [];
  const size = Math.max(1, Math.floor(linesPerPage));
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += size) {
    pages.push(lines.slice(i, i + size));
  }
  return pages;
}

export interface InkColor {
  id: string;
  label: string;
  value: string;
}

export const INK_COLORS: InkColor[] = [
  { id: "blue", label: "Blue ink", value: "#1d4ed8" },
  { id: "black", label: "Black ink", value: "#111111" },
  { id: "red", label: "Red ink", value: "#dc2626" },
];

export type PaperKind = "ruled" | "grid" | "none";

export interface PaperStyle {
  id: string;
  label: string;
  kind: PaperKind;
  /** Rule/grid line color drawn on the white paper. */
  lineColor: string;
  /** Default line spacing (px) used when this style is selected. */
  lineSpacingPx: number;
}

export const PAPER_STYLES: PaperStyle[] = [
  { id: "ruled", label: "Ruled", kind: "ruled", lineColor: "#9db2d6", lineSpacingPx: 30 },
  { id: "college-ruled", label: "College ruled", kind: "ruled", lineColor: "#a9b7d4", lineSpacingPx: 26 },
  { id: "grid", label: "Grid", kind: "grid", lineColor: "#bcc7dd", lineSpacingPx: 24 },
  { id: "none", label: "Blank", kind: "none", lineColor: "transparent", lineSpacingPx: 32 },
];

/** How many pages of rules the given text needs. Always at least 1. */
export function estimatePageCount(
  text: string,
  charsPerLine: number,
  linesPerPage: number,
): number {
  const perPage = Math.max(1, Math.floor(linesPerPage));
  const lines = wrapTextToLines(text, charsPerLine);
  return Math.max(1, Math.ceil(lines.length / perPage));
}
