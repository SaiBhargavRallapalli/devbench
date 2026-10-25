"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, Loader2, RefreshCw, Repeat, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import {
  IMAGE_WORKER_LIMITS_HELP,
  rejectInputImageDimensions,
  rejectOutputDimensions,
} from "@/lib/image-worker-limits";
import { friendlyError } from "@/lib/friendly-error";
import { downloadBlob } from "@/lib/pdf-download";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  ASPECT_PRESET_NAMES,
  applyAspect,
  clampCropRect,
  cropRectFromCanvasDrag,
  detectOrientationWarning,
  resolveAspect,
  type AspectPreset,
  type CropRect,
} from "@/lib/image-geometry";

type ImgFmt = "image/png" | "image/jpeg" | "image/webp";

const TOOL_SLUG = "image-crop";

const CHECKERBOARD =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%23f9fafb'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%23f9fafb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")";

function extForFmt(fmt: ImgFmt): "png" | "jpg" | "webp" {
  if (fmt === "image/jpeg") return "jpg";
  if (fmt === "image/webp") return "webp";
  return "png";
}

/** Round + clamp a rect into whole pixels that are valid for the image. */
function snapRect(rect: CropRect, imgW: number, imgH: number): CropRect {
  return clampCropRect(
    { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.w), h: Math.round(rect.h) },
    imgW,
    imgH,
  );
}

async function cropToBlob(
  img: HTMLImageElement,
  rect: CropRect,
  fmt: ImgFmt,
  quality: number,
  circle: boolean,
): Promise<Blob> {
  const w = Math.round(rect.w);
  const h = Math.round(rect.h);
  const dimErr = rejectOutputDimensions(w, h);
  if (dimErr) throw new Error(dimErr);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, w, h);

  if (circle) {
    // Circular alpha mask — only meaningful on PNG/WebP (we force PNG).
    const r = Math.min(w, h) / 2;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode cropped image"))),
      fmt,
      fmt === "image/png" ? undefined : quality,
    );
  });
}

type DragMode = "new" | "move" | "resize";

interface DragState {
  mode: DragMode;
  /** Pointer position (image px) where the drag started. */
  startX: number;
  startY: number;
  /** Crop rect when the drag started (for move/resize). */
  startRect: CropRect;
}

