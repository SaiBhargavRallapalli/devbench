"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError } from "@/lib/analytics-events";
import { downloadBlob } from "@/lib/pdf-download";
import ToolPageHero from "@/components/tools/ToolPageHero";

// ─── Code 128 (Subset B) encoder ─────────────────────────────────────────────
// Bar/space widths (in modules) for symbol values 0–106. Each pattern starts
// with a bar; 6 widths per symbol except the Stop pattern (value 106).
const CODE128_PATTERNS: string[] = [
  "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
  "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
  "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
  "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
  "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
  "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
  "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214",
  "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
  "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
  "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113",
  "411311", "113141", "114131", "311141", "411131", "211412", "211214", "211232", "2331112",
];

/** Expand alternating bar/space widths into a "1"=bar / "0"=space module string. */
function widthsToBits(widths: string): string {
  let bits = "";
  let bar = true;
  for (const ch of widths) {
    bits += (bar ? "1" : "0").repeat(Number(ch));
    bar = !bar;
  }
  return bits;
}

/**
 * Encode text with Code 128 Subset B: Start B (104), one symbol per ASCII
 * character (value = charCode − 32), a mod-103 checksum, then Stop (106).
 */
function encodeCode128B(text: string): string {
  const values: number[] = [104];
  for (let i = 0; i < text.length; i++) values.push(text.charCodeAt(i) - 32);
  let checksum = 104;
  for (let i = 1; i < values.length; i++) checksum += values[i] * i;
  values.push(checksum % 103, 106);
  return widthsToBits(values.map((v) => CODE128_PATTERNS[v]).join(""));
}

// ─── EAN-13 encoder ──────────────────────────────────────────────────────────
/** Odd-parity (L) codes for digits 0–9. */
const EAN_L = [
  "0001101", "0011001", "0010011", "0111101", "0100011",
  "0110001", "0101111", "0111011", "0110111", "0001011",
];
/** Even-parity (G) codes — R codes reversed. */
const EAN_G = [
  "0100111", "0110011", "0011011", "0100001", "0011101",
  "0111001", "0000101", "0010001", "0001001", "0010111",
];
/** Right-hand (R) codes — complement of L. */
const EAN_R = [
  "1110010", "1100110", "1101100", "1000010", "1011100",
  "1001110", "1010000", "1000100", "1001000", "1110100",
];
/** Parity of the six left digits, selected by the first digit. */
const EAN_FIRST_DIGIT_PARITY = [
  "LLLLLL", "LLGLGG", "LLGGLG", "LLGGGL", "LGLLGG",
  "LGGLLG", "LGGGLL", "LGLGLG", "LGLGGL", "LGGLGL",
];

/** Standard EAN-13 check digit: weights 1,3,1,3… over the first 12 digits. */
function ean13CheckDigit(first12: string): string {
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(first12[i]) * (i % 2 === 0 ? 1 : 3);
  return String((10 - (sum % 10)) % 10);
}

/** Encode 13 validated digits: start guard, L/G group, center guard, R group, end guard. */
function encodeEan13(digits: string): string {
  const parity = EAN_FIRST_DIGIT_PARITY[Number(digits[0])];
  let bits = "101";
  for (let i = 1; i <= 6; i++) {
    const d = Number(digits[i]);
    bits += parity[i - 1] === "L" ? EAN_L[d] : EAN_G[d];
  }
  bits += "01010";
  for (let i = 7; i <= 12; i++) bits += EAN_R[Number(digits[i])];
  return bits + "101";
}

// ─── Shared render model ─────────────────────────────────────────────────────
type Format = "auto" | "code128" | "ean13";

interface Resolved {
  kind: "code128" | "ean13";
  /** Module string: "1" = black bar, "0" = white space. */
  bits: string;
  /** Human-readable text printed under the bars. */
  hri: string;
  note?: string;
}

function quietModules(kind: Resolved["kind"]): { left: number; right: number } {
  // EAN-13 spec: 11 modules left, 7 right. Code 128: 10 each side.
  return kind === "ean13" ? { left: 11, right: 7 } : { left: 10, right: 10 };
}

