import { describe, expect, it } from "vitest";
import {
  HANDWRITING_FONTS,
  INK_COLORS,
  PAPER_STYLES,
  estimatePageCount,
  paginateLines,
  ruleLayout,
  wrapTextToLines,
} from "./handwriting";

describe("HANDWRITING_FONTS", () => {
  it("has at least 6 entries with unique ids and honest labels", () => {
    expect(HANDWRITING_FONTS.length).toBeGreaterThanOrEqual(6);
    const ids = HANDWRITING_FONTS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const font of HANDWRITING_FONTS) {
      expect(font.label.length).toBeGreaterThan(0);
      // Web-safe stacks only — no @font-face, no Google Fonts, no URLs.
      expect(font.stack).not.toMatch(/https?:|@font-face|url\(/i);
      // The documented fallback is the generic cursive family.
      expect(font.stack).toMatch(/(^|,\s*)cursive$/);
    }
  });
});

describe("wrapTextToLines", () => {
  it("wraps on word boundaries without splitting words", () => {
    const lines = wrapTextToLines("hello world this is fine", 12);
    expect(lines).toEqual(["hello world", "this is fine"]);
  });

  it("hard-splits words longer than charsPerLine", () => {
    const lines = wrapTextToLines("abcdefghijklmnopqrstuvwxyz", 10);
    expect(lines).toEqual(["abcdefghij", "klmnopqrst", "uvwxyz"]);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(10);
  });

  it("keeps explicit newlines as hard breaks", () => {
    expect(wrapTextToLines("one\ntwo\r\nthree", 40)).toEqual(["one", "two", "three"]);
    // Blank lines are preserved as empty rows.
    expect(wrapTextToLines("a\n\nb", 40)).toEqual(["a", "", "b"]);
  });

  it("handles empty input", () => {
    expect(wrapTextToLines("", 20)).toEqual([""]);
    expect(wrapTextToLines("\n", 20)).toEqual(["", ""]);
  });

  it("trims trailing (and leading) spaces so text starts on the margin", () => {
    expect(wrapTextToLines("hello world   ", 20)).toEqual(["hello world"]);
    expect(wrapTextToLines("   hello", 20)).toEqual(["hello"]);
  });

  it("never exceeds the requested width for ordinary prose", () => {
    const text =
      "The quick brown fox jumps over the lazy dog while seventeen ambitious " +
      "badgers practice calligraphy under a wobbly oak tree near the creek.";
    const lines = wrapTextToLines(text, 24);
    for (const line of lines) expect(line.length).toBeLessThanOrEqual(24);
    expect(lines.join(" ").replace(/\s+/g, " ")).toBe(text);
  });

  it("clamps nonsense charsPerLine values to at least 1", () => {
    expect(wrapTextToLines("ab", 0)).toEqual(["a", "b"]);
    expect(wrapTextToLines("ab", Number.NaN)).toEqual(["a", "b"]);
  });
});

describe("ruleLayout", () => {
  const input = {
    pageWidthPx: 794,
    pageHeightPx: 1123,
    lineSpacingPx: 30,
    marginTopPx: 60,
    marginBottomPx: 60,
    marginLeftPx: 64,
    fontSizePx: 20,
  };

  it("produces monotonically increasing y's within the margins", () => {
    const { lines } = ruleLayout(input);
    expect(lines.length).toBeGreaterThan(10);
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i].y).toBeGreaterThanOrEqual(input.marginTopPx);
      expect(lines[i].y).toBeLessThanOrEqual(input.pageHeightPx - input.marginBottomPx);
      if (i > 0) expect(lines[i].y).toBeGreaterThan(lines[i - 1].y);
    }
    // Evenly spaced.
    expect(lines[1].y - lines[0].y).toBe(input.lineSpacingPx);
  });

  it("respects a page too small for any line", () => {
    const { lines } = ruleLayout({ ...input, pageHeightPx: 100 });
    expect(lines).toEqual([]);
  });

  it("derives charsPerLine from the documented formula", () => {
    const { charsPerLine } = ruleLayout(input);
    const contentW = input.pageWidthPx - 2 * input.marginLeftPx;
    expect(charsPerLine).toBe(Math.floor(contentW / (input.fontSizePx * 0.52)));
    // Sanity: a 20px font fits roughly one char per em on an A4-wide column.
    expect(charsPerLine).toBeGreaterThan(20);
    expect(charsPerLine).toBeLessThan(200);
  });

  it("grows charsPerLine when margins shrink or the font gets smaller", () => {
    const base = ruleLayout(input).charsPerLine;
    expect(ruleLayout({ ...input, marginLeftPx: 20 }).charsPerLine).toBeGreaterThan(base);
    expect(ruleLayout({ ...input, fontSizePx: 14 }).charsPerLine).toBeGreaterThan(base);
  });
});

describe("paginateLines", () => {
  it("chunks an exact multiple evenly", () => {
    const lines = ["a", "b", "c", "d", "e", "f"];
    expect(paginateLines(lines, 3)).toEqual([
      ["a", "b", "c"],
      ["d", "e", "f"],
    ]);
  });

  it("keeps the remainder on the last page", () => {
    const lines = ["a", "b", "c", "d", "e"];
    const pages = paginateLines(lines, 2);
    expect(pages).toEqual([["a", "b"], ["c", "d"], ["e"]]);
    expect(pages.flat()).toEqual(lines);
  });

  it("returns no pages for no lines and clamps bad page sizes", () => {
    expect(paginateLines([], 10)).toEqual([]);
    expect(paginateLines(["a", "b"], 0)).toEqual([["a"], ["b"]]);
  });
});

describe("INK_COLORS / PAPER_STYLES", () => {
  it("exposes blue/black/red with valid hex values", () => {
    expect(INK_COLORS.map((c) => c.id)).toEqual(["blue", "black", "red"]);
    for (const color of INK_COLORS) {
      expect(color.value).toMatch(/^#[0-9a-f]{6}$/i);
      expect(color.label.length).toBeGreaterThan(0);
    }
    expect(INK_COLORS.find((c) => c.id === "blue")?.value).toBe("#1d4ed8");
  });

  it("includes ruled, college-ruled, grid and blank presets with sane spacing", () => {
    const ids = PAPER_STYLES.map((p) => p.id);
    expect(ids).toContain("ruled");
    expect(ids).toContain("college-ruled");
    expect(ids).toContain("grid");
    expect(ids).toContain("none");
    for (const preset of PAPER_STYLES) {
      expect(preset.lineSpacingPx).toBeGreaterThanOrEqual(1);
      expect(preset.lineColor.length).toBeGreaterThan(0);
      expect(["ruled", "grid", "none"]).toContain(preset.kind);
    }
    // Blank paper draws no lines.
    expect(PAPER_STYLES.find((p) => p.id === "none")?.kind).toBe("none");
  });
});

describe("estimatePageCount", () => {
  it("counts pages for wrapped text", () => {
    const charsPerLine = 20;
    const linesPerPage = 5;
    const text = "word ".repeat(50).trim(); // 50 words ≈ 50 lines at 20 chars each
    const pages = estimatePageCount(text, charsPerLine, linesPerPage);
    const expected = Math.ceil(wrapTextToLines(text, charsPerLine).length / linesPerPage);
    expect(pages).toBe(expected);
    expect(pages).toBeGreaterThan(1);
  });

  it("always reports at least one page", () => {
    expect(estimatePageCount("", 40, 30)).toBe(1);
    expect(estimatePageCount("hi", 40, 30)).toBe(1);
  });
});
