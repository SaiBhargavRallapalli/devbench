/**
 * pdf-lib's StandardFonts use WinAnsi (Windows-1252) encoding and throw
 * `WinAnsi cannot encode "日" (0x65e5)` on anything outside that set — emoji,
 * CJK, etc. Every client-side PDF tool that calls `drawText` /
 * `widthOfTextAtSize` on user-supplied text must pass it through
 * `toWinAnsiSafe` first, otherwise non-Latin input crashes the download.
 */

/** Extra Unicode code points mapped by WinAnsi / Windows-1252 (beyond U+00A0–U+00FF). */
const WIN_ANSI_EXTRAS = new Set<number>([
  0x20ac, 0x201a, 0x0192, 0x201e, 0x2026, 0x2020, 0x2021, 0x02c6, 0x2030, 0x0160,
  0x2039, 0x0152, 0x017d, 0x2018, 0x2019, 0x201c, 0x201d, 0x2022, 0x2013, 0x2014,
  0x02dc, 0x2122, 0x0161, 0x203a, 0x0153, 0x017e, 0x0178,
]);

function isWinAnsiCodePoint(cp: number): boolean {
  if (cp === 0x09 || cp === 0x0a || cp === 0x0d) return true;
  if (cp >= 0x20 && cp <= 0x7e) return true;
  if (cp >= 0xa0 && cp <= 0xff) return true;
  return WIN_ANSI_EXTRAS.has(cp);
}

/**
 * Replace characters that pdf-lib StandardFonts cannot encode (emoji, CJK, etc.)
 * so `drawText` / `widthOfTextAtSize` never throw `WinAnsi cannot encode`.
 */
export function toWinAnsiSafe(text: string, replacement = "?"): string {
  const normalized = text.normalize("NFKC");
  let out = "";
  for (const ch of normalized) {
    const cp = ch.codePointAt(0)!;
    out += isWinAnsiCodePoint(cp) ? ch : replacement;
  }
  return out;
}
