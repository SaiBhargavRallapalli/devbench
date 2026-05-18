"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { copyToClipboard } from "@/lib/clipboard";
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl, rgbToHsv } from "@/lib/color-math";
import ToolPageHero from "@/components/tools/ToolPageHero";

interface ColorState {
  hex: string;
  r: number;
  g: number;
  b: number;
  h: number;
  sl: number;
  l: number;
  hv: number;
  sv: number;
  v: number;
}

function fromRgb(r: number, g: number, b: number): ColorState {
  const hex = rgbToHex(r, g, b);
  const [h, sl, l] = rgbToHsl(r, g, b);
  const [hv, sv, v] = rgbToHsv(r, g, b);
  return { hex, r, g, b, h, sl, l, hv, sv, v };
}

const INITIAL_COLOR_STATE = fromRgb(99, 102, 241);

function CopyIconButton({
  text,
  id,
  copiedId,
  onResult,
}: {
  text: string;
  id: string;
  copiedId: string | null;
  onResult: (id: string | null, error: string | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        void copyToClipboard(text)
          .then(() => onResult(id, null))
          .catch(() => onResult(null, "Could not copy."));
      }}
      title="Copy"
      aria-label="Copy to clipboard"
      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {copiedId === id ? (
        <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden />
      )}
    </button>
  );
}

export default function ColorConverterTool({ tool }: { tool: Tool }) {
  const formId = useId();
  const pickerId = `${formId}-picker`;
  const hexFieldId = `${formId}-hex`;

  const [color, setColor] = useState<ColorState>(INITIAL_COLOR_STATE);
  const [hexInput, setHexInput] = useState(INITIAL_COLOR_STATE.hex);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clipboardError, setClipboardError] = useState<string | null>(null);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const onCopyResult = useCallback((id: string | null, error: string | null) => {
    if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    if (error) {
      setCopiedId(null);
      setClipboardError(error);
      return;
    }
    setClipboardError(null);
    setCopiedId(id);
    copiedTimerRef.current = setTimeout(() => {
      copiedTimerRef.current = null;
      setCopiedId(null);
    }, 2000);
  }, []);

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

  const { hex, r, g, b, h, sl, l, hv, sv, v } = color;
  const rgbStr = `rgb(${r}, ${g}, ${b})`;
  const hslStr = `hsl(${h}, ${sl}%, ${l}%)`;
  const hsvStr = `hsv(${hv}, ${sv}%, ${v}%)`;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">

        {clipboardError && (
          <p className="text-sm text-destructive" role="alert">
            {clipboardError}
          </p>
        )}

        {/* Picker + HEX input */}
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor={pickerId} className="mb-2 block text-sm font-medium">
              Color picker
            </label>
            <input
              id={pickerId}
              type="color"
              value={hex.length === 7 ? hex : "#6366f1"}
              onChange={(e) => updateFromHex(e.target.value)}
              className="h-16 w-16 cursor-pointer rounded-xl border border-border bg-background p-1"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label htmlFor={hexFieldId} className="mb-2 block text-sm font-medium">
              HEX
            </label>
            <div className="flex items-center gap-1 rounded-xl border border-border bg-background px-3 py-2">
              <input
                id={hexFieldId}
                value={hexInput}
                onChange={(e) => updateFromHex(e.target.value)}
                className="flex-1 bg-transparent font-mono text-sm focus:outline-none"
                placeholder="#6366f1"
                spellCheck={false}
              />
              <CopyIconButton text={hex} id="hex" copiedId={copiedId} onResult={onCopyResult} />
            </div>
          </div>
        </div>

        {/* Live swatch */}
        <div
          className="h-20 w-full rounded-xl border border-border shadow-inner transition-colors duration-150"
          style={{ background: hex }}
          role="img"
          aria-label={`Current color swatch ${hex}`}
        />

        {/* Format grid */}
        <div className="grid gap-6 sm:grid-cols-2">

          {/* RGB */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">RGB</span>
              <CopyIconButton text={rgbStr} id="rgb" copiedId={copiedId} onResult={onCopyResult} />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["R", "G", "B"] as const).map((ch, i) => {
                const val = [r, g, b][i];
                return (
                  <div key={ch}>
                    <label htmlFor={`${formId}-rgb-${ch}`} className="mb-1 block text-center text-xs text-muted-foreground">
                      {ch}
                    </label>
                    <input
                      id={`${formId}-rgb-${ch}`}
                      type="number"
                      min={0}
                      max={255}
                      value={val}
                      onChange={(e) => {
                        const nextVal = Math.max(0, Math.min(255, parseInt(e.target.value, 10) || 0));
                        const next: [number, number, number] = [r, g, b];
                        next[i] = nextVal;
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
              <span className="text-sm font-medium">HSL</span>
              <CopyIconButton text={hslStr} id="hsl" copiedId={copiedId} onResult={onCopyResult} />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["H°", "S%", "L%"] as const).map((ch, i) => {
                const vals = [h, sl, l];
                const maxes = [360, 100, 100];
                return (
                  <div key={ch}>
                    <label htmlFor={`${formId}-hsl-${i}`} className="mb-1 block text-center text-xs text-muted-foreground">
                      {ch}
                    </label>
                    <input
                      id={`${formId}-hsl-${i}`}
                      type="number"
                      min={0}
                      max={maxes[i]}
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
              <span className="text-sm font-medium">HSV</span>
              <CopyIconButton text={hsvStr} id="hsv" copiedId={copiedId} onResult={onCopyResult} />
            </div>
            <div className="mb-1 grid grid-cols-3 gap-2">
              {(["H°", "S%", "V%"] as const).map((ch, i) => (
                <div key={ch}>
                  <label htmlFor={`${formId}-hsv-${i}`} className="mb-1 block text-center text-xs text-muted-foreground">
                    {ch}
                  </label>
                  <input
                    id={`${formId}-hsv-${i}`}
                    type="number"
                    readOnly
                    tabIndex={-1}
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
            <span className="mb-2 block text-sm font-medium">CSS custom property</span>
            <div className="flex items-start gap-1 rounded-xl border border-border bg-muted/30 px-3 py-2">
              <code className="flex-1 break-all font-mono text-xs text-muted-foreground">
                {`--color: ${hex};`}
              </code>
              <CopyIconButton text={`--color: ${hex};`} id="css" copiedId={copiedId} onResult={onCopyResult} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