/**
 * Resolve user input into an encodable barcode, or a friendly error.
 * `fix` carries a corrected EAN-13 number when only the checksum is wrong.
 */
function resolveBarcode(
  raw: string,
  format: Format,
): { resolved?: Resolved; error?: string; fix?: string } {
  const text = raw.trim();
  if (!text) return { error: "Enter text, or a 12/13-digit number, to generate a barcode." };

  const numeric = /^\d+$/.test(text);
  const useEan =
    format === "ean13" ||
    (format === "auto" && numeric && (text.length === 12 || text.length === 13));

  if (useEan) {
    if (!numeric) {
      return {
        error: "EAN-13 needs exactly 13 digits — letters, spaces and symbols cannot be encoded.",
      };
    }
    let digits = text;
    let note: string | undefined;
    if (digits.length === 12) {
      // UPC-A is EAN-13 with a leading zero — the standard equivalence.
      digits = `0${digits}`;
      note = "12-digit input encoded as EAN-13 with a leading zero (UPC-A equivalent).";
    } else if (digits.length !== 13) {
      return {
        error: `EAN-13 needs exactly 13 digits — this input has ${digits.length}.`,
      };
    }
    const expected = ean13CheckDigit(digits.slice(0, 12));
    if (digits[12] !== expected) {
      return {
        error: `Checksum mismatch: for these 12 digits the final check digit should be ${expected}.`,
        fix: digits.slice(0, 12) + expected,
      };
    }
    return { resolved: { kind: "ean13", bits: encodeEan13(digits), hri: digits, note } };
  }

  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    if (c < 32 || c > 126) {
      return {
        error:
          "Code 128 (Subset B) only supports ASCII characters 32–126 — remove emoji, accented letters, or other symbols outside that range.",
      };
    }
  }
  return { resolved: { kind: "code128", bits: encodeCode128B(text), hri: text } };
}

function captionHeight(height: number, caption: boolean): number {
  return caption ? Math.max(20, Math.round(height * 0.22)) : 0;
}

