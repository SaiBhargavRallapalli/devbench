"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Download, FlipHorizontal, FlipVertical, Loader2, RotateCcw, RotateCw, Trash2, Upload } from "lucide-react";
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
import { detectOrientationWarning, normalizeAngle, rotatedBounds } from "@/lib/image-geometry";

type ImgFmt = "image/png" | "image/jpeg" | "image/webp";
type Fill = "transparent" | "white" | "black";

const TOOL_SLUG = "image-rotate";

const CHECKERBOARD =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Crect width='8' height='8' fill='%23e5e7eb'/%3E%3Crect x='0' y='8' width='8' height='8' fill='%23f9fafb'/%3E%3Crect x='8' y='0' width='8' height='8' fill='%23f9fafb'/%3E%3Crect x='8' y='8' width='8' height='8' fill='%23e5e7eb'/%3E%3C/svg%3E\")";

function extForFmt(fmt: ImgFmt): "png" | "jpg" | "webp" {
  if (fmt === "image/jpeg") return "jpg";
  if (fmt === "image/webp") return "webp";
  return "png";
}

function fillStyle(fill: Fill): string | null {
  if (fill === "white") return "#ffffff";
  if (fill === "black") return "#000000";
  return null; // transparent
}

async function rotateToBlob(
  img: HTMLImageElement,
  angleDeg: number,
  flipH: boolean,
  flipV: boolean,
  fill: Fill,
  fmt: ImgFmt,
  quality: number,
): Promise<Blob> {
  const bounds = rotatedBounds(img.naturalWidth, img.naturalHeight, angleDeg);
  const dimErr = rejectOutputDimensions(bounds.w, bounds.h);
  if (dimErr) throw new Error(dimErr);

  const canvas = document.createElement("canvas");
  canvas.width = bounds.w;
  canvas.height = bounds.h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unavailable");

  // JPEG cannot store transparency — always give it an opaque backdrop.
  const fillPaint = fmt === "image/jpeg" && fill === "transparent" ? "#ffffff" : fillStyle(fill);
  if (fillPaint) {
    ctx.fillStyle = fillPaint;
    ctx.fillRect(0, 0, bounds.w, bounds.h);
  }

  ctx.save();
  ctx.translate(bounds.w / 2, bounds.h / 2);
  // Scale before rotate in call order = flip in OUTPUT space, so toggling a
  // flip always mirrors exactly what the preview shows (WYSIWYG).
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.rotate((normalizeAngle(angleDeg) * Math.PI) / 180);
  ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  ctx.restore();

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode rotated image"))),
      fmt,
      fmt === "image/png" ? undefined : quality,
    );
  });
}

