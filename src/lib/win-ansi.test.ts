import { describe, expect, it } from "vitest";
import { toWinAnsiSafe } from "./win-ansi";

describe("toWinAnsiSafe", () => {
  it("keeps ASCII unchanged", () => {
    expect(toWinAnsiSafe("Hello, World! 123 @#$%")).toBe("Hello, World! 123 @#$%");
  });

  it("keeps common WinAnsi punctuation and Latin-1 accents", () => {
    // Note: NFKC expands the ellipsis "…" (U+2026) to "...", which is expected.
    expect(toWinAnsiSafe("café — “quotes” …")).toBe("café — “quotes” ...");
  });

  it("replaces CJK with the fallback so drawText never throws", () => {
    // Regression: Text-to-PDF / Watermark crashed with
    // `WinAnsi cannot encode "日" (0x65e5)` on any Japanese input.
    expect(toWinAnsiSafe("日本語")).toBe("???");
  });

  it("replaces emoji (multi-code-point) with the fallback", () => {
    expect(toWinAnsiSafe("party 🎉 time")).toBe("party ? time");
  });

  it("supports a custom replacement", () => {
    expect(toWinAnsiSafe("日本", "*")).toBe("**");
  });

  it("normalizes via NFKC so full-width forms become ASCII", () => {
    expect(toWinAnsiSafe("ＡＢＣ")).toBe("ABC");
  });

  it("preserves tab/newline/CR which StandardFonts accept", () => {
    expect(toWinAnsiSafe("a\tb\nc\rd")).toBe("a\tb\nc\rd");
  });

  it("handles empty string", () => {
    expect(toWinAnsiSafe("")).toBe("");
  });

  it("output only contains characters that widthOfTextAtSize accepts (no throw)", async () => {
    // Belt-and-braces: feed the sanitized string to a real pdf-lib font metric
    // call, the exact operation that used to throw.
    const { PDFDocument, StandardFonts } = await import("pdf-lib");
    const doc = await PDFDocument.create();
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const samples = ["日本語 emoji 🎉 mixed café", "مرحبا שלום", "mixed ★ star"];
    for (const s of samples) {
      const safe = toWinAnsiSafe(s);
      expect(() => font.widthOfTextAtSize(safe, 12)).not.toThrow();
    }
  });
});