export default function ImageCropTool({ tool }: { tool: Tool }) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, w: 0, h: 0 });
  const [preset, setPreset] = useState<AspectPreset>("Free");
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [circle, setCircle] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("image");

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);
  useEffect(() => { previewUrlRef.current = previewUrl; }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const ratio = preset === "Free" ? null : resolveAspect(preset, naturalW, naturalH);
  const orientationWarning = naturalW > 0 ? detectOrientationWarning(naturalW, naturalH) : null;

  const clearPreview = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    clearPreview();

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
      setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
      setNaturalW(w);
      setNaturalH(h);
      setCrop({ x: 0, y: 0, w, h });
      setPreset("Free");
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

  const handleFiles = useCallback((files: FileList | null) => {
    if (files?.[0]) void onPickFile(files[0]);
  }, [onPickFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── numeric inputs (keyboard path) ──────────────────────────────────────────
  const applyRect = useCallback((next: CropRect) => {
    setCrop(snapRect(next, naturalW, naturalH));
  }, [naturalW, naturalH]);

  const updateX = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return;
    applyRect({ ...crop, x: n });
  };
  const updateY = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return;
    applyRect({ ...crop, y: n });
  };
  const updateW = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return;
    const h = ratio ? Math.max(1, Math.round(n / ratio)) : crop.h;
    applyRect({ ...crop, w: n, h });
  };
  const updateH = (v: string) => {
    const n = parseInt(v, 10);
    if (!Number.isFinite(n)) return;
    const w = ratio ? Math.max(1, Math.round(n * ratio)) : crop.w;
    applyRect({ ...crop, w, h: n });
  };

  const choosePreset = (p: AspectPreset) => {
    setPreset(p);
    const r = resolveAspect(p, naturalW, naturalH);
    if (r && naturalW > 0) setCrop(snapRect(applyAspect(r, crop, naturalW, naturalH), naturalW, naturalH));
  };

  const resetCrop = () => {
    setCrop({ x: 0, y: 0, w: naturalW, h: naturalH });
    setPreset("Free");
  };

  const swapWH = () => {
    applyRect({ x: crop.x, y: crop.y, w: crop.h, h: crop.w });
  };

  // ── pointer drag on the preview stage (progressive enhancement) ─────────────
  const toImagePoint = useCallback((e: React.PointerEvent): { x: number; y: number } | null => {
    const stage = stageRef.current;
    if (!stage || naturalW <= 0 || naturalH <= 0) return null;
    const bounds = stage.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) return null;
    const x = ((e.clientX - bounds.left) / bounds.width) * naturalW;
    const y = ((e.clientY - bounds.top) / bounds.height) * naturalH;
    return {
      x: Math.min(Math.max(x, 0), naturalW),
      y: Math.min(Math.max(y, 0), naturalH),
    };
  }, [naturalW, naturalH]);

  const beginDrag = useCallback((mode: DragMode, e: React.PointerEvent) => {
    const p = toImagePoint(e);
    if (!p) return;
    e.preventDefault();
    e.stopPropagation();
    // Capture on the stage so moves keep arriving even outside its bounds.
    try {
      stageRef.current?.setPointerCapture(e.pointerId);
    } catch { /* pointer capture is best-effort */ }
    dragRef.current = { mode, startX: p.x, startY: p.y, startRect: crop };
  }, [toImagePoint, crop]);

  // The rect/handle children stop propagation in their own handlers, so this
  // only fires for presses on the bare image → start a fresh selection.
  const onStagePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || !srcUrl) return;
    beginDrag("new", e);
  };

  const onStagePointerMove = useCallback((e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const p = toImagePoint(e);
    if (!p) return;
    if (drag.mode === "new") {
      setCrop(
        snapRect(
          cropRectFromCanvasDrag(
            { x: drag.startX, y: drag.startY },
            p,
            naturalW,
            naturalH,
            ratio,
          ),
          naturalW,
          naturalH,
        ),
      );
    } else if (drag.mode === "move") {
      setCrop(
        snapRect(
          {
            x: drag.startRect.x + (p.x - drag.startX),
            y: drag.startRect.y + (p.y - drag.startY),
            w: drag.startRect.w,
            h: drag.startRect.h,
          },
          naturalW,
          naturalH,
        ),
      );
    } else {
      // Resize from the bottom-right corner: anchor is the rect's top-left.
      setCrop(
        snapRect(
          cropRectFromCanvasDrag(
            { x: drag.startRect.x, y: drag.startRect.y },
            p,
            naturalW,
            naturalH,
            ratio,
          ),
          naturalW,
          naturalH,
        ),
      );
    }
  }, [toImagePoint, naturalW, naturalH, ratio]);

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    try {
      stageRef.current?.releasePointerCapture(e.pointerId);
    } catch { /* pointer capture is best-effort */ }
  }, []);

  // ── preview generation (150ms debounce) ─────────────────────────────────────
  const renderPreview = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !srcUrl) return;
    if (crop.w < 1 || crop.h < 1) return;
    const dimErr = rejectOutputDimensions(Math.round(crop.w), Math.round(crop.h));
    if (dimErr) {
      setError(dimErr);
      trackToolError(TOOL_SLUG, "crop", dimErr);
      return;
    }

    setPreviewing(true);
    try {
      const blob = await cropToBlob(img, crop, format, quality, circle);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setError("");
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't crop this image."));
      trackToolError(TOOL_SLUG, "crop", raw);
    } finally {
      setPreviewing(false);
    }
  }, [srcUrl, crop, format, quality, circle]);

  useEffect(() => {
    if (!srcUrl) return;
    const t = setTimeout(() => { void renderPreview(); }, 150);
    return () => clearTimeout(t);
  }, [srcUrl, renderPreview]);

  const download = async () => {
    const img = imgRef.current;
    if (!img || !srcUrl) return;
    const w = Math.round(crop.w);
    const h = Math.round(crop.h);
    if (w < 1 || h < 1) {
      const msg = "Crop area must be at least 1 × 1 pixel.";
      setError(msg);
      trackToolError(TOOL_SLUG, "crop", "zero-size crop");
      return;
    }
    const dimErr = rejectOutputDimensions(w, h);
    if (dimErr) {
      setError(dimErr);
      trackToolError(TOOL_SLUG, "crop", dimErr);
      return;
    }
    setError("");
    try {
      const blob = await cropToBlob(img, crop, format, quality, circle);
      const ext = extForFmt(format);
      downloadBlob(blob, `${lastName}-cropped.${ext}`, TOOL_SLUG);
      trackToolSuccess(TOOL_SLUG, "crop", { format: ext, circle });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't crop this image."));
      trackToolError(TOOL_SLUG, "crop", raw);
    }
  };

  const clear = () => {
    imgRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    clearPreview();
    setNaturalW(0);
    setNaturalH(0);
    setCrop({ x: 0, y: 0, w: 0, h: 0 });
    setPreset("Free");
    setCircle(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const effFormat: ImgFmt = circle ? "image/png" : format;
  const outputW = Math.round(crop.w);
  const outputH = Math.round(crop.h);

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground leading-relaxed">{IMAGE_WORKER_LIMITS_HELP}</p>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          tabIndex={0}
          role="button"
          aria-label="Upload image to crop"
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Upload className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold">Drop an image here, or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP — drag to select an area, or type exact pixels</p>
          </div>
        </div>

        {naturalW > 0 && (
          <p className="text-xs text-muted-foreground">
            Original {naturalW}×{naturalH}px
            {orientationWarning ? ` — ${orientationWarning}` : " — JPEG quality applies to JPEG/WebP only."}
          </p>
        )}

        {naturalW > 0 && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="mb-1.5 block text-sm font-medium" id={`${inputId}-aspect`}>Aspect ratio</span>
                <div role="radiogroup" aria-labelledby={`${inputId}-aspect`} className="flex flex-wrap gap-1.5">
                  {ASPECT_PRESET_NAMES.map((name) => (
                    <button
                      key={name}
                      type="button"
                      role="radio"
                      aria-checked={preset === name}
                      onClick={() => choosePreset(name)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        preset === name
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Reset crop to full image"
                  onClick={resetCrop}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reset
                </button>
                <button
                  type="button"
                  aria-label="Swap width and height"
                  onClick={swapWH}
                  className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
                >
                  <Repeat className="h-4 w-4" />
                  Swap W/H
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label htmlFor={`${inputId}-x`} className="mb-1 block text-sm font-medium">X (px)</label>
                <input
                  id={`${inputId}-x`}
                  type="number"
                  min={0}
                  max={naturalW}
                  value={crop.x}
                  onChange={(e) => updateX(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${inputId}-y`} className="mb-1 block text-sm font-medium">Y (px)</label>
                <input
                  id={`${inputId}-y`}
                  type="number"
                  min={0}
                  max={naturalH}
                  value={crop.y}
                  onChange={(e) => updateY(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${inputId}-w`} className="mb-1 block text-sm font-medium">Width (px)</label>
                <input
                  id={`${inputId}-w`}
                  type="number"
                  min={1}
                  max={naturalW}
                  value={outputW}
                  onChange={(e) => updateW(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${inputId}-h`} className="mb-1 block text-sm font-medium">Height (px)</label>
                <input
                  id={`${inputId}-h`}
                  type="number"
                  min={1}
                  max={naturalH}
                  value={outputH}
                  onChange={(e) => updateH(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground" aria-live="polite">
              Output: <span className="font-semibold text-foreground">{outputW} × {outputH} px</span>
              {ratio ? ` — locked to ${preset}` : " — free crop"}
            </p>
          </>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* ── interactive crop stage ── */}
          <div>
            <p className="mb-2 text-sm font-medium">Source — drag to select, drag the corner to resize</p>
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4">
              {srcUrl ? (
                <div
                  ref={stageRef}
                  className="relative touch-none select-none overflow-hidden rounded-lg"
                  style={{ touchAction: "none" }}
                  onPointerDown={onStagePointerDown}
                  onPointerMove={onStagePointerMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={srcUrl}
                    alt="Original being cropped"
                    draggable={false}
                    className="block max-h-[420px] max-w-full rounded-lg"
                  />
                  {naturalW > 0 && (
                    <div
                      data-crop-rect=""
                      onPointerDown={(e) => beginDrag("move", e)}
                      className="absolute cursor-move border-2 border-accent"
                      style={{
                        left: `${(crop.x / naturalW) * 100}%`,
                        top: `${(crop.y / naturalH) * 100}%`,
                        width: `${(crop.w / naturalW) * 100}%`,
                        height: `${(crop.h / naturalH) * 100}%`,
                        boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                      }}
                    >
                      {/* thirds guide */}
                      <div className="pointer-events-none absolute inset-0 opacity-60">
                        <div className="absolute left-1/3 top-0 h-full w-px bg-white/50" />
                        <div className="absolute left-2/3 top-0 h-full w-px bg-white/50" />
                        <div className="absolute left-0 top-1/3 h-px w-full bg-white/50" />
                        <div className="absolute left-0 top-2/3 h-px w-full bg-white/50" />
                      </div>
                      <div
                        data-crop-handle=""
                        aria-hidden="true"
                        onPointerDown={(e) => beginDrag("resize", e)}
                        className="absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-accent bg-background shadow"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No image yet — upload PNG, JPEG, or WebP.
                </span>
              )}
            </div>
            {srcUrl && (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear image"
                className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>

          {/* ── output ── */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Cropped preview</p>
              <button
                type="button"
                onClick={() => { void download(); }}
                disabled={!srcUrl || previewing}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
            <div
              aria-busy={previewing}
              className="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4"
            >
              {previewing ? (
                <Loader2 className="h-6 w-6 animate-spin text-accent" aria-label="Generating preview" />
              ) : previewUrl ? (
                <div
                  className="flex items-center justify-center rounded-lg p-2"
                  style={{ backgroundImage: CHECKERBOARD, backgroundSize: "16px 16px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Cropped preview"
                    className="max-h-[420px] max-w-full rounded object-contain"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Preview updates as you adjust the crop.
                </span>
              )}
            </div>
            {previewUrl && (
              <p className="mt-2 text-xs text-muted-foreground">
                {naturalW}×{naturalH}px → {outputW}×{outputH}px · {effFormat === "image/png" ? "PNG" : effFormat === "image/jpeg" ? "JPEG" : "WebP"}
                {circle ? " · circular mask" : ""}
              </p>
            )}
          </div>
        </div>

        {/* ── export options ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <div>
            <label htmlFor={`${inputId}-format`} className="mb-1 block text-sm font-medium">Output format</label>
            <select
              id={`${inputId}-format`}
              value={effFormat}
              disabled={circle}
              onChange={(e) => setFormat(e.target.value as ImgFmt)}
              className={inputClass}
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
            {circle && (
              <p className="mt-1 text-xs text-muted-foreground">PNG required for circular transparency.</p>
            )}
          </div>
          {effFormat !== "image/png" && (
            <div>
              <label htmlFor={`${inputId}-quality`} className="mb-1 block text-sm font-medium">
                Quality ({Math.round(quality * 100)}%)
              </label>
              <input
                id={`${inputId}-quality`}
                type="range"
                min={0.5}
                max={1}
                step={0.02}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={circle}
              onChange={(e) => {
                const on = e.target.checked;
                setCircle(on);
                if (on) setFormat("image/png");
              }}
              className="rounded"
            />
            Circle crop (round avatar-style mask)
          </label>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Everything runs in your browser — your image is never uploaded. Drag on the image to draw a
          selection, drag inside it to move, or use the corner handle and the pixel inputs above.
        </p>
      </div>
    </main>
  );
}
