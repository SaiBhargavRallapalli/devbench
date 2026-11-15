// Copyright (c) 2026 DevBench contributors. MIT License.
/**
 * Unicode text-style transforms for the Fancy Text tool. Each style maps the
 * ASCII/latin range to its styled Unicode counterpart. Characters outside a
 * style's table (emoji, CJK, punctuation the style doesn't cover) pass through
 * unchanged so output never loses content.
 */

export type FancyStyle =
  | "bold"
  | "italic"
  | "bold-italic"
  | "script"
  | "bold-script"
  | "monospace"
  | "fullwidth"
  | "small-caps"
  | "circled"
  | "squared"
  | "strikethrough"
  | "underlined"
  | "superscript"
  | "subscript"
  | "upside-down";

/** Map a contiguous run of ASCII chars onto a contiguous Unicode run. */
function range(fromStart: number, count: number, toStart: number): Map<number, number> {
  const m = new Map<number, number>();
  for (let i = 0; i < count; i++) m.set(fromStart + i, toStart + i);
  return m;
}

/** Merge several tables (later entries win on conflict). */
function merge(...maps: Map<number, number>[]): Map<number, number> {
  const out = new Map<number, number>();
  for (const m of maps) for (const [k, v] of m) out.set(k, v);
  return out;
}

/** A–Z, a–z and 0–9 as three contiguous runs. */
const AZ = 0x41;
const az = 0x61;
const digits = 0x30;

// Mathematical styled alphabets/digits are contiguous A–Z then a–z runs.
const BOLD = merge(range(AZ, 26, 0x1d400), range(az, 26, 0x1d41a), range(digits, 10, 0x1d7ce));
const ITALIC = merge(
  range(AZ, 26, 0x1d434),
  range(az, 26, 0x1d44e),
  // "h" has no italic glyph in the block — it lives at U+210E.
  new Map([[0x68, 0x210e]]),
);
const BOLD_ITALIC = merge(range(AZ, 26, 0x1d468), range(az, 26, 0x1d482));
const MONO = merge(range(AZ, 26, 0x1d670), range(az, 26, 0x1d68a), range(digits, 10, 0x1d7f6));

// Script (cursive) has several letters living outside the block.
const SCRIPT = merge(
  range(AZ, 26, 0x1d49c),
  range(az, 26, 0x1d4b6),
  new Map([
    [0x42, 0x212c], [0x45, 0x2130], [0x46, 0x2131], [0x48, 0x210b],
    [0x49, 0x2110], [0x4c, 0x2112], [0x4d, 0x2133], [0x52, 0x211b],
    [0x65, 0x212f], [0x67, 0x210a],
  ]),
);
const BOLD_SCRIPT = merge(range(AZ, 26, 0x1d4d0), range(az, 26, 0x1d4ea));

// Fullwidth: every printable ASCII glyph shifted into the fullwidth block.
const FULLWIDTH = (() => {
  const m = range(0x21, 0x5e, 0xff01);
  m.set(0x20, 0x3000);
  return m;
})();

const CIRCLED = (() => {
  const m = new Map<number, number>();
  m.set(0x30, 0x24ea); // 0 → ⓪
  for (let d = 1; d <= 9; d++) m.set(0x30 + d, 0x2460 + d - 1); // 1..9 → ①..⑨
  for (let c = 0; c < 26; c++) {
    m.set(0x41 + c, 0x24b6 + c); // Ⓐ..
    m.set(0x61 + c, 0x24d0 + c); // ⓐ..
  }
  return m;
})();

const SQUARED = (() => {
  const m = new Map<number, number>();
  for (let c = 0; c < 26; c++) {
    m.set(0x41 + c, 0x1f130 + c); // 🄰..
    m.set(0x61 + c, 0x1f170 + c); // 🅐..
  }
  return m;
})();

const SUPERSCRIPT = new Map<number, number>([
  [0x30, 0x2070], [0x31, 0x00b9], [0x32, 0x00b2], [0x33, 0x00b3],
  [0x34, 0x2074], [0x35, 0x2075], [0x36, 0x2076], [0x37, 0x2077],
  [0x38, 0x2078], [0x39, 0x2079],
  [0x2b, 0x207a], [0x2d, 0x207b], [0x28, 0x207d], [0x29, 0x207e],
  [0x3d, 0x207c], [0x6e, 0x207f], [0x69, 0x1d62], [0x61, 0x1d43],
  [0x6f, 0x1d52], [0x78, 0x2093],
]);

const SUBSCRIPT = new Map<number, number>([
  [0x30, 0x2080], [0x31, 0x2081], [0x32, 0x2082], [0x33, 0x2083],
  [0x34, 0x2084], [0x35, 0x2085], [0x36, 0x2086], [0x37, 0x2087],
  [0x38, 0x2088], [0x39, 0x2089],
  [0x2b, 0x208a], [0x2d, 0x208b], [0x28, 0x208d], [0x29, 0x208e],
  [0x3d, 0x208c],
  [0x61, 0x2090], [0x65, 0x2091], [0x6f, 0x2092], [0x78, 0x2093],
  [0x68, 0x2095], [0x6b, 0x2096], [0x6c, 0x2097], [0x6d, 0x2098],
  [0x6e, 0x2099], [0x70, 0x209a], [0x73, 0x209b], [0x74, 0x209c],
]);

