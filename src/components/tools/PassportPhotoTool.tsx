"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import { rejectInputImageDimensions, rejectOutputDimensions } from "@/lib/image-worker-limits";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import ToolPageHero from "@/components/tools/ToolPageHero";
import {
  A4_SHEET_200DPI,
  DPI_PRESETS,
  PASSPORT_PRESETS,
  fitToFrame,
  sheetLayout,
  toPixels,
  type FitMode,
} from "@/lib/physical-units";

type ImgFmt = "image/png" | "image/jpeg";

const SHEET_GAP_MM = 4;

const BG_PRESETS: { label: string; value: string }[] = [
  { label: "White", value: "#ffffff" },
  { label: "Red", value: "#dc2626" },
  { label: "Blue", value: "#2563eb" },
  { label: "Green", value: "#16a34a" },
];

function clampDpi(n: number): number {
  if (!Number.isFinite(n)) return 300;
  return Math.min(1200, Math.max(10, Math.round(n)));
}

export default function PassportPhotoTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [imgVersion, setImgVersion] = useState(0);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [presetId, setPresetId] = useState("us");
  const [customW, setCustomW] = useState("35");
  const [customH, setCustomH] = useState("45");
  const [dpiSel, setDpiSel] = useState("300");
  const [bg, setBg] = useState("#ffffff");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [makeSheet, setMakeSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("photo");

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    };
  }, []);

  const dpi = clampDpi(parseInt(dpiSel, 10));
  const preset = PASSPORT_PRESETS.find((p) => p.id === presetId);
  const wMmRaw = presetId === "custom" ? parseFloat(customW) : (preset?.wMm ?? 35);
  const hMmRaw = presetId === "custom" ? parseFloat(customH) : (preset?.hMm ?? 45);
  const dimsOk = Number.isFinite(wMmRaw) && Number.isFinite(hMmRaw) && wMmRaw > 0 && hMmRaw > 0;
  const frameW = dimsOk ? toPixels(wMmRaw, "mm", dpi) : 0;
  const frameH = dimsOk ? toPixels(hMmRaw, "mm", dpi) : 0;
  const frameErr = dimsOk
    ? rejectOutputDimensions(frameW, frameH)
    : "Enter a positive photo width and height.";

  // A4 print-sheet math (fixed 200 DPI canvas, 4mm gaps, white surround).
  const sheetPhotoW = dimsOk ? toPixels(wMmRaw, "mm", 200) : 0;
  const sheetPhotoH = dimsOk ? toPixels(hMmRaw, "mm", 200) : 0;
  const sheetGap = toPixels(SHEET_GAP_MM, "mm", 200);
  const copies = useMemo(() => {
    if (!dimsOk) return 0;
    return sheetLayout(999, A4_SHEET_200DPI.w, A4_SHEET_200DPI.h, sheetPhotoW, sheetPhotoH, sheetGap).length;
  }, [dimsOk, sheetPhotoW, sheetPhotoH, sheetGap]);

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    if (!file || !file.type.startsWith("image/")) {
      setError("Choose an image file (PNG, JPEG, or WebP).");
      return;
    }
    const newUrl = URL.createObjectURL(file);
    setBusy(true);
    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("decode"));
        img.src = newUrl;
      });
      const dimErr = rejectInputImageDimensions(img.naturalWidth, img.naturalHeight);
      if (dimErr) {
        URL.revokeObjectURL(newUrl);
        setError(dimErr);
        trackToolError("passport-photo", "upload", dimErr);
        return;
      }
      imgRef.current = img;
      setLastName(file.name.replace(/\.[^.]+$/, "") || "photo");
      setNaturalW(img.naturalWidth);
      setNaturalH(img.naturalHeight);
      setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return newUrl; });
      setImgVersion((v) => v + 1);
    } catch {
      URL.revokeObjectURL(newUrl);
      setError("Could not read this image.");
      trackToolError("passport-photo", "upload", "decode failed");
    } finally {
      setBusy(false);
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

  const drawFrame = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, includeGuide: boolean) => {
      const img = imgRef.current;
      if (!img) return;
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);
      const fit = fitToFrame(img.naturalWidth, img.naturalHeight, w, h, fitMode);
      ctx.drawImage(img, fit.offsetX, fit.offsetY, fit.width, fit.height);
      if (includeGuide) {
        // Subtle frame guide for the preview only — never exported.
        ctx.save();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = Math.max(1, Math.round(w / 400));
        ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
        ctx.restore();
      }
    },
    [bg, fitMode]
  );

  // Live preview.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgRef.current || frameW < 1 || frameH < 1) return;
    canvas.width = frameW;
    canvas.height = frameH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    try {
      drawFrame(ctx, frameW, frameH, true);
    } catch (e) {
      // Defer so the effect body itself stays free of synchronous setState.
      queueMicrotask(() => setError(friendlyError(e, "Couldn't render the preview.")));
    }
  }, [imgVersion, frameW, frameH, drawFrame]);

  const renderToBlob = useCallback(
    (w: number, h: number): Promise<Blob> => {
      const img = imgRef.current;
      if (!img) throw new Error("No image loaded.");
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      if (format === "image/jpeg") {
        // JPEG has no alpha — guarantee a white base under the background color.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
      }
      drawFrame(ctx, w, h, false);
      return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
          format,
          format === "image/png" ? 1 : 0.92
        );
      });
    },
    [format, drawFrame]
  );

  const ext = format === "image/png" ? "png" : "jpg";

  const downloadPhoto = useCallback(async () => {
    if (!imgRef.current || frameErr || frameW < 1 || frameH < 1) return;
    setBusy(true);
    try {
      const blob = await renderToBlob(frameW, frameH);
      downloadBlob(blob, `${lastName}-passport-${wMmRaw}x${hMmRaw}mm.${ext}`, "passport-photo");
      trackToolSuccess("passport-photo", "export-photo", { format: ext, fit: fitMode });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't build the passport photo."));
      trackToolError("passport-photo", "export-photo", raw);
    } finally {
      setBusy(false);
    }
  }, [frameErr, frameW, frameH, renderToBlob, lastName, wMmRaw, hMmRaw, ext, fitMode]);

  const downloadSheet = useCallback(async () => {
    if (!imgRef.current || frameErr || sheetPhotoW < 1 || sheetPhotoH < 1) return;
    setBusy(true);
    try {
      const positions = sheetLayout(
        999, A4_SHEET_200DPI.w, A4_SHEET_200DPI.h, sheetPhotoW, sheetPhotoH, sheetGap
      );
      if (positions.length < 1) {
        throw new Error("Photo does not fit on the sheet.");
      }
      const canvas = document.createElement("canvas");
      canvas.width = A4_SHEET_200DPI.w;
      canvas.height = A4_SHEET_200DPI.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of positions) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        ctx.rect(0, 0, sheetPhotoW, sheetPhotoH);
        ctx.clip();
        drawFrame(ctx, sheetPhotoW, sheetPhotoH, false);
        ctx.restore();
      }
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 1);
      });
      downloadBlob(blob, `${lastName}-print-sheet.png`, "passport-photo");
      trackToolSuccess("passport-photo", "export-sheet", { copies: positions.length });
    } catch (e) {
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't build the print sheet."));
      trackToolError("passport-photo", "export-sheet", raw);
    } finally {
      setBusy(false);
    }
  }, [frameErr, sheetPhotoW, sheetPhotoH, sheetGap, drawFrame, lastName]);

  const clear = () => {
    imgRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setNaturalW(0);
    setNaturalH(0);
    setError("");
    setImgVersion((v) => v + 1);
    if (fileRef.current) fileRef.current.value = "";
  };

  const applyPreset = (id: string) => {
    setPresetId(id);
    const p = PASSPORT_PRESETS.find((x) => x.id === id);
    if (p?.bg) setBg(p.bg);
  };

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
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
          aria-label="Upload photo for passport sizing"
          className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragOver ? "border-accent bg-accent/5" : "border-border hover:border-accent/50 hover:bg-muted/30"
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
            <Upload className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold">Drop a photo here, or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">JPG, PNG, WebP — resized to the exact official frame size</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label htmlFor="passport-preset" className="mb-1 block text-sm font-medium">Country / size preset</label>
            <select
              id="passport-preset"
              value={presetId}
              onChange={(e) => applyPreset(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {PASSPORT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          {presetId === "custom" && (
            <>
              <div>
                <label htmlFor="passport-custom-w" className="mb-1 block text-sm font-medium">Width (mm)</label>
                <input
                  id="passport-custom-w"
                  type="number"
                  min={1}
                  step="any"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
              <div>
                <label htmlFor="passport-custom-h" className="mb-1 block text-sm font-medium">Height (mm)</label>
                <input
                  id="passport-custom-h"
                  type="number"
                  min={1}
                  step="any"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
              </div>
            </>
          )}
          <div>
            <label htmlFor="passport-dpi" className="mb-1 block text-sm font-medium">Print DPI</label>
            <select
              id="passport-dpi"
              value={dpiSel}
              onChange={(e) => setDpiSel(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              {DPI_PRESETS.map((d) => (
                <option key={d} value={String(d)}>{d} DPI</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">DPI matters for print only.</p>
          </div>
          <div>
            <label htmlFor="passport-format" className="mb-1 block text-sm font-medium">Output format</label>
            <select
              id="passport-format"
              value={format}
              onChange={(e) => setFormat(e.target.value as ImgFmt)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            >
              <option value="image/png">PNG</option>
              <option value="image/jpeg">JPEG</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">JPEG keeps a solid background.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:items-end">
          <div>
            <span className="mb-1 block text-sm font-medium" id="passport-bg-label">Background color</span>
            <div role="group" aria-labelledby="passport-bg-label" className="flex flex-wrap items-center gap-1.5">
              {BG_PRESETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  aria-pressed={bg.toLowerCase() === b.value}
                  onClick={() => setBg(b.value)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                    bg.toLowerCase() === b.value
                      ? "border-accent bg-accent/15 text-accent"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: b.value }}
                  />
                  {b.label}
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
                Custom
                <input
                  type="color"
                  aria-label="Custom background color"
                  value={bg}
                  onChange={(e) => setBg(e.target.value)}
                  className="h-6 w-8 cursor-pointer rounded border border-border bg-background p-0"
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Background fills the frame behind your photo — for a cut-out subject use our Background Remover tool first.
            </p>
          </div>
          <div>
            <span className="mb-1 block text-sm font-medium" id="passport-fit-label">Fit mode</span>
            <div role="group" aria-labelledby="passport-fit-label" className="flex flex-wrap gap-1.5">
              <button
                type="button"
                aria-pressed={fitMode === "contain"}
                onClick={() => setFitMode("contain")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  fitMode === "contain" ? "border-accent bg-accent/15 text-accent" : "border-border hover:bg-muted"
                }`}
              >
                Fit (whole photo visible)
              </button>
              <button
                type="button"
                aria-pressed={fitMode === "cover"}
                onClick={() => setFitMode("cover")}
                className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  fitMode === "cover" ? "border-accent bg-accent/15 text-accent" : "border-border hover:bg-muted"
                }`}
              >
                Fill (crop to frame)
              </button>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={makeSheet}
              onChange={(e) => setMakeSheet(e.target.checked)}
              className="rounded"
            />
            Print sheet (A4 @200 DPI)
          </label>
        </div>

        <p className="rounded-xl border border-border bg-muted/20 p-3 text-sm font-medium">
          {wMmRaw && hMmRaw && dimsOk
            ? `${wMmRaw}×${hMmRaw}mm @ ${dpi} DPI = ${frameW}×${frameH}px`
            : "Enter a valid photo size."}
          {makeSheet && copies > 0 && ` — A4 sheet fits ${copies} photo${copies === 1 ? "" : "s"} with ${SHEET_GAP_MM}mm gaps`}
        </p>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {frameErr && (
          <p className="text-sm text-destructive" role="alert">
            {frameErr}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Framed preview {naturalW > 0 && `(${naturalW}×${naturalH}px source)`}</p>
              <div className="flex items-center gap-2">
                {srcUrl && (
                  <button
                    type="button"
                    onClick={clear}
                    aria-label="Clear photo"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  disabled={!srcUrl || !!frameErr || busy}
                  onClick={() => void downloadPhoto()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download photo
                </button>
              </div>
            </div>
            <div
              aria-busy={busy}
              className="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-muted/30 p-4"
            >
              {srcUrl && !frameErr ? (
                <canvas
                  ref={canvasRef}
                  className="max-h-[420px] max-w-full rounded-xl border border-border object-contain"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  Upload a photo and pick a preset to see the framed preview.
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Print sheet</p>
              <button
                type="button"
                disabled={!srcUrl || !makeSheet || !!frameErr || busy}
                onClick={() => void downloadSheet()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent/25 disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download sheet
              </button>
            </div>
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
              {makeSheet && copies > 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  A4 sheet at 200 DPI ({A4_SHEET_200DPI.w}×{A4_SHEET_200DPI.h}px) fits{" "}
                  <span className="font-semibold text-foreground">{copies}</span> photo
                  {copies === 1 ? "" : "s"} at {wMmRaw}×{hMmRaw}mm with {SHEET_GAP_MM}mm gaps and a white surround.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enable “Print sheet” to pack multiple copies onto an A4 page.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
