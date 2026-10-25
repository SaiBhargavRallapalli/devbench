"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import {
  IMAGE_WORKER_LIMITS_HELP,
  rejectInputImageDimensions,
  rejectOutputDimensions,
} from "@/lib/image-worker-limits";
import { getImageWorkerUrl, type ImageWorkerResult } from "@/lib/image-worker";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  DPI_PRESETS,
  equivalentDims,
  fromPixels,
  toPixels,
  type PhysicalUnit,
} from "@/lib/physical-units";

type ImgFmt = "image/png" | "image/jpeg" | "image/webp";

const UNITS: { id: PhysicalUnit; label: string; short: string }[] = [
  { id: "px", label: "Pixels (px)", short: "px" },
  { id: "cm", label: "Centimeters (cm)", short: "cm" },
  { id: "mm", label: "Millimeters (mm)", short: "mm" },
  { id: "in", label: "Inches (in)", short: "in" },
];

function clampDpi(n: number): number {
  if (!Number.isFinite(n)) return 96;
  return Math.min(1200, Math.max(10, Math.round(n)));
}

/** Format a value in the current unit for round-tripping through the input. */
function fmtVal(n: number, unit: PhysicalUnit): string {
  if (!Number.isFinite(n)) return "";
  if (unit === "px") return String(Math.max(1, Math.round(n)));
  return String(Math.max(0.01, Math.round(n * 100) / 100));
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageResizeUnitsTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bufRef = useRef<ArrayBuffer | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [unit, setUnit] = useState<PhysicalUnit>("px");
  const [widthIn, setWidthIn] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [dpiSel, setDpiSel] = useState("96");
  const [customDpi, setCustomDpi] = useState("300");
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("image");

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);
  useEffect(() => { previewUrlRef.current = previewUrl; }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      workerRef.current?.terminate();
    };
  }, []);

  const dpi = dpiSel === "custom" ? clampDpi(parseInt(customDpi, 10)) : parseInt(dpiSel, 10);
  const ratio = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1;

  const wNum = parseFloat(widthIn);
  const hNum = parseFloat(heightIn);
  const hasDims = Number.isFinite(wNum) && Number.isFinite(hNum) && wNum > 0 && hNum > 0;
  const outW = hasDims ? toPixels(wNum, unit, dpi) : 0;
  const outH = hasDims ? toPixels(hNum, unit, dpi) : 0;
  const outErr = hasDims ? rejectOutputDimensions(outW, outH) : "Enter positive width and height.";

  const cross = useMemo(
    () => (outW > 0 && outH > 0 ? equivalentDims(outW, outH, dpi) : null),
    [outW, outH, dpi]
  );

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreviewBlob(null);

    if (!file || !file.type.startsWith("image/")) {
      setError("Choose an image file (PNG, JPEG, or WebP).");
      return;
    }

    const newUrl = URL.createObjectURL(file);
    try {
      bufRef.current = await file.arrayBuffer();
      const dims = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
        img.onerror = () => reject(new Error("decode"));
        img.src = newUrl;
      });
      const dimErr = rejectInputImageDimensions(dims.w, dims.h);
      if (dimErr) {
        URL.revokeObjectURL(newUrl);
        bufRef.current = null;
        setError(dimErr);
        trackToolError("image-resize-units", "upload", dimErr);
        return;
      }
      setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
      setNaturalW(dims.w);
      setNaturalH(dims.h);
      setLockAspect(true);
      // Seed the fields with the original size expressed in the current unit.
      setWidthIn(fmtVal(fromPixels(dims.w, unit, dpi), unit));
      setHeightIn(fmtVal(fromPixels(dims.h, unit, dpi), unit));
      setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return newUrl; });
    } catch {
      URL.revokeObjectURL(newUrl);
      bufRef.current = null;
      setError("Could not read this image.");
      trackToolError("image-resize-units", "upload", "decode failed");
    }
  }, [unit, dpi]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (files?.[0]) void onPickFile(files[0]);
  }, [onPickFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const updateWidth = (wStr: string) => {
    setWidthIn(wStr);
    if (!lockAspect || ratio <= 0) return;
    const w = parseFloat(wStr);
    if (!Number.isFinite(w) || w <= 0) return;
    setHeightIn(fmtVal(w / ratio, unit));
  };

  const updateHeight = (hStr: string) => {
    setHeightIn(hStr);
    if (!lockAspect || ratio <= 0) return;
    const h = parseFloat(hStr);
    if (!Number.isFinite(h) || h <= 0) return;
    setWidthIn(fmtVal(h * ratio, unit));
  };

  // Switching units keeps the physical size (via current DPI), not the number.
  const changeUnit = (u: PhysicalUnit) => {
    if (u !== unit && hasDims) {
      setWidthIn(fmtVal(fromPixels(toPixels(wNum, unit, dpi), u, dpi), u));
      setHeightIn(fmtVal(fromPixels(toPixels(hNum, unit, dpi), u, dpi), u));
    }
    setUnit(u);
  };

  const runResize = useCallback(() => {
    if (!bufRef.current) return;
    const w = parseFloat(widthIn);
    const h = parseFloat(heightIn);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      setError("Enter positive width and height.");
      return;
    }
    const outW2 = toPixels(w, unit, dpi);
    const outH2 = toPixels(h, unit, dpi);
    const err = rejectOutputDimensions(outW2, outH2);
    if (err) {
      setError(err);
      trackToolError("image-resize-units", "resize", err);
      return;
    }

    workerRef.current?.terminate();
    setError("");
    const copy = bufRef.current.slice(0);
    const worker = new Worker(getImageWorkerUrl());
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<ImageWorkerResult>) => {
      if (workerRef.current === worker) workerRef.current = null;
      worker.terminate();
      if (!e.data.ok) {
        const msg = e.data?.error
          ? friendlyError(new Error(e.data.error), "Couldn't process this image.")
          : "Couldn't process this image.";
        setError(msg);
        trackToolError("image-resize-units", "resize", e.data?.error);
        return;
      }
      const blob = new Blob([e.data.buffer], { type: format });
      setPreviewBlob(blob);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      trackToolSuccess("image-resize-units", "resize", {
        format: format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp",
      });
    };

    worker.onerror = () => {
      if (workerRef.current === worker) workerRef.current = null;
      worker.terminate();
      setError("Could not encode image.");
      trackToolError("image-resize-units", "resize", "worker encode error");
    };

    worker.postMessage(
      {
        type: "resize",
        buffer: copy,
        format,
        quality: format === "image/png" ? 1 : quality,
        width: outW2,
        height: outH2,
      },
      [copy]
    );
  }, [widthIn, heightIn, unit, dpi, format, quality]);

  useEffect(() => {
    if (!srcUrl || !widthIn || !heightIn) return;
    const t = setTimeout(runResize, 200);
    return () => clearTimeout(t);
  }, [srcUrl, widthIn, heightIn, unit, dpi, format, quality, runResize]);

  const download = () => {
    if (!previewBlob) return;
    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    downloadBlob(previewBlob, `${lastName}-resized.${ext}`, "image-resize-units");
  };

  const clear = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    bufRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreviewBlob(null);
    setNaturalW(0);
    setNaturalH(0);
    setWidthIn("");
    setHeightIn("");
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground leading-relaxed">{IMAGE_WORKER_LIMITS_HELP}</p>

        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
          tabIndex={0}
          role="button"
          aria-label="Upload image to resize"
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Upload className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold">Drop an image here, or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP — resize in px, cm, mm or inches</p>
          </div>
        </div>

        {naturalW > 0 && (
          <p className="text-xs text-muted-foreground">
            Original {naturalW}×{naturalH}px — JPEG quality applies to JPEG/WebP only.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <span className="mb-1 block text-sm font-medium" id="resize-unit-label">Unit</span>
            <div role="radiogroup" aria-labelledby="resize-unit-label" className="flex flex-wrap gap-1.5">
              {UNITS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  role="radio"
                  aria-checked={unit === u.id}
                  onClick={() => changeUnit(u.id)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    unit === u.id
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="resize-width" className="mb-1 block text-sm font-medium">Width ({unit})</label>
            <input
              id="resize-width"
              type="number"
              min={0.01}
              step="any"
              value={widthIn}
              onChange={(e) => updateWidth(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {hasDims && (
              <p className="mt-1 text-xs text-muted-foreground">≈ {outW} px</p>
            )}
          </div>
          <div>
            <label htmlFor="resize-height" className="mb-1 block text-sm font-medium">Height ({unit})</label>
            <input
              id="resize-height"
              type="number"
              min={0.01}
              step="any"
              value={heightIn}
              onChange={(e) => updateHeight(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
            {hasDims && (
              <p className="mt-1 text-xs text-muted-foreground">≈ {outH} px</p>
            )}
          </div>
          <div>
            <label htmlFor="resize-dpi" className="mb-1 block text-sm font-medium">DPI</label>
            <select
              id="resize-dpi"
              value={dpiSel}
              onChange={(e) => setDpiSel(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {DPI_PRESETS.map((d) => (
                <option key={d} value={String(d)}>{d} DPI</option>
              ))}
              <option value="custom">Custom…</option>
            </select>
            {dpiSel === "custom" && (
              <input
                type="number"
                min={10}
                max={1200}
                aria-label="Custom DPI (10–1200)"
                value={customDpi}
                onChange={(e) => setCustomDpi(e.target.value)}
                className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
              />
            )}
            <p className="mt-1 text-xs text-muted-foreground">Screen 96 DPI, print 300 DPI. DPI matters for print only.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <div>
            <label htmlFor="resize-format" className="mb-1 block text-sm font-medium">Output format</label>
            <select
              id="resize-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as ImgFmt)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div>
            <label htmlFor="resize-quality" className="mb-1 block text-sm font-medium">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              id="resize-quality"
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
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={lockAspect}
              onChange={(e) => setLockAspect(e.target.checked)}
              className="rounded"
            />
            Lock aspect ratio (uses original proportions)
          </label>
        </div>

        {cross && (
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="mb-2 text-sm font-medium">Target size in every unit (@ {dpi} DPI)</p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
              <div className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">px</dt>
                <dd className="font-medium">{outW} × {outH}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">cm</dt>
                <dd className="font-medium">{cross.cm.w.toFixed(2)} × {cross.cm.h.toFixed(2)}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">mm</dt>
                <dd className="font-medium">{cross.mm.w.toFixed(1)} × {cross.mm.h.toFixed(1)}</dd>
              </div>
              <div className="flex items-baseline gap-2">
                <dt className="text-muted-foreground">in</dt>
                <dd className="font-medium">{cross.in.w.toFixed(2)} × {cross.in.h.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">
              Output {outW}×{outH}px
              {previewBlob ? ` — ${fmtBytes(previewBlob.size)} (${format === "image/png" ? "PNG" : format === "image/jpeg" ? "JPEG" : "WebP"})` : " — estimated"}
            </p>
          </div>
        )}

        {srcUrl && outErr && (
          <p className="text-sm text-destructive" role="alert">
            {outErr}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Source</p>
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4">
              {srcUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcUrl} alt="Original" className="max-h-80 max-w-full object-contain" />
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
              <p className="text-sm font-medium">Resized preview</p>
              <button
                type="button"
                disabled={!previewUrl}
                onClick={download}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Resized preview" className="max-h-80 max-w-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Preview appears after you set dimensions.
                </span>
              )}
            </div>
            {previewBlob && hasDims && !outErr && (
              <p className="mt-2 text-xs text-muted-foreground">
                {naturalW}×{naturalH}px → {outW}×{outH}px — {fmtBytes(previewBlob.size)}
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