// Rotated-180° lookalikes (each source char → the char that reads right-way-up
// when the page is flipped).
const UPSIDE_DOWN = new Map<number, number>([
  [0x61, 0x250], [0x62, 0x71], [0x63, 0x254], [0x64, 0x70], [0x65, 0x1dd],
  [0x66, 0x25f], [0x67, 0x183], [0x68, 0x265], [0x69, 0x131], [0x6a, 0x27e],
  [0x6b, 0x29e], [0x6c, 0x285], [0x6d, 0x26f], [0x6e, 0x75], [0x6f, 0x6f],
  [0x70, 0x64], [0x71, 0x62], [0x72, 0x279], [0x73, 0x73], [0x74, 0x287],
  [0x75, 0x6e], [0x76, 0x28c], [0x77, 0x28d], [0x78, 0x78], [0x79, 0x28e],
  [0x7a, 0x7a],
  [0x41, 0x2200], [0x42, 0x42], [0x43, 0x186], [0x44, 0x25d], [0x45, 0x18e],
  [0x46, 0x2132], [0x47, 0x2141], [0x48, 0x48], [0x49, 0x49], [0x4a, 0x17f],
  [0x4b, 0x294], [0x4c, 0x2143], [0x4d, 0x57], [0x4e, 0x4e], [0x4f, 0x4f],
  [0x50, 0x50], [0x51, 0x38c], [0x52, 0x1a5], [0x53, 0x53], [0x54, 0x22a5],
  [0x55, 0x2229], [0x56, 0x39b], [0x57, 0x4d], [0x58, 0x58], [0x59, 0x2144],
  [0x5a, 0x5a],
  [0x30, 0x30], [0x31, 0x31], [0x32, 0x115], [0x33, 0x190], [0x34, 0x263],
  [0x35, 0x3db], [0x36, 0x39], [0x37, 0x111], [0x38, 0x38], [0x39, 0x36],
  [0x2e, 0x2d], [0x2c, 0x27], [0x21, 0xa1], [0x3f, 0xbf], [0x27, 0x2c],
  [0x22, 0x201e], [0x28, 0x29], [0x29, 0x28], [0x3c, 0x3e], [0x3e, 0x3c],
  [0x5b, 0x5d], [0x5d, 0x5b], [0x7b, 0x7d], [0x7d, 0x7b],
]);

// Small-caps: only the letters with dedicated glyphs; the rest pass through.
const SMALL_CAPS = new Map<number, number>(
  Object.entries({
    a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ꜰ", g: "ɢ", h: "ʜ",
    i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ", n: "ɴ", o: "ᴏ", p: "ᴘ",
    q: "ǫ", r: "ʀ", s: "ꜱ", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", y: "ʏ",
    z: "ᴢ",
  }).map(([k, v]) => [k.codePointAt(0)!, v.codePointAt(0)!]),
);

// Combining-character styles are applied per char rather than via a swap.
const COMBINING: Record<string, string> = {
  strikethrough: "\u0336",
  underlined: "\u0332",
};

const STYLE_LABELS: Record<FancyStyle, string> = {
  bold: "Bold",
  italic: "Italic",
  "bold-italic": "Bold Italic",
  script: "Script",
  "bold-script": "Bold Script",
  monospace: "Monospace",
  fullwidth: "Fullwidth",
  "small-caps": "Small Caps",
  circled: "Circled",
  squared: "Squared",
  strikethrough: "Strikethrough",
  underlined: "Underlined",
  superscript: "Superscript",
  subscript: "Subscript",
  "upside-down": "Upside Down",
};

const TABLES: Record<string, Map<number, number>> = {
  bold: BOLD,
  italic: ITALIC,
  "bold-italic": BOLD_ITALIC,
  script: SCRIPT,
  "bold-script": BOLD_SCRIPT,
  monospace: MONO,
  fullwidth: FULLWIDTH,
  "small-caps": SMALL_CAPS,
  circled: CIRCLED,
  squared: SQUARED,
  superscript: SUPERSCRIPT,
  subscript: SUBSCRIPT,
  "upside-down": UPSIDE_DOWN,
};

export function fancyLabel(style: FancyStyle): string {
  return STYLE_LABELS[style];
}

export const FANCY_STYLE_LIST: readonly FancyStyle[] = [
  "bold",
  "italic",
  "bold-italic",
  "script",
  "bold-script",
  "monospace",
  "fullwidth",
  "small-caps",
  "circled",
  "squared",
  "strikethrough",
  "underlined",
  "superscript",
  "subscript",
  "upside-down",
];

/**
 * Transform `text` into the given style. Unmapped codepoints pass through
 * unchanged, so emoji and non-latin scripts are preserved.
 */
export function toFancy(text: string, style: FancyStyle): string {
  const combining = COMBINING[style];
  if (combining) {
    return [...text].map((ch) => (ch === " " ? ch : ch + combining)).join("");
  }

  const table = TABLES[style];
  return [...text]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      const mapped = table.get(cp);
      return mapped !== undefined ? String.fromCodePoint(mapped) : ch;
    })
    .join("");
}
