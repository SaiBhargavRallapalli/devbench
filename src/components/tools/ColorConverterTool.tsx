"use client";

import { useCallback, useState } from "react";
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
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
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

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const v = max, d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d > 0) {
    if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
}

// ── state ─────────────────────────────────────────────────────────────────────

interface ColorState {
  hex: string;
  r: number; g: number; b: number;
  h: number; sl: number; l: number;
  hv: number; sv: number; v: number;
}

function fromRgb(r: number, g: number, b: number): ColorState {
  const hex = rgbToHex(r, g, b);
  const [h, sl, l] = rgbToHsl(r, g, b);
  const [hv, sv, v] = rgbToHsv(r, g, b);
  return { hex, r, g, b, h, sl, l, hv, sv, v };
}

const INITIAL = fromRgb(99, 102, 241);

// ── component ─────────────────────────────────────────────────────────────────

export default function ColorConverterTool({ tool }: { tool: Tool }) {
  const [color, setColor] = useState<ColorState>(INITIAL);
  const [hexInput, setHexInput] = useState(INITIAL.hex);
  const [copied, setCopied] = useState<string | null>(null);

  const updateFromHex = useCallback((raw: string) => {
    setHexInput(raw);
    const rgb = hexToRgb(raw);
    if (rgb) setColor(fromRgb(...rgb));
  }, []);

  const updateFromRgb = useCallback((r: number, g: number, b: number) => {
    const c = fromRgb(r, g, b);
    setColor(c);
    setHexInput(c.hex);
  }, []);

  const updateFromHsl = useCallback((h: number, s: number, l: number) => {
    const rgb = hslToRgb(h, s, l);
    const c = fromRgb(...rgb);
    setColor(c);
    setHexInput(c.hex);
  }, []);

  const copy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const CopyBtn = ({ text, id }: { text: string; id: string }) => (
    <button
      type="button"
      onClick={() => copy(text, id)}
      title="Copy"
      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {copied === id
        ? <Check className="h-3.5 w-3.5 text-emerald-500" />
        : <Copy className="h-3.5 w-3.5" />}
    </button>
  );

  const { hex, r, g, b, h, sl, l, hv, sv, v } = color;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${sl}%, ${l}%)`;
  const hsvStr = `hsv(${hv}, ${sv}%, ${v}%)`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">

        {/* Picker + HEX input */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Color picker</label>
            <input
              type="color"
              value={hex.length === 7 ? hex : "#6366f1"}
              onChange={(e) => updateFromHex(e.target.value)}
              className="h-16 w-16 cursor-pointer rounded-xl border border-border bg-background p-1"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="mb-2 block text-sm font-medium">HEX</label>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2">
              <input
                value={hexInput}
                onChange={(e) => updateFromHex(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                placeholder="#6366f1"
                spellCheck={false}
              />
              <CopyBtn text={hex} id="hex" />
            </div>
          </div>
        </div>

        {/* Live swatch */}
        <div
          className="h-20 w-full rounded-xl border border-border shadow-inner transition-colors duration-150"
          style={{ background: hex }}
        />

        {/* Format grid */}
        <div className="grid gap-6 sm:grid-cols-2">

          {/* RGB */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">RGB</label>
              <CopyBtn text={rgbStr} id="rgb" />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["R", "G", "B"] as const).map((ch, i) => {
                const val = [r, g, b][i];
                return (
                  <div key={ch}>
                    <label className="mb-1 block text-center text-xs text-muted-foreground">{ch}</label>
                    <input
                      type="number" min={0} max={255}
                      value={val}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
                        const next: [number, number, number] = [r, g, b];
                        next[i] = v;
                        updateFromRgb(...next);
                      }}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center font-mono text-sm"
                    />
                  </div>
                );
              })}
            </div>
            <p className="font-mono text-xs text-muted-foreground">{rgbStr}</p>
          </div>

          {/* HSL */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">HSL</label>
              <CopyBtn text={hslStr} id="hsl" />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["H°", "S%", "L%"] as const).map((ch, i) => {
                const vals = [h, sl, l];
                const maxes = [360, 100, 100];
                return (
                  <div key={ch}>
                    <label className="mb-1 block text-center text-xs text-muted-foreground">{ch}</label>
                    <input
                      type="number" min={0} max={maxes[i]}
                      value={vals[i]}
                      onChange={(e) => {
                        const next = [h, sl, l];
                        next[i] = Math.max(0, Math.min(maxes[i], parseInt(e.target.value, 10) || 0));
                        updateFromHsl(next[0], next[1], next[2]);
                      }}
                      className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-center font-mono text-sm"
                    />
                  </div>
                );
              })}
            </div>
            <p className="font-mono text-xs text-muted-foreground">{hslStr}</p>
          </div>

          {/* HSV (read-only) */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">HSV</label>
              <CopyBtn text={hsvStr} id="hsv" />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["H°", "S%", "V%"] as const).map((ch, i) => (
                <div key={ch}>
                  <label className="mb-1 block text-center text-xs text-muted-foreground">{ch}</label>
                  <input
                    type="number" readOnly
                    value={[hv, sv, v][i]}
                    className="w-full rounded-lg border border-border bg-muted/30 px-2 py-1.5 text-center font-mono text-sm opacity-70"
                  />
                </div>
              ))}
            </div>
            <p className="font-mono text-xs text-muted-foreground">{hsvStr}</p>
          </div>

          {/* CSS snippet */}
          <div>
            <label className="mb-2 block text-sm font-medium">CSS custom property</label>
            <div className="flex items-start gap-1 rounded-xl border border-border bg-muted/30 px-3 py-2">
              <code className="flex-1 break-all font-mono text-xs text-muted-foreground">
                {`--color: ${hex};`}
              </code>
              <CopyBtn text={`--color: ${hex};`} id="css" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
