"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Eye, RotateCcw, Trash2, Upload } from "lucide-react";
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

const TOOL_SLUG = "image-filters";
/** Preview is capped so slider drags stay smooth; downloads render full-res. */
const PREVIEW_MAX_SIDE = 1000;

interface Filters {
  /** 0–100 % */
  grayscale: number;
  /** 0–100 % */
  sepia: number;
  /** 0–100 % */
  invert: number;
  /** 0–20 px */
  blur: number;
  /** 0–200 %, neutral 100 */
  brightness: number;
  /** 0–200 %, neutral 100 */
  contrast: number;
  /** 0–200 %, neutral 100 */
  saturate: number;
  /** 0 = off, else pixel block size in px */
  pixelate: number;
}

const NEUTRAL: Filters = {
  grayscale: 0,
  sepia: 0,
  invert: 0,
  blur: 0,
  brightness: 100,
  contrast: 100,
  saturate: 100,
  pixelate: 0,
};

/** True when any filter deviates from its neutral value. */
function isActive(f: Filters): boolean {
  return (
    f.grayscale > 0 ||
    f.sepia > 0 ||
    f.invert > 0 ||
    f.blur > 0 ||
    f.brightness !== 100 ||
    f.contrast !== 100 ||
    f.saturate !== 100 ||
    f.pixelate > 0
  );
}

/** Filters rendered through the Canvas `filter` property. */
function canvasFilterString(f: Filters): string {
  const parts: string[] = [];
  if (f.grayscale > 0) parts.push(`grayscale(${Math.round(f.grayscale)}%)`);
  if (f.sepia > 0) parts.push(`sepia(${Math.round(f.sepia)}%)`);
  if (f.invert > 0) parts.push(`invert(${Math.round(f.invert)}%)`);
  if (f.blur > 0) parts.push(`blur(${f.blur}px)`);
  if (f.brightness !== 100) parts.push(`brightness(${Math.round(f.brightness)}%)`);
  if (f.contrast !== 100) parts.push(`contrast(${Math.round(f.contrast)}%)`);
  if (f.saturate !== 100) parts.push(`saturate(${Math.round(f.saturate)}%)`);
  return parts.length ? parts.join(" ") : "none";
}

/**
 * Render `img` into `out` at w×h with the active filters.
 * ctx.filter handles grayscale/sepia/invert/blur/brightness/contrast/saturate;
 * pixelate is a manual downscale → nearest-neighbour upscale pass.
 */
function applyFilters(
  img: HTMLImageElement,
  w: number,
  h: number,
  f: Filters,
  out: HTMLCanvasElement,
  supportsCanvasFilter: boolean,
): void {
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.clearRect(0, 0, w, h);
  ctx.filter = supportsCanvasFilter ? canvasFilterString(f) : "none";
  ctx.drawImage(img, 0, 0, w, h);
  ctx.filter = "none";

  if (f.pixelate > 1) {
    const pw = Math.max(1, Math.round(w / f.pixelate));
    const ph = Math.max(1, Math.round(h / f.pixelate));
    const tmp = document.createElement("canvas");
    tmp.width = pw;
    tmp.height = ph;
    const tctx = tmp.getContext("2d");
    if (!tctx) throw new Error("Canvas 2D unavailable");
    tctx.drawImage(out, 0, 0, pw, ph);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(tmp, 0, 0, pw, ph, 0, 0, w, h);
    ctx.imageSmoothingEnabled = true;
  }
}

/** Draw original (unfiltered) pixels — used by hold-to-compare. */
function drawOriginal(
  img: HTMLImageElement,
  w: number,
  h: number,
  out: HTMLCanvasElement,
): void {
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");
  ctx.drawImage(img, 0, 0, w, h);
}

function canvasToBlob(canvas: HTMLCanvasElement, fmt: ImgFmt, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode the filtered image"))),
      fmt,
      fmt === "image/png" ? undefined : quality,
    );
  });
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

interface SliderDef {
  key: keyof Filters;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

const SLIDERS: SliderDef[] = [
  { key: "grayscale", label: "Grayscale", min: 0, max: 100, step: 5, unit: "%" },
  { key: "sepia", label: "Sepia", min: 0, max: 100, step: 5, unit: "%" },
  { key: "invert", label: "Invert", min: 0, max: 100, step: 5, unit: "%" },
  { key: "blur", label: "Blur", min: 0, max: 20, step: 1, unit: "px" },
  { key: "brightness", label: "Brightness", min: 0, max: 200, step: 5, unit: "%" },
  { key: "contrast", label: "Contrast", min: 0, max: 200, step: 5, unit: "%" },
  { key: "saturate", label: "Saturation", min: 0, max: 200, step: 5, unit: "%" },
  { key: "pixelate", label: "Pixelate", min: 0, max: 64, step: 1, unit: "px" },
];

export default function ImageFiltersTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [filters, setFilters] = useState<Filters>(NEUTRAL);
  const [comparing, setComparing] = useState(false);
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("image");

  const supportsCanvasFilter = useMemo(() => {
    if (typeof document === "undefined") return true;
    const probe = document.createElement("canvas");
    return typeof probe.getContext("2d")?.filter === "string";
  }, []);

