"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Copy, Check, Eye } from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";

interface Shadow {
  id: number;
  inset: boolean;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  opacity: number;
}

let nextId = 1;

function hexToRgba(hex: string, opacity: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function shadowToCss(s: Shadow): string {
  const color = hexToRgba(s.color, s.opacity);
  return `${s.inset ? "inset " : ""}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`;
}

function defaultShadow(): Shadow {
  return { id: nextId++, inset: false, x: 4, y: 4, blur: 16, spread: 0, color: "#000000", opacity: 0.25 };
}

function SliderRow({
  label, value, min, max, step = 1, unit = "px",
  onChange,
}: {
  label: string; value: number; min: number; max: number; step?: number; unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr_52px] items-center gap-3">
      <label className="text-xs text-muted-foreground">{label}</label>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
      <div className="flex items-center">
        <input
          type="number" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-1.5 py-1 text-xs rounded-md border border-border bg-background text-center font-mono focus:outline-none focus:ring-1 focus:ring-ring/40"
        />
        <span className="text-[10px] text-muted-foreground ml-1 w-4">{unit}</span>
      </div>
    </div>
  );
}

export default function CssBoxShadowTool({ tool }: { tool: Tool }) {
  const [shadows, setShadows] = useState<Shadow[]>([defaultShadow()]);
  const [copied, setCopied] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [boxColor, setBoxColor] = useState("#6366f1");

  const css = shadows.map(shadowToCss).join(",\n  ");
  const fullCss = `box-shadow: ${css};`;

  const update = useCallback((id: number, patch: Partial<Shadow>) => {
    setShadows((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const remove = useCallback((id: number) => {
    setShadows((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const add = useCallback(() => {
    setShadows((prev) => [...prev, defaultShadow()]);
  }, []);

  function copy() {
    navigator.clipboard.writeText(fullCss).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToolPageHero tool={tool} />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Left: controls */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Shadow Layers</h2>
              <button
                onClick={add}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add layer
              </button>
            </div>

            {shadows.map((s, i) => (
              <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Layer {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={s.inset}
                        onChange={(e) => update(s.id, { inset: e.target.checked })}
                        className="accent-accent"
                      />
                      inset
                    </label>
                    {shadows.length > 1 && (
                      <button
                        onClick={() => remove(s.id)}
                        aria-label="Remove layer"
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <SliderRow label="X offset"  value={s.x}      min={-100} max={100} onChange={(v) => update(s.id, { x: v })} />
                <SliderRow label="Y offset"  value={s.y}      min={-100} max={100} onChange={(v) => update(s.id, { y: v })} />
                <SliderRow label="Blur"      value={s.blur}   min={0}    max={200} onChange={(v) => update(s.id, { blur: v })} />
                <SliderRow label="Spread"    value={s.spread} min={-100} max={100} onChange={(v) => update(s.id, { spread: v })} />
                <SliderRow label="Opacity"   value={s.opacity} min={0} max={1} step={0.01} unit="" onChange={(v) => update(s.id, { opacity: v })} />

                <div className="grid grid-cols-[90px_1fr] items-center gap-3">
                  <label className="text-xs text-muted-foreground">Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={s.color}
                      onChange={(e) => update(s.id, { color: e.target.value })}
                      className="w-9 h-8 rounded-md border border-border cursor-pointer bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={s.color}
                      onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && update(s.id, { color: e.target.value })}
                      className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-ring/40"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Preview background/box color pickers */}
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Preview colors
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-[60px_1fr] items-center gap-2">
                  <label className="text-xs text-muted-foreground">Background</label>
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-8 rounded-md border border-border cursor-pointer bg-transparent p-0.5" />
                </div>
                <div className="grid grid-cols-[40px_1fr] items-center gap-2">
                  <label className="text-xs text-muted-foreground">Box</label>
                  <input type="color" value={boxColor} onChange={(e) => setBoxColor(e.target.value)}
                    className="w-full h-8 rounded-md border border-border cursor-pointer bg-transparent p-0.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right: preview + output */}
          <div className="space-y-6">
            {/* Live preview */}
            <div
              className="rounded-xl border border-border flex items-center justify-center"
              style={{ background: bgColor, minHeight: 280 }}
            >
              <div
                className="w-40 h-40 rounded-2xl transition-all"
                style={{ background: boxColor, boxShadow: shadows.map(shadowToCss).join(", ") }}
              />
            </div>

            {/* CSS output */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <span className="text-xs font-medium text-muted-foreground">CSS Output</span>
                <button
                  onClick={copy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied!" : "Copy CSS"}
                </button>
              </div>
              <pre className="px-4 py-3 text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap break-all">
                {fullCss}
              </pre>
            </div>

            {/* Tailwind equiv hint */}
            <p className="text-xs text-muted-foreground px-1">
              To use in Tailwind: add <code className="font-mono bg-muted px-1 py-0.5 rounded">boxShadow</code> to your{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded">tailwind.config</code> or use the{" "}
              <code className="font-mono bg-muted px-1 py-0.5 rounded">[box-shadow:...]</code> arbitrary value syntax.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
