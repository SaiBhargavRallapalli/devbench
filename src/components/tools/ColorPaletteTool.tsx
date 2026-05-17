"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";

// ── color math ────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100, ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) =>
    Math.round((ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))) * 255);
  return [f(0), f(8), f(4)];
}

// ── palette generation ─────────────────────────────────────────────────────────

type PaletteType =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split-complementary"
  | "monochromatic";

const PALETTE_OPTIONS: { value: PaletteType; label: string; description: string }[] = [
  { value: "complementary", label: "Complementary", description: "Opposite hues — bold, high-contrast pairs" },
  { value: "analogous", label: "Analogous", description: "Adjacent hues — harmonious, natural feel" },
  { value: "triadic", label: "Triadic", description: "Three equally spaced hues — vibrant and balanced" },
  { value: "tetradic", label: "Tetradic", description: "Four hues 90° apart — rich, varied palette" },
  { value: "split-complementary", label: "Split-complementary", description: "Complement split in two — softer contrast" },
  { value: "monochromatic", label: "Monochromatic", description: "Same hue, different lightness levels" },
];

interface Swatch {
  hex: string;
  label: string;
}

function generatePalette(seedHex: string, type: PaletteType): Swatch[] {
  const rgb = hexToRgb(seedHex);
  if (!rgb) return [];
  const [h, s, l] = rgbToHsl(...rgb);

  const make = (hue: number, sat = s, light = l): string =>
    rgbToHex(...hslToRgb(((hue % 360) + 360) % 360, sat, light));

  switch (type) {
    case "complementary":
      return [
        { hex: seedHex, label: "Primary" },
        { hex: make(h + 180), label: "Complement" },
      ];
    case "analogous":
      return [
        { hex: make(h - 60), label: "−60°" },
        { hex: make(h - 30), label: "−30°" },
        { hex: seedHex, label: "Primary" },
        { hex: make(h + 30), label: "+30°" },
        { hex: make(h + 60), label: "+60°" },
      ];
    case "triadic":
      return [
        { hex: seedHex, label: "Primary" },
        { hex: make(h + 120), label: "Secondary" },
        { hex: make(h + 240), label: "Tertiary" },
      ];
    case "tetradic":
      return [
        { hex: seedHex, label: "Primary" },
        { hex: make(h + 90), label: "Secondary" },
        { hex: make(h + 180), label: "Tertiary" },
        { hex: make(h + 270), label: "Quaternary" },
      ];
    case "split-complementary":
      return [
        { hex: seedHex, label: "Primary" },
        { hex: make(h + 150), label: "Split 1" },
        { hex: make(h + 210), label: "Split 2" },
      ];
    case "monochromatic":
      return [
        { hex: make(h, s, 20), label: "Darkest" },
        { hex: make(h, s, 35), label: "Dark" },
        { hex: make(h, s, 55), label: "Base" },
        { hex: make(h, s, 72), label: "Light" },
        { hex: make(h, s, 88), label: "Lightest" },
      ];
  }
}

// ── export helpers ─────────────────────────────────────────────────────────────

type ExportFmt = "css" | "tailwind" | "array";

function toExport(palette: Swatch[], fmt: ExportFmt): string {
  switch (fmt) {
    case "css":
      return `:root {\n${palette.map((s, i) => `  --color-${i + 1}: ${s.hex}; /* ${s.label} */`).join("\n")}\n}`;
    case "tailwind":
      return JSON.stringify(
        { theme: { extend: { colors: Object.fromEntries(palette.map((s, i) => [`color${i + 1}`, s.hex])) } } },
        null, 2
      );
    case "array":
      return JSON.stringify(palette.map((s) => s.hex), null, 2);
  }
}

// ── component ─────────────────────────────────────────────────────────────────

export default function ColorPaletteTool({ tool }: { tool: Tool }) {
  const [seed, setSeed] = useState("#6366f1");
  const [hexInput, setHexInput] = useState("#6366f1");
  const [paletteType, setPaletteType] = useState<PaletteType>("complementary");
  const [exportFmt, setExportFmt] = useState<ExportFmt>("css");
  const [copied, setCopied] = useState(false);

  const palette = useMemo(() => generatePalette(seed, paletteType), [seed, paletteType]);
  const exportText = useMemo(() => toExport(palette, exportFmt), [palette, exportFmt]);

  const applyHex = (raw: string) => {
    setHexInput(raw);
    if (/^#[0-9a-f]{6}$/i.test(raw.trim())) setSeed(raw.trim());
  };

  const copyExport = () => {
    void navigator.clipboard.writeText(exportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const copyHex = (hex: string) => {
    void navigator.clipboard.writeText(hex);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">

        {/* Seed color */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Seed color</label>
            <input
              type="color"
              value={seed}
              onChange={(e) => { setSeed(e.target.value); setHexInput(e.target.value); }}
              className="h-12 w-12 cursor-pointer rounded-xl border border-border bg-background p-1"
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="mb-2 block text-sm font-medium">HEX value</label>
            <input
              value={hexInput}
              onChange={(e) => applyHex(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              placeholder="#6366f1"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Palette type selector */}
        <div>
          <label className="mb-3 block text-sm font-medium">Palette type</label>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaletteType(opt.value)}
                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                  paletteType === opt.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Swatches */}
        <div>
          <label className="mb-3 block text-sm font-medium">Generated palette</label>
          <div className="flex flex-wrap gap-3">
            {palette.map((swatch) => (
              <button
                key={swatch.hex + swatch.label}
                type="button"
                title={`Copy ${swatch.hex}`}
                onClick={() => copyHex(swatch.hex)}
                className="group flex flex-col items-center gap-1.5"
              >
                <div
                  className="h-16 w-16 rounded-xl border border-border shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: swatch.hex }}
                />
                <span className="font-mono text-xs text-muted-foreground">{swatch.hex}</span>
                <span className="text-xs text-muted-foreground">{swatch.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Click any swatch to copy its hex value.</p>
        </div>

        {/* Export */}
        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <label className="text-sm font-medium">Export</label>
            <div className="flex gap-1">
              {(["css", "tailwind", "array"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFmt(fmt)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    exportFmt === fmt
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {fmt === "css" ? "CSS vars" : fmt === "tailwind" ? "Tailwind" : "Array"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative rounded-xl border border-border bg-muted/30">
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              {exportText}
            </pre>
            <button
              type="button"
              onClick={copyExport}
              className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-background/80 px-2.5 py-1.5 text-xs font-medium backdrop-blur-sm hover:bg-muted"
            >
              {copied
                ? <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
                : <><Copy className="h-3.5 w-3.5" /> Copy</>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