function drawBarcode(
  canvas: HTMLCanvasElement,
  r: Resolved,
  scale: number,
  height: number,
  caption: boolean,
): void {
  const { left, right } = quietModules(r.kind);
  const capH = captionHeight(height, caption);
  canvas.width = (left + r.bits.length + right) * scale;
  canvas.height = height + capH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  for (let i = 0; i < r.bits.length; i++) {
    if (r.bits[i] === "1") ctx.fillRect((left + i) * scale, 0, scale, height);
  }
  if (caption) {
    const size = Math.min(Math.round(capH * 0.66), scale * 7);
    ctx.fillStyle = "#000000";
    ctx.font = `600 ${size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(r.hri, canvas.width / 2, height + capH / 2, canvas.width - 6);
  }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function barcodeToSvg(
  r: Resolved,
  scale: number,
  height: number,
  caption: boolean,
): string {
  const { left, right } = quietModules(r.kind);
  const capH = captionHeight(height, caption);
  const w = (left + r.bits.length + right) * scale;
  const h = height + capH;
  const rects: string[] = [];
  let i = 0;
  while (i < r.bits.length) {
    if (r.bits[i] === "1") {
      let j = i;
      while (j < r.bits.length && r.bits[j] === "1") j++;
      rects.push(
        `<rect x="${(left + i) * scale}" y="0" width="${(j - i) * scale}" height="${height}"/>`,
      );
      i = j;
    } else {
      i++;
    }
  }
  const size = Math.min(Math.round(capH * 0.66), scale * 7);
  const text = caption
    ? `\n  <text x="${w / 2}" y="${height + capH / 2}" text-anchor="middle" dominant-baseline="central" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${size}" font-weight="600" fill="#000000">${escapeXml(r.hri)}</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n  <rect width="${w}" height="${h}" fill="#ffffff"/>\n  <g fill="#000000">${rects.join("")}</g>${text}\n</svg>\n`;
}

// ─── Component ───────────────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

export default function BarcodeGeneratorTool({ tool }: { tool: Tool }) {
  const [text, setText] = useState("https://devbench.example");
  const [format, setFormat] = useState<Format>("auto");
  const [caption, setCaption] = useState(true);
  const [scale, setScale] = useState(2);
  const [height, setHeight] = useState(140);
  const [error, setError] = useState("");
  const [fix, setFix] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { resolved } = useMemo(() => resolveBarcode(text, format), [text, format]);

  // Validate on every change so errors (and the auto-fix offer) show live.
  useEffect(() => {
    const r = resolveBarcode(text, format);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(r.error ?? "");
    setFix(r.fix ?? null);
  }, [text, format]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!resolved) {
      canvas.width = 0;
      canvas.height = 0;
      return;
    }
    drawBarcode(canvas, resolved, scale, height, caption);
  }, [resolved, scale, height, caption]);

  const applyFix = () => {
    if (fix) setText(fix);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !resolved) return;
    canvas.toBlob((blob) => {
      if (!blob) {
        trackToolError("barcode-generator", "download", "toBlob returned null");
        return;
      }
      downloadBlob(blob, `barcode-${resolved.kind}.png`, "barcode-generator");
    }, "image/png");
  };

  const downloadSvg = () => {
    if (!resolved) return;
    const svg = barcodeToSvg(resolved, scale, height, caption);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, `barcode-${resolved.kind}.svg`, "barcode-generator");
  };

  const badge = resolved?.kind === "ean13" ? "EAN-13" : resolved?.kind === "code128" ? "Code 128 · Subset B" : "—";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label htmlFor="bc-text" className="mb-2 block text-sm font-medium">
              Text (or a 12/13-digit number for EAN-13)
            </label>
            <textarea
              id="bc-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              className={inputClass}
              spellCheck={false}
            />
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="bc-format" className="mb-2 block text-sm font-medium">
                Format
              </label>
              <select
                id="bc-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as Format)}
                className={inputClass}
              >
                <option value="auto">Auto (12/13 digits → EAN-13, else Code 128)</option>
                <option value="code128">Code 128 (Subset B)</option>
                <option value="ean13">EAN-13</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
                  <rect x="1" y="2" width="2" height="12" fill="currentColor" />
                  <rect x="5" y="2" width="1" height="12" fill="currentColor" />
                  <rect x="8" y="2" width="3" height="12" fill="currentColor" />
                  <rect x="13" y="2" width="2" height="12" fill="currentColor" />
                </svg>
                {badge}
              </span>
              {resolved?.note && (
                <span className="text-xs text-muted-foreground">{resolved.note}</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={caption}
              onChange={(e) => setCaption(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Human-readable caption
          </label>
          <div>
            <label htmlFor="bc-scale" className="mb-1 block text-sm font-medium">
              Scale ({scale}px per module)
            </label>
            <input
              id="bc-scale"
              type="range"
              min={1}
              max={4}
              step={1}
              value={scale}
              onChange={(e) => setScale(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="bc-height" className="mb-1 block text-sm font-medium">
              Bar height ({height}px)
            </label>
            <input
              id="bc-height"
              type="range"
              min={60}
              max={260}
              step={10}
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value, 10))}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            <span>{error}</span>
            {fix && (
              <button
                type="button"
                onClick={applyFix}
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground"
              >
                <Check className="h-3.5 w-3.5" />
                Use check digit {fix.slice(-1)}
              </button>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={downloadPng}
            disabled={!resolved}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            disabled={!resolved}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download SVG
          </button>
        </div>

        <div className="flex min-h-[220px] items-center justify-center overflow-auto rounded-xl border border-dashed border-border bg-white p-6">
          {resolved ? (
            <canvas ref={canvasRef} className="block h-auto max-w-full" />
          ) : (
            <span className="text-sm text-muted-foreground">
              Enter content to generate a barcode.
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Supports Code 128 (Subset B) and EAN-13 only — not QR, ITF, or standalone UPC-E. EAN-13
          accepts exactly 13 digits; a 12-digit number is encoded as EAN-13 with a leading zero (the
          UPC-A equivalent, which scanners read back as UPC-A). Everything runs 100% in your browser.
          Whether the barcode scans depends on print size, contrast, and the quiet zone around it —
          keep the margins clear and print at a reasonable size.
        </p>
      </div>
    </main>
  );
}
