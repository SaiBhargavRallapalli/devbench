import { describe, expect, it } from "vitest";
import {
  joinPageTexts,
  looksLikeScannedPdf,
  parsePageRange,
  wordStats,
} from "./pdf-text";

describe("parsePageRange", () => {
  it("returns all pages for empty / whitespace input", () => {
    expect(parsePageRange("", 5)).toEqual([1, 2, 3, 4, 5]);
    expect(parsePageRange("   ", 3)).toEqual([1, 2, 3]);
  });

  it("returns an empty list when pageCount is 0 and input is blank", () => {
    expect(parsePageRange("", 0)).toEqual([]);
  });

  it("parses simple lists and single pages", () => {
    expect(parsePageRange("2", 10)).toEqual([2]);
    expect(parsePageRange("1,3,5", 10)).toEqual([1, 3, 5]);
  });

  it("parses mixed ranges and singles like 1-3,5,7-9", () => {
    expect(parsePageRange("1-3,5,7-9", 20)).toEqual([1, 2, 3, 5, 7, 8, 9]);
  });

  it("dedupes and sorts ascending", () => {
    expect(parsePageRange("5,1-3,2", 10)).toEqual([1, 2, 3, 5]);
    expect(parsePageRange("9,9,9", 10)).toEqual([9]);
  });

  it("clamps ranges and singles past the page count", () => {
    expect(parsePageRange("1-99", 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(parsePageRange("8-15", 10)).toEqual([8, 9, 10]);
    expect(parsePageRange("42", 10)).toEqual([10]);
  });

  it("tolerates stray commas and inner whitespace", () => {
    expect(parsePageRange(" 1 - 3 , 5 ", 10)).toEqual([1, 2, 3, 5]);
    expect(parsePageRange("1,,3", 10)).toEqual([1, 3]);
  });

  it("returns null for reversed ranges", () => {
    expect(parsePageRange("5-3", 10)).toBeNull();
  });

  it("returns null for invalid tokens", () => {
    expect(parsePageRange("abc", 10)).toBeNull();
    expect(parsePageRange("1-x", 10)).toBeNull();
    expect(parsePageRange("1-2-3", 10)).toBeNull();
    expect(parsePageRange("0", 10)).toBeNull();
    expect(parsePageRange("0-3", 10)).toBeNull();
    expect(parsePageRange("-2", 10)).toBeNull();
    expect(parsePageRange("1.5", 10)).toBeNull();
    expect(parsePageRange("3,", 10)).not.toBeNull(); // trailing comma is fine
  });
});

describe("joinPageTexts", () => {
  it("joins pages with a blank line", () => {
    expect(joinPageTexts(["Page one.", "Page two."])).toBe("Page one.\n\nPage two.");
  });

  it("returns an empty string for no pages", () => {
    expect(joinPageTexts([])).toBe("");
  });

  it("trims trailing whitespace per page", () => {
    expect(joinPageTexts(["hello   ", "world"])).toBe("hello\n\nworld");
    expect(joinPageTexts(["hello   \n\n", "  ", "world"])).toBe("hello\n\nworld");
  });

  it("collapses runs of 3+ newlines to a blank line", () => {
    expect(joinPageTexts(["a\n\n\n\nb"])).toBe("a\n\nb");
    expect(joinPageTexts(["a\n\n\n\n\n\nb"])).toBe("a\n\nb");
    expect(joinPageTexts(["a\n\nb"])).toBe("a\n\nb");
  });
});

describe("wordStats", () => {
  it("counts chars, words and lines", () => {
    expect(wordStats("hello world")).toEqual({ chars: 11, words: 2, lines: 1 });
    expect(wordStats("a\nb c\nd")).toEqual({ chars: 7, words: 4, lines: 3 });
  });

  it("returns all zeros for empty text", () => {
    expect(wordStats("")).toEqual({ chars: 0, words: 0, lines: 0 });
  });

  it("counts whitespace-only text as zero words but real lines/chars", () => {
    expect(wordStats("  ")).toEqual({ chars: 2, words: 0, lines: 1 });
    expect(wordStats("\n\n")).toEqual({ chars: 2, words: 0, lines: 3 });
  });
});

describe("looksLikeScannedPdf", () => {
  it("flags pages with essentially no text as scanned", () => {
    expect(looksLikeScannedPdf([""])).toBe(true);
    expect(looksLikeScannedPdf([])).toBe(true);
    expect(looksLikeScannedPdf(["", "   ", "\n"])).toBe(true);
    expect(looksLikeScannedPdf(["tiny", ""])).toBe(true); // 4 chars total < 10
  });

  it("does not flag PDFs with a real text layer", () => {
    expect(looksLikeScannedPdf(["Hello world, this is page one."])).toBe(false);
    expect(looksLikeScannedPdf(["short", "enough combined text"])).toBe(false);
  });

  it("uses the 10-char threshold inclusively", () => {
    expect(looksLikeScannedPdf(["123456789"])).toBe(true); // 9 chars
    expect(looksLikeScannedPdf(["1234567890"])).toBe(false); // 10 chars
  });
});