  const skippedByBrowser =
    !supportsCanvasFilter &&
    (filters.grayscale > 0 ||
      filters.sepia > 0 ||
      filters.invert > 0 ||
      filters.blur > 0 ||
      filters.brightness !== 100 ||
      filters.contrast !== 100 ||
      filters.saturate !== 100);

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    };
  }, []);

  // Live preview — redraws on image, filter, format, or compare changes.
  useEffect(() => {
    const img = imgRef.current;
    const canvas = previewRef.current;
    if (!img || !canvas) return;
    try {
      const k = Math.min(1, PREVIEW_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const pw = Math.max(1, Math.round(img.naturalWidth * k));
      const ph = Math.max(1, Math.round(img.naturalHeight * k));
      if (comparing) {
        drawOriginal(img, pw, ph, canvas);
      } else {
        applyFilters(img, pw, ph, filters, canvas, supportsCanvasFilter);
      }
      if (format === "image/jpeg") {
        const ctx = canvas.getContext("2d");
        // JPEG output is composited onto white — mirror that in the preview.
        if (ctx && img.naturalWidth > 0) {
          ctx.globalCompositeOperation = "destination-over";
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "source-over";
        }
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("");
    } catch (e) {
      setError(friendlyError(e, "Couldn't render the preview."));
    }
  }, [srcUrl, filters, format, comparing, supportsCanvasFilter]);

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
      setNaturalH(h);
      setFilters(NEUTRAL);
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
    setNaturalH(0);
    setFilters(NEUTRAL);
    setComparing(false);
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
      applyFilters(img, img.naturalWidth, img.naturalHeight, filters, canvas, supportsCanvasFilter);
      if (format === "image/jpeg") {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.globalCompositeOperation = "destination-over";
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "source-over";
        }
      }
      const blob = await canvasToBlob(canvas, format, quality);
      const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
      downloadBlob(blob, `${lastName}-filtered.${ext}`, TOOL_SLUG);
    } catch (e) {
      setError(friendlyError(e, "Couldn't apply the filters."));
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
          <button
            type="button"
            onClick={() => setFilters(NEUTRAL)}
            disabled={!srcUrl || !isActive(filters)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm disabled:opacity-40"
          >
            <RotateCcw className="h-4 w-4" />
            Reset filters
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

        {skippedByBrowser && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
            This browser does not support the Canvas <code className="font-mono text-xs">filter</code> property,
            so grayscale, sepia, invert, blur, brightness, contrast and saturation are skipped in the
            preview and download. Pixelate still works — try a recent Chrome, Edge, Firefox, or Safari 16.4+.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Preview */}
          <div className="order-2 lg:order-1">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                {comparing ? (
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <Eye className="h-4 w-4" />
                    Showing original
                  </span>
                ) : (
                  "Filtered preview"
                )}
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
                  aria-label="Filtered image preview"
                  className="block h-auto max-w-full rounded-lg"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Upload an image to apply filters.
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!srcUrl}
                onPointerDown={() => setComparing(true)}
                onPointerUp={() => setComparing(false)}
                onPointerLeave={() => setComparing(false)}
                onPointerCancel={() => setComparing(false)}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    setComparing(true);
                  }
                }}
                onKeyUp={() => setComparing(false)}
                onBlur={() => setComparing(false)}
                aria-pressed={comparing}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted disabled:opacity-40"
              >
                <Eye className="h-4 w-4" />
                Hold to compare
              </button>
              <p className="text-xs text-muted-foreground">
                {naturalW > 0 ? `${naturalW}×${naturalH}px — preview capped at ${PREVIEW_MAX_SIDE}px, download is full resolution.` : ""}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="order-1 space-y-4 lg:order-2">
            <div className="space-y-3">
              {SLIDERS.map((s) => (
                <div key={s.key}>
                  <label htmlFor={`f-${s.key}`} className="mb-1 flex items-center justify-between text-sm font-medium">
                    <span>{s.label}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {filters[s.key]}
                      {s.unit}
                      {s.key === "brightness" || s.key === "contrast" || s.key === "saturate"
                        ? filters[s.key] === 100
                          ? " (neutral)"
                          : ""
                        : ""}
                    </span>
                  </label>
                  <input
                    id={`f-${s.key}`}
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={filters[s.key]}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [s.key]: parseFloat(e.target.value) }))
                    }
                    className="w-full"
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="f-format" className="mb-1 block text-sm font-medium">
                  Output format
                </label>
                <select
                  id="f-format"
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
                <label htmlFor="f-quality" className="mb-1 block text-sm font-medium">
                  Quality ({Math.round(quality * 100)}%)
                </label>
                <input
                  id="f-quality"
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
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Everything runs 100% in your browser — your image is never uploaded. Grayscale, sepia,
          invert, blur, brightness, contrast and saturation use the Canvas filter API; pixelate
          downscales and upscales with nearest-neighbour sampling. Press and hold{" "}
          <strong className="text-foreground">Hold to compare</strong> to flash the untouched
          original.
        </p>
      </div>
    </main>
  );
}