export default function ImageRotateTool({ tool }: { tool: Tool }) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [fill, setFill] = useState<Fill>("transparent");
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
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

  const outBounds = naturalW > 0 ? rotatedBounds(naturalW, naturalH, angle) : { w: 0, h: 0 };
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
      setAngle(0);
      setFlipH(false);
      setFlipV(false);
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

  const updateAngle = (deg: number) => {
    if (!Number.isFinite(deg)) return;
    // Slider/number input stay within the -180..180 window.
    const clamped = Math.min(180, Math.max(-180, deg));
    setAngle(Math.round(clamped));
  };

  const rotateBy = (delta: number) => {
    // Quarter turns wrap instead of clamping, so the buttons never dead-end
    // at ±180 (270° ≡ -90°).
    const n = normalizeAngle(angle + delta); // 0..360
    setAngle(Math.round(n > 180 ? n - 360 : n));
  };

  // ── preview generation (150ms debounce) ─────────────────────────────────────
  const renderPreview = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !srcUrl) return;
    const dimErr = rejectOutputDimensions(outBounds.w, outBounds.h);
    if (dimErr) {
      setError(dimErr);
      trackToolError(TOOL_SLUG, "rotate", dimErr);
      return;
    }

    setPreviewing(true);
    try {
      const blob = await rotateToBlob(img, angle, flipH, flipV, fill, format, quality);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setError("");
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't rotate this image."));
      trackToolError(TOOL_SLUG, "rotate", raw);
    } finally {
      setPreviewing(false);
    }
  }, [srcUrl, angle, flipH, flipV, fill, format, quality, outBounds.w, outBounds.h]);

  useEffect(() => {
    if (!srcUrl) return;
    const t = setTimeout(() => { void renderPreview(); }, 150);
    return () => clearTimeout(t);
  }, [srcUrl, renderPreview]);

  const download = async () => {
    const img = imgRef.current;
    if (!img || !srcUrl) return;
    const dimErr = rejectOutputDimensions(outBounds.w, outBounds.h);
    if (dimErr) {
      setError(dimErr);
      trackToolError(TOOL_SLUG, "rotate", dimErr);
      return;
    }
    setError("");
    try {
      const blob = await rotateToBlob(img, angle, flipH, flipV, fill, format, quality);
      const ext = extForFmt(format);
      downloadBlob(blob, `${lastName}-rotated.${ext}`, TOOL_SLUG);
      trackToolSuccess(TOOL_SLUG, "rotate", { format: ext, angle: normalizeAngle(angle) });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't rotate this image."));
      trackToolError(TOOL_SLUG, "rotate", raw);
    }
  };

  const clear = () => {
    imgRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    clearPreview();
    setNaturalW(0);
    setNaturalH(0);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";
  const toggleClass = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
      on ? "border-accent bg-accent/15 text-accent" : "border-border hover:bg-muted"
    }`;

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
          aria-label="Upload image to rotate or flip"
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
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP — rotate by 90° or any angle, flip vertically</p>
          </div>
        </div>

        {naturalW > 0 && (
          <p className="text-xs text-muted-foreground">
            Original {naturalW}×{naturalH}px → output {outBounds.w}×{outBounds.h}px
            {orientationWarning ? ` — ${orientationWarning}` : ""}
          </p>
        )}

        {naturalW > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                aria-label="Rotate left"
                title="Rotate left 90°"
                onClick={() => rotateBy(-90)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Rotate right"
                title="Rotate right 90°"
                onClick={() => rotateBy(90)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border hover:bg-muted"
              >
                <RotateCw className="h-5 w-5" />
              </button>
              <span className="text-sm text-muted-foreground">90° steps</span>
              <span className="mx-2 hidden h-6 w-px bg-border sm:block" />
              <button
                type="button"
                aria-pressed={flipH}
                onClick={() => setFlipH((v) => !v)}
                className={toggleClass(flipH)}
              >
                <FlipHorizontal className="h-4 w-4" />
                Flip Horizontal
              </button>
              <button
                type="button"
                aria-pressed={flipV}
                onClick={() => setFlipV((v) => !v)}
                className={toggleClass(flipV)}
              >
                <FlipVertical className="h-4 w-4" />
                Flip Vertical
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <div className="lg:col-span-2">
                <label htmlFor={`${inputId}-angle`} className="mb-1 block text-sm font-medium">
                  Angle (degrees)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={angle}
                    aria-label="Angle (degrees) slider"
                    onChange={(e) => updateAngle(parseInt(e.target.value, 10))}
                    className="w-full"
                  />
                  <input
                    id={`${inputId}-angle`}
                    type="number"
                    min={-180}
                    max={180}
                    step={1}
                    value={angle}
                    onChange={(e) => updateAngle(parseInt(e.target.value, 10))}
                    className="w-24 shrink-0 rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${inputId}-fill`} className="mb-1 block text-sm font-medium">Background fill</label>
                <select
                  id={`${inputId}-fill`}
                  value={fill}
                  onChange={(e) => setFill(e.target.value as Fill)}
                  className={inputClass}
                >
                  <option value="transparent">Transparent</option>
                  <option value="white">White</option>
                  <option value="black">Black</option>
                </select>
              </div>
              <div>
                <label htmlFor={`${inputId}-format`} className="mb-1 block text-sm font-medium">Output format</label>
                <select
                  id={`${inputId}-format`}
                  value={format}
                  onChange={(e) => setFormat(e.target.value as ImgFmt)}
                  className={inputClass}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
              <p className="text-xs text-muted-foreground lg:col-span-2">
                Background fill applies to non-90° angles where the corners would otherwise be empty.
                PNG and WebP keep transparency; JPEG has no transparency, so transparent areas are
                filled white.
              </p>
              <div className="lg:col-span-2">
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
                  disabled={format === "image/png"}
                  className="w-full disabled:opacity-40"
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Source</p>
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4">
              {srcUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcUrl} alt="Original" className="max-h-80 max-w-full rounded-lg object-contain" />
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

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Rotated preview</p>
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
              className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4"
            >
              {previewing ? (
                <Loader2 className="h-6 w-6 animate-spin text-accent" aria-label="Generating preview" />
              ) : previewUrl ? (
                <div
                  className="flex items-center justify-center rounded-lg p-2"
                  style={
                    fill === "transparent" && format !== "image/jpeg"
                      ? { backgroundImage: CHECKERBOARD, backgroundSize: "16px 16px" }
                      : { background: fill === "white" ? "#ffffff" : fill === "black" ? "#000000" : undefined }
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Rotated preview" className="max-h-80 max-w-full object-contain" />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Preview updates as you change the angle or flip.
                </span>
              )}
            </div>
            {previewUrl && (
              <p className="mt-2 text-xs text-muted-foreground">
                {naturalW}×{naturalH}px → {outBounds.w}×{outBounds.h}px · {normalizeAngle(angle)}° ·{" "}
                {(flipH || flipV) ? "flipped" : "unflipped"} · {format === "image/png" ? "PNG" : format === "image/jpeg" ? "JPEG" : "WebP"}
              </p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Everything runs in your browser — your image is never uploaded. Use the 90° buttons for
          quarter turns, or the angle slider and input for fine rotation.
        </p>
      </div>
    </main>
  );
}
