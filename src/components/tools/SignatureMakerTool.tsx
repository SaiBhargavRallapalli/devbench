"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Download, Eraser, Undo2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import { HANDWRITING_FONTS } from "@/lib/handwriting";
import {
  MAX_EXPORT_UPSCALE,
  SIGNATURE_SIZES,
  mmToPx,
  resamplePoints,
  signatureExportScale,
  smoothPoints,
  strokesBBox,
  trimToContent,
  typedSignatureLayout,
  type BBox,
  type Point,
  type Stroke,
} from "@/lib/signature";

const CANVAS_W = 900;
const CANVAS_H = 300;
/** Extra px added around content when "Trim to content" is on. */
const TRIM_PAD = 8;
/** Grid pitch used while resampling strokes before smoothing. */
const RESAMPLE_STEP = 2;

const PEN_COLORS = [
  { id: "black", label: "Black", value: "#111111" },
  { id: "blue", label: "Blue", value: "#1d4ed8" },
];

const SIZE_OPTIONS = [
  { id: "custom", label: "Custom PNG (natural size)" },
  ...SIGNATURE_SIZES.map((s) => ({ id: s.id, label: `${s.label} @ 300 DPI` })),
];

/**
 * Transparent-checker preview: both stops are semi-transparent so the checker
 * stays visible (and black/blue ink stays legible) on light AND dark backgrounds.
 * The exported PNG never contains this — the canvas itself stays transparent.
 */
const CHECKERBOARD: CSSProperties = {
  backgroundImage:
    "conic-gradient(rgba(148,163,184,0.55) 0 25%, rgba(226,232,240,0.55) 0 50%, rgba(148,163,184,0.55) 0 75%, rgba(226,232,240,0.55) 0)",
  backgroundSize: "20px 20px",
};

function paintStrokes(ctx: CanvasRenderingContext2D, strokes: Stroke[]): void {
  for (const stroke of strokes) {
    if (stroke.points.length === 0) continue;
    // Resample to a uniform grid, then moving-average smooth — keeps fast,
    // jittery strokes clean without changing where they start/end.
    const pts = smoothPoints(resamplePoints(stroke.points, RESAMPLE_STEP));
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
  }
}

function typedFontSize(text: string, stack: string, sliderSize: number): number {
  const fit = typedSignatureLayout(text, stack, CANVAS_W - 80, CANVAS_H - 60);
  return Math.max(4, Math.min(sliderSize, fit.fontSize));
}

function typedBaselineY(ascent: number, descent: number): number {
  return CANVAS_H / 2 + (ascent - descent) / 2;
}

