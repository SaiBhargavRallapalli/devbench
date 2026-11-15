import { describe, expect, it } from "vitest";
import {
  FANCY_STYLE_LIST,
  fancyLabel,
  toFancy,
  type FancyStyle,
} from "./fancy-text";

/** First codepoint of a transformed string. */
function cp(text: string): number {
  return text.codePointAt(0)!;
}

describe("toFancy", () => {
  it("converts A–Z and a–z to mathematical bold", () => {
    expect(cp(toFancy("A", "bold"))).toBe(0x1d400); // 𝐀
    expect(cp(toFancy("z", "bold"))).toBe(0x1d41a + 25); // 𝐳
    expect(cp(toFancy("a", "bold"))).toBe(0x1d41a); // 𝐚
  });

  it("converts digits to bold digits", () => {
    expect(cp(toFancy("0", "bold"))).toBe(0x1d7ce); // 𝟎
    expect(cp(toFancy("9", "bold"))).toBe(0x1d7ce + 9); // 𝟗
  });

  it("maps italic with the special h glyph", () => {
    expect(cp(toFancy("A", "italic"))).toBe(0x1d434); // 𝐴
    expect(cp(toFancy("h", "italic"))).toBe(0x210e); // ℎ
  });

  it("maps monospace to the math monospace block", () => {
    expect(cp(toFancy("A", "monospace"))).toBe(0x1d670); // 𝙰
    expect(cp(toFancy("0", "monospace"))).toBe(0x1d7f6); // 𝟶
  });

  it("shifts ASCII into the fullwidth block", () => {
    expect(cp(toFancy("!", "fullwidth"))).toBe(0xff01); // ！
    expect(cp(toFancy("A", "fullwidth"))).toBe(0xff21); // Ａ
    expect(cp(toFancy(" ", "fullwidth"))).toBe(0x3000); // ideographic space
  });

  it("circles digits (0 is special-cased)", () => {
    expect(cp(toFancy("0", "circled"))).toBe(0x24ea); // ⓪
    expect(cp(toFancy("1", "circled"))).toBe(0x2460); // ①
    expect(cp(toFancy("9", "circled"))).toBe(0x2468); // ⑨
  });

  it("circles letters", () => {
    expect(cp(toFancy("A", "circled"))).toBe(0x24b6); // Ⓐ
    expect(cp(toFancy("a", "circled"))).toBe(0x24d0); // ⓐ
  });

  it("squares letters", () => {
    expect(cp(toFancy("A", "squared"))).toBe(0x1f130); // 🄰
    expect(cp(toFancy("a", "squared"))).toBe(0x1f170); // 🅐
  });

  it("applies combining strikethrough and underline per character", () => {
    expect(toFancy("ab", "strikethrough")).toBe("a\u0336b\u0336");
    // spaces are left alone so words keep their shape
    expect(toFancy("a b", "underlined")).toBe("a\u0332 b\u0332");
  });

  it("builds superscript and subscript digits", () => {
    expect(toFancy("10", "superscript")).toBe("\u00b9\u2070"); // ¹⁰
    expect(toFancy("10", "subscript")).toBe("\u2081\u2080"); // ₁₀
    expect(cp(toFancy("5", "superscript"))).toBe(0x2075); // ⁵
  });

  it("rotates letters upside down", () => {
    expect(cp(toFancy("a", "upside-down"))).toBe(0x250); // ɐ
    expect(cp(toFancy("b", "upside-down"))).toBe(0x71); // q
    expect(cp(toFancy("h", "upside-down"))).toBe(0x265); // ɥ
    expect(cp(toFancy("?", "upside-down"))).toBe(0xbf); // ¿
  });

  it("applies small caps to letters that have glyphs", () => {
    expect(cp(toFancy("c", "small-caps"))).toBe(0x1d04); // ᴄ
    expect(cp(toFancy("a", "small-caps"))).toBe(0x1d00); // ᴀ
    // "x" has no small-cap glyph in the table → passes through
    expect(toFancy("x", "small-caps")).toBe("x");
  });

  it("maps script letters including the out-of-block exceptions", () => {
    expect(cp(toFancy("A", "script"))).toBe(0x1d49c); // 𝒜
    expect(cp(toFancy("B", "script"))).toBe(0x212c); // ℬ (exception)
    expect(cp(toFancy("e", "script"))).toBe(0x212f); // ℯ (exception)
  });

  it("passes unmapped characters (emoji, CJK) through unchanged", () => {
    // Combining styles append marks, so strip those before checking the base
    // characters survived intact.
    const stripMarks = (s: string) => s.replace(/\p{M}/gu, "");
    for (const style of FANCY_STYLE_LIST) {
      const out = stripMarks(toFancy("😀漢字", style));
      expect(out).toContain("😀");
      expect(out).toContain("漢字");
    }
  });

  it("returns an empty string for empty input", () => {
    for (const style of FANCY_STYLE_LIST) {
      expect(toFancy("", style)).toBe("");
    }
  });

  it("preserves length for swap-based styles (no chars added or dropped)", () => {
    for (const style of [
      "bold", "italic", "monospace", "fullwidth", "circled", "squared",
      "superscript", "subscript", "upside-down", "script", "bold-script",
      "bold-italic", "small-caps",
    ] as FancyStyle[]) {
      const input = "Hello 123!";
      expect([...toFancy(input, style)].length).toBe([...input].length);
    }
  });
});

describe("style metadata", () => {
  it("exposes a non-empty label for every style in the list", () => {
    for (const style of FANCY_STYLE_LIST) {
      expect(fancyLabel(style)).toBeTruthy();
    }
  });

  it("list entries have unique labels", () => {
    expect(FANCY_STYLE_LIST.length).toBeGreaterThanOrEqual(12);
    const labels = FANCY_STYLE_LIST.map((s) => fancyLabel(s));
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("covers the headline styles users search for", () => {
    const set = new Set<string>(FANCY_STYLE_LIST);
    for (const s of [
      "bold", "italic", "monospace", "script", "fullwidth", "strikethrough",
    ] as FancyStyle[]) {
      expect(set.has(s)).toBe(true);
    }
  });
});
