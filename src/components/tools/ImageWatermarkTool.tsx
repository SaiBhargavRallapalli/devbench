"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError } from "@/lib/analytics-events";
import {
  IMAGE_WORKER_LIMITS_HELP,
  rejectInputImageDimensions,
  rejectOutputDimensions,
} from "@/lib/image-worker-limits";
import { friendlyError } from "@/lib/friendly-error";
import { downloadBlob } from "@/lib/pdf-download";
import ToolPageHero from "@/components/tools/ToolPageHero";

type ImgFmt = "image/png" | "image/jpeg" | "image/webp";
type Layout = "tile" | "single";
type Position =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

const TOOL_SLUG = "image-watermark";
/** Preview is capped so slider drags stay smooth; downloads render full-res. */
const PREVIEW_MAX_SIDE = 1000;

const POSITIONS: { id: Position; label: string; glyph: string }[] = [
  { id: "top-left", label: "Top left", glyph: "↖" },
  { id: "top-center", label: "Top center", glyph: "↑" },
  { id: "top-right", label: "Top right", glyph: "↗" },
  { id: "middle-left", label: "Middle left", glyph: "←" },
  { id: "center", label: "Center", glyph: "●" },
  { id: "middle-right", label: "Middle right", glyph: "→" },
  { id: "bottom-left", label: "Bottom left", glyph: "↙" },
  { id: "bottom-center", label: "Bottom center", glyph: "↓" },
  { id: "bottom-right", label: "Bottom right", glyph: "↘" },
];

interface WmSettings {
  text: string;
  fontSize: number; // px at full resolution
  color: string; // #rrggbb
  alpha: number; // color alpha 0..1
  opacity: number; // overall opacity 0..1
  rotation: number; // degrees
  layout: Layout;
  position: Position;
  outline: boolean;
}