/** Content box of the typed signature, measured with real font metrics. */
function typedBox(text: string, stack: string, size: number): BBox {
  const off = document.createElement("canvas");
  const ctx = off.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.font = `${size}px ${stack}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  const m = ctx.measureText(text);
  const ascent = m.actualBoundingBoxAscent || size * 0.75;
  const descent = m.actualBoundingBoxDescent || size * 0.2;
  const baselineY = typedBaselineY(ascent, descent);
  return {
    x: CANVAS_W / 2 - m.width / 2,
    y: baselineY - ascent,
    w: m.width,
    h: ascent + descent,
  };
}

function cropCanvas(
  src: HTMLCanvasElement,
  crop: { sx: number; sy: number; sw: number; sh: number },
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = crop.sw;
  out.height = crop.sh;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(src, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, crop.sw, crop.sh);
  return out;
}

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG export failed"));
    }, "image/png");
  });
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export default function SignatureMakerTool({ tool }: { tool: Tool }) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [penWidth, setPenWidth] = useState(3);
  const [penColor, setPenColor] = useState(PEN_COLORS[0].value);
  const [typedText, setTypedText] = useState("");
  const [typedFontId, setTypedFontId] = useState(HANDWRITING_FONTS[0].id);
  const [typedSize, setTypedSize] = useState(64);
  const [trim, setTrim] = useState(true);
  const [sizeId, setSizeId] = useState("custom");
  const [error, setError] = useState("");
  const [emptyHint, setEmptyHint] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const liveRef = useRef<Stroke | null>(null);
  const drawingRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  const font = HANDWRITING_FONTS.find((f) => f.id === typedFontId) ?? HANDWRITING_FONTS[0];
  const penColorLabel =
    PEN_COLORS.find((c) => c.value === penColor)?.label ?? PEN_COLORS[0].label;
  const hasContent =
    mode === "draw" ? strokes.length > 0 : typedText.trim().length > 0;

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      if (mode === "draw") {
        const all = liveRef.current
          ? [...strokesRef.current, liveRef.current]
          : strokesRef.current;
        paintStrokes(ctx, all);
      } else if (typedText.trim()) {
        const size = typedFontSize(typedText.trim(), font.stack, typedSize);
        ctx.font = `${size}px ${font.stack}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = penColor;
        const m = ctx.measureText(typedText.trim());
        const ascent = m.actualBoundingBoxAscent || size * 0.75;
        const descent = m.actualBoundingBoxDescent || size * 0.2;
        ctx.fillText(typedText.trim(), CANVAS_W / 2, typedBaselineY(ascent, descent));
      }
    } catch (e) {
      setError(
        friendlyError(e, "Couldn't render the signature preview. Please try again."),
      );
      trackToolError(
        "signature-maker",
        "render",
        e instanceof Error ? e.message : String(e),
      );
    }
  }, [mode, typedText, font.stack, typedSize, penColor]);

  const scheduleDraw = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      render();
    });
  }, [render]);

  // Redraw whenever committed state / mode / settings change.
  useEffect(() => {
    scheduleDraw();
  }, [strokes, scheduleDraw]);

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const toPoint = (e: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    drawingRef.current = true;
    liveRef.current = {
      points: [toPoint(e)],
      width: penWidth,
      color: penColor,
    };
    scheduleDraw();
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw" || !drawingRef.current || !liveRef.current) return;
    const p = toPoint(e);
    const pts = liveRef.current.points;
    const last = pts[pts.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 0.5) return;
    pts.push(p);
    scheduleDraw();
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    const finished = liveRef.current;
    liveRef.current = null;
    if (finished && finished.points.length > 0) {
      strokesRef.current = [...strokesRef.current, finished];
      setStrokes([...strokesRef.current]);
    } else {
      scheduleDraw();
    }
  };

  const undo = () => {
    strokesRef.current = strokesRef.current.slice(0, -1);
    setStrokes([...strokesRef.current]);
  };

  const clear = () => {
    strokesRef.current = [];
    liveRef.current = null;
    drawingRef.current = false;
    setStrokes([]);
  };

  const handleExport = useCallback(async () => {
    const empty =
      mode === "draw"
        ? strokesRef.current.length === 0
        : typedText.trim().length === 0;
    if (empty) {
      setEmptyHint(
        mode === "draw"
          ? "Draw your signature first — the download unlocks as soon as there are strokes."
          : "Type your signature first — the download unlocks as soon as there's text.",
      );
      return;
    }
    setEmptyHint("");
    setError("");
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let source: HTMLCanvasElement = canvas;
      if (trim) {
        const bbox =
          mode === "draw"
            ? strokesBBox(strokesRef.current)
            : typedBox(
                typedText.trim(),
                font.stack,
                typedFontSize(typedText.trim(), font.stack, typedSize),
              );
        source = cropCanvas(canvas, trimToContent(CANVAS_W, CANVAS_H, bbox, TRIM_PAD));
      }

      const preset =
        sizeId === "custom"
          ? null
          : SIGNATURE_SIZES.find((s) => s.id === sizeId) ?? null;

      let out = source;
      if (preset) {
        const tw = mmToPx(preset.wMm, 300);
        const th = mmToPx(preset.hMm, 300);
        const scale = Math.min(
          signatureExportScale({ x: 0, y: 0, w: source.width, h: source.height }, tw),
          th / source.height,
          MAX_EXPORT_UPSCALE,
        );
        const target = document.createElement("canvas");
        target.width = tw;
        target.height = th;
        const tctx = target.getContext("2d");
        if (!tctx) throw new Error("Canvas 2D context unavailable");
        const dw = source.width * scale;
        const dh = source.height * scale;
        tctx.drawImage(source, (tw - dw) / 2, (th - dh) / 2, dw, dh);
        out = target;
      }

      const blob = await canvasToPng(out);
      const base =
        mode === "type" && slugify(typedText) ? slugify(typedText) : "handwritten";
      const filename = preset
        ? `${base}-signature-${preset.wMm}x${preset.hMm}mm.png`
        : `${base}-signature.png`;
      downloadBlob(blob, filename, "signature-maker");
      trackToolSuccess("signature-maker", "export_png", {
        mode,
        trim,
        size: sizeId,
        color: penColorLabel,
      });
    } catch (e) {
      setError(
        friendlyError(e, "Couldn't create the signature PNG. Please try again."),
      );
      trackToolError(
        "signature-maker",
        "export_png",
        e instanceof Error ? e.message : String(e),
      );
    }
  }, [mode, trim, sizeId, typedText, font.stack, typedSize, penColorLabel]);

  const labelCls = "block text-sm font-medium mb-1.5";
  const inputCls =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const toolBtn =
    "inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm hover:bg-muted/40 disabled:opacity-40";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── controls ── */}
        <section className="animate-slide-up space-y-5 rounded-2xl border border-border bg-card p-6">
          <fieldset>
            <legend className="text-sm font-medium mb-1.5">Signature mode</legend>
            <div role="radiogroup" aria-label="Signature mode" className="flex gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="sig-mode"
                  value="draw"
                  checked={mode === "draw"}
                  onChange={() => setMode("draw")}
                  className="accent-accent"
                />
                Draw
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                <input
                  type="radio"
                  name="sig-mode"
                  value="type"
                  checked={mode === "type"}
                  onChange={() => setMode("type")}
                  className="accent-accent"
                />
                Type
              </label>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Draw with mouse, trackpad, or finger — or pick Type for a fully
              keyboard-operable signature.
            </p>
          </fieldset>

          {mode === "draw" ? (
            <>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="sig-width" className="text-sm font-medium">
                    Pen width
                  </label>
                  <output htmlFor="sig-width" className="font-mono text-xs text-muted-foreground">
                    {penWidth}px
                  </output>
                </div>
                <input
                  id="sig-width"
                  type="range"
                  min={1}
                  max={8}
                  step={0.5}
                  value={penWidth}
                  onChange={(e) => setPenWidth(Number(e.target.value))}
                  className="w-full accent-accent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={undo}
                  disabled={strokes.length === 0}
                  aria-label="Undo last stroke"
                  className={toolBtn}
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </button>
                <button
                  type="button"
                  onClick={clear}
                  disabled={strokes.length === 0}
                  aria-label="Clear all"
                  className={toolBtn}
                >
                  <Eraser className="h-4 w-4" />
                  Clear
                </button>
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="sig-text" className={labelCls}>
                  Signature text
                </label>
                <input
                  id="sig-text"
                  type="text"
                  value={typedText}
                  maxLength={80}
                  onChange={(e) => setTypedText(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="sig-font" className={labelCls}>
                  Signature style
                </label>
                <select
                  id="sig-font"
                  value={typedFontId}
                  onChange={(e) => setTypedFontId(e.target.value)}
                  className={inputCls}
                >
                  {HANDWRITING_FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Uses fonts installed on your device; falls back to cursive.
                </p>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label htmlFor="sig-size" className="text-sm font-medium">
                    Text size
                  </label>
                  <output htmlFor="sig-size" className="font-mono text-xs text-muted-foreground">
                    {typedSize}px
                  </output>
                </div>
                <input
                  id="sig-size"
                  type="range"
                  min={16}
                  max={96}
                  step={1}
                  value={typedSize}
                  onChange={(e) => setTypedSize(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Automatically shrinks if the text would overflow the canvas.
                </p>
              </div>
            </>
          )}

          <fieldset>
            <legend className="text-sm font-medium mb-1.5">Signature color</legend>
            <div className="flex flex-wrap gap-3">
              {PEN_COLORS.map((c) => (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <input
                    type="radio"
                    name="sig-color"
                    value={c.id}
                    checked={penColor === c.value}
                    onChange={() => setPenColor(c.value)}
                    className="accent-accent"
                  />
                  <span
                    aria-hidden="true"
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: c.value }}
                  />
                  {c.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sig-size-preset" className={labelCls}>
                Export size
              </label>
              <select
                id="sig-size-preset"
                value={sizeId}
                onChange={(e) => setSizeId(e.target.value)}
                className={inputCls}
              >
                {SIZE_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={trim}
                  onChange={(e) => setTrim(e.target.checked)}
                  className="accent-accent"
                />
                Trim to content
              </label>
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Presets export at exactly 300&nbsp;DPI ({mmToPx(60, 300)}×{mmToPx(20, 300)}px for
            standard) with a transparent background — no white box around your signature.
          </p>

          <p className="text-xs text-muted-foreground">
            Runs entirely in your browser — nothing is uploaded or stored.
          </p>

          <button
            type="button"
            onClick={() => void handleExport()}
            aria-disabled={!hasContent}
            aria-describedby={!hasContent && emptyHint ? "sig-empty-hint" : undefined}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 ${
              hasContent ? "" : "opacity-50"
            }`}
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>

          {emptyHint && !hasContent && (
            <p id="sig-empty-hint" className="text-sm text-destructive" role="alert">
              {emptyHint}
            </p>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </section>

        {/* ── preview ── */}
        <section className="animate-slide-up space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Preview</h2>
            <span className="text-xs text-muted-foreground">
              {mode === "draw"
                ? `${strokes.length} stroke${strokes.length === 1 ? "" : "s"}`
                : "Typed signature"}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-border" style={CHECKERBOARD}>
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              tabIndex={0}
              aria-label={
                mode === "draw" ? "Signature drawing area" : "Typed signature preview"
              }
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              style={{ touchAction: "none" }}
              className="block w-full h-auto"
            />
          </div>

          <p className="text-xs text-muted-foreground">
            {mode === "draw"
              ? "Draw with your mouse, trackpad, or finger. Prefer the keyboard? Switch to the Type mode above."
              : "Type mode is fully keyboard-operable — tab into the fields and the preview updates live."}
          </p>
        </section>
      </div>
    </main>
  );
}
