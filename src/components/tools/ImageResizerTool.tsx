"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";
import { IMAGE_WORKER_LIMITS_HELP, rejectInputImageDimensions, rejectOutputDimensions } from "@/lib/image-worker-limits";
import { getImageWorkerUrl, type ImageWorkerResult } from "@/lib/image-worker";
import ToolPageHero from "@/components/tools/ToolPageHero";

type ImgFmt = "image/png" | "image/jpeg" | "image/webp";

export default function ImageResizerTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bufRef = useRef<ArrayBuffer | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [naturalW, setNaturalW] = useState(0);
  const [naturalH, setNaturalH] = useState(0);
  const [widthIn, setWidthIn] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<ImgFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });

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
        return;
      }
      setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
      setNaturalW(dims.w);
      setNaturalH(dims.h);
      setWidthIn(String(dims.w));
      setHeightIn(String(dims.h));
      setSrcUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return newUrl;
      });
    } catch {
      URL.revokeObjectURL(newUrl);
      bufRef.current = null;
      setError("Could not read this image.");
    }
  }, []);

  const ratio = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1;

  const updateWidth = (wStr: string) => {
    setWidthIn(wStr);
    if (!lockAspect || !naturalW) return;
    const w = parseInt(wStr, 10);
    if (!Number.isFinite(w) || w <= 0) return;
    setHeightIn(String(Math.max(1, Math.round(w / ratio))));
  };

  const updateHeight = (hStr: string) => {
    setHeightIn(hStr);
    if (!lockAspect || !naturalH) return;
    const h = parseInt(hStr, 10);
    if (!Number.isFinite(h) || h <= 0) return;
    setWidthIn(String(Math.max(1, Math.round(h * ratio))));
  };

  const renderPreview = useCallback(() => {
    if (!bufRef.current) return;
    const w = parseInt(widthIn, 10);
    const h = parseInt(heightIn, 10);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
      setError("Enter positive width and height.");
      return;
    }

    const outErr = rejectOutputDimensions(w, h);
    if (outErr) {
      setError(outErr);
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
        setError(e.data.error);
        return;
      }
      const blob = new Blob([e.data.buffer], { type: format });
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    };

    worker.onerror = () => {
      if (workerRef.current === worker) workerRef.current = null;
      worker.terminate();
      setError("Could not encode image.");
    };

    worker.postMessage(
      { type: "resize", buffer: copy, format, quality: format === "image/png" ? 1 : quality, width: w, height: h },
      [copy]
    );
  }, [widthIn, heightIn, format, quality]);

  useEffect(() => {
    if (!srcUrl || !widthIn || !heightIn) return;
    const t = setTimeout(renderPreview, 150);
    return () => clearTimeout(t);
  }, [srcUrl, widthIn, heightIn, format, quality, renderPreview]);

  const download = () => {
    if (!previewUrl) return;
    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${lastName}-resized.${ext}`;
    a.click();
    trackToolDownload("image-resizer", ext);
  };

  const clear = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    bufRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
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
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90"
          >
            <Upload className="h-4 w-4" />
            Choose image
          </button>
          {(srcUrl || previewUrl) && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {naturalW > 0 && (
          <p className="text-xs text-muted-foreground">
            Original {naturalW}×{naturalH}px — JPEG quality applies to JPEG/WebP only.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div>
            <label className="mb-1 block text-sm font-medium">Width (px)</label>
            <input
              type="number"
              min={1}
              max={16000}
              value={widthIn}
              onChange={(e) => updateWidth(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Height (px)</label>
            <input
              type="number"
              min={1}
              max={16000}
              value={heightIn}
              onChange={(e) => updateHeight(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Output format</label>
            <select
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
            <label className="mb-1 block text-sm font-medium">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
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

        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(e) => setLockAspect(e.target.checked)}
            className="rounded"
          />
          Lock aspect ratio (uses original proportions)
        </label>

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
          </div>
        </div>
      </div>
    </main>
  );
}