const DEFAULT_SETTINGS: WmSettings = {
  text: "© Your name",
  fontSize: 48,
  color: "#ffffff",
  alpha: 1,
  opacity: 0.6,
  rotation: -30,
  layout: "tile",
  position: "center",
  outline: true,
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  const n = m ? parseInt(m[1], 16) : 0xffffff;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/** Perceptual luminance 0..1 — decides a legible outline colour. */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/**
 * Stamp the watermark onto the current canvas context.
 * `k` scales font size from full-res pixels to the canvas being drawn
 * (preview canvases are smaller, so preview and download match visually).
 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  s: WmSettings,
  k: number,
): void {
  const text = s.text.trim();
  if (!text) return;

  const fontPx = Math.max(6, Math.round(s.fontSize * k));
  ctx.save();
  ctx.font = `600 ${fontPx}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.globalAlpha = Math.min(1, Math.max(0, s.opacity));
  ctx.fillStyle = `rgba(${Object.values(hexToRgb(s.color)).join(", ")}, ${s.alpha})`;
  if (s.outline) {
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(1, fontPx / 14);
    ctx.strokeStyle = luminance(s.color) > 0.5 ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.85)";
    ctx.shadowColor = "rgba(0,0,0,0.45)";
    ctx.shadowBlur = fontPx * 0.18;
    ctx.shadowOffsetY = fontPx * 0.06;
  }

  const textWidth = ctx.measureText(text).width;
  const angle = (s.rotation * Math.PI) / 180;

  if (s.layout === "single") {
    const margin = Math.round(fontPx * 0.75);
    let cx = w / 2;
    let cy = h / 2;
    if (s.position.includes("top")) cy = margin + fontPx / 2;
    else if (s.position.includes("bottom")) cy = h - margin - fontPx / 2;
    if (s.position.includes("left")) cx = margin + textWidth / 2;
    else if (s.position.includes("right")) cx = w - margin - textWidth / 2;
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    if (s.outline) ctx.strokeText(text, 0, 0);
    ctx.fillText(text, 0, 0);
  } else {
    // Diagonal tiling on a rotated plane, brick-offset rows, oversized reach
    // so corners stay covered at any angle.
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    const stepX = textWidth * 1.8 + fontPx * 1.5;
    const stepY = fontPx * 4;
    const reach = Math.ceil(Math.hypot(w, h) / 2) + Math.max(stepX, stepY);
    let row = 0;
    for (let y = -reach; y <= reach; y += stepY, row++) {
      const offset = row % 2 === 1 ? stepX / 2 : 0;
      for (let x = -reach; x <= reach; x += stepX) {
        if (s.outline) ctx.strokeText(text, x + offset, y);
        ctx.fillText(text, x + offset, y);
      }
    }
  }
  ctx.restore();
}

function renderToCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  s: WmSettings,
  format: ImgFmt,
  maxWidth: number | null,
): void {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  const k = maxWidth ? Math.min(1, maxWidth / Math.max(nw, nh)) : 1;
  canvas.width = Math.max(1, Math.round(nw * k));
  canvas.height = Math.max(1, Math.round(nh * k));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  // JPEG has no alpha — show the white backdrop it will composite onto.
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  drawWatermark(ctx, canvas.width, canvas.height, s, canvas.width / nw);
}

function canvasToBlob(canvas: HTMLCanvasElement, fmt: ImgFmt, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the watermarked image"))),
      fmt,
      fmt === "image/png" ? undefined : quality,
    );
  });
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

export default function ImageWatermarkTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [settings, setSettings] = useState<WmSettings>(DEFAULT_SETTINGS);
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("image");

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    };
  }, []);

  const set = <K extends keyof WmSettings>(key: K, value: WmSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const fontMax = Math.max(72, Math.min(600, Math.round(naturalW * 0.3) || 240));

  // Live preview — redraws on any setting or image change.
  useEffect(() => {
    const img = imgRef.current;
    const canvas = previewRef.current;
    if (!img || !canvas) return;
    try {
      renderToCanvas(canvas, img, settings, format, PREVIEW_MAX_SIDE);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
    } catch (e) {
      setError(friendlyError(e, "Couldn't render the watermark preview."));
    }
  }, [srcUrl, settings, format]);

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    if (!file || !file.type.startsWith("image/")) {
      setError("Choose an image file (PNG, JPEG, or WebP).");
      return;
    }
    const newUrl = URL.createObjectURL(file);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode"));
        img.src = newUrl;
      });
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const dimErr = rejectInputImageDimensions(w, h);
      if (dimErr) {
        URL.revokeObjectURL(newUrl);
        setError(dimErr);
        trackToolError(TOOL_SLUG, "upload", dimErr);
        return;
      }
      imgRef.current = img;
      setNaturalW(w);
      // Sensible default stamp size: ~6% of the image width.
      setSettings((prev) => ({
        ...prev,
        fontSize: Math.min(Math.max(24, Math.round(w * 0.06)), 240),
      }));
      setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
      setSrcUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return newUrl;
      });
    } catch {
      URL.revokeObjectURL(newUrl);
      setError("Could not read this image.");
      trackToolError(TOOL_SLUG, "upload", "decode failed");
    }
  }, []);

  const clear = () => {
    imgRef.current = null;
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setNaturalW(0);
    setSettings(DEFAULT_SETTINGS);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const download = async () => {
    const img = imgRef.current;
    if (!img) return;
    const dimErr = rejectOutputDimensions(img.naturalWidth, img.naturalHeight);
    if (dimErr) {
      setError(dimErr);
      trackToolError(TOOL_SLUG, "download", dimErr);
      return;
    }
    setError("");
    try {
      const canvas = document.createElement("canvas");
      renderToCanvas(canvas, img, settings, format, null);
      const blob = await canvasToBlob(canvas, format, quality);
      const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
      downloadBlob(blob, `${lastName}-watermarked.${ext}`, TOOL_SLUG);
    } catch (e) {
      setError(friendlyError(e, "Couldn't watermark this image."));
      trackToolError(TOOL_SLUG, "download", e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground leading-relaxed">{IMAGE_WORKER_LIMITS_HELP}</p>

        <div className="flex flex-wrap gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground"
          >
            <Upload className="h-4 w-4" />
            Choose image
          </button>
          {srcUrl && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label htmlFor="wm-text" className="mb-2 block text-sm font-medium">
                Watermark text
              </label>
              <input
                id="wm-text"
                type="text"
                value={settings.text}
                onChange={(e) => set("text", e.target.value)}
                className={inputClass}
                placeholder="© Your name"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wm-size" className="mb-1 block text-sm font-medium">
                  Font size ({settings.fontSize}px at full res)
                </label>
                <input
                  id="wm-size"
                  type="range"
                  min={12}
                  max={fontMax}
                  step={1}
                  value={Math.min(settings.fontSize, fontMax)}
                  onChange={(e) => set("fontSize", parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="wm-rotate" className="mb-1 block text-sm font-medium">
                  Rotation ({settings.rotation}°)
                </label>
                <input
                  id="wm-rotate"
                  type="range"
                  min={-90}
                  max={90}
                  step={1}
                  value={settings.rotation}
                  onChange={(e) => set("rotation", parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="wm-color" className="mb-1 block text-sm font-medium">
                  Colour
                </label>
                <input
                  id="wm-color"
                  type="color"
                  value={settings.color}
                  onChange={(e) => set("color", e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-xl border border-border bg-background"
                />
              </div>
              <div>
                <label htmlFor="wm-alpha" className="mb-1 block text-sm font-medium">
                  Colour alpha ({Math.round(settings.alpha * 100)}%)
                </label>
                <input
                  id="wm-alpha"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={settings.alpha}
                  onChange={(e) => set("alpha", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="wm-opacity" className="mb-1 block text-sm font-medium">
                  Opacity ({Math.round(settings.opacity * 100)}%)
                </label>
                <input
                  id="wm-opacity"
                  type="range"
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={settings.opacity}
                  onChange={(e) => set("opacity", parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium">Layout</span>
              <div className="flex gap-2">
                {(["tile", "single"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => set("layout", mode)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                      settings.layout === mode
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {mode === "tile" ? "Tile (diagonal)" : "Single"}
                  </button>
                ))}
              </div>
            </div>

            {settings.layout === "single" && (
              <div>
                <span className="mb-2 block text-sm font-medium">Position</span>
                <div className="grid w-40 grid-cols-3 gap-1">
                  {POSITIONS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      title={p.label}
                      aria-label={p.label}
                      aria-pressed={settings.position === p.id}
                      onClick={() => set("position", p.id)}
                      className={`flex h-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        settings.position === p.id
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {p.glyph}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={settings.outline}
                onChange={(e) => set("outline", e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Outline &amp; shadow for legibility
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="wm-format" className="mb-1 block text-sm font-medium">
                  Output format
                </label>
                <select
                  id="wm-format"
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImgFmt)}
                  className={inputClass}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
              <div>
                <label htmlFor="wm-quality" className="mb-1 block text-sm font-medium">
                  Quality ({Math.round(quality * 100)}%)
                </label>
                <input
                  id="wm-quality"
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.02}
                  value={quality}
                  disabled={format === "image/png"}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                  className="w-full disabled:opacity-40"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                {error}
              </p>
            )}
          </div>

          {/* Preview */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Preview {naturalW > 0 && <span className="text-muted-foreground">({naturalW}px wide, shown at up to {PREVIEW_MAX_SIDE}px)</span>}
              </p>
              <button
                type="button"
                onClick={() => void download()}
                disabled={!srcUrl}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 p-4">
              {srcUrl ? (
                <canvas
                  ref={previewRef}
                  aria-label="Watermarked image preview"
                  className="block h-auto max-w-full rounded-lg"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Upload an image to see the watermark preview.
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Downloads render at full resolution — only the preview is capped for speed.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Everything runs 100% in your browser — your image is never uploaded. PNG keeps
          transparency (JPEG is composited onto white). Pick Tile for a diagonal repeat across the
          whole picture, or Single with a position preset for one stamp in a corner or edge.
        </p>
      </div>
    </main>
  );
}
