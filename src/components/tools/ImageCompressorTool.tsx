"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";
import { IMAGE_WORKER_LIMITS_HELP, rejectInputImageDimensions } from "@/lib/image-worker-limits";
import { getImageWorkerUrl, type ImageWorkerResult } from "@/lib/image-worker";
import ToolPageHero from "@/components/tools/ToolPageHero";

type ImgFmt = "image/jpeg" | "image/webp";

export default function ImageCompressorTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bufRef = useRef<ArrayBuffer | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<ImgFmt>("image/jpeg");
  const [quality, setQuality] = useState(0.75);
  const [error, setError] = useState("");
  const [lastName, setLastName] = useState("image");
  const [origBytes, setOrigBytes] = useState<number | null>(null);
  const [outBytes, setOutBytes] = useState<number | null>(null);

  // Keep refs current so the unmount cleanup sees the latest URLs
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
    setOutBytes(null);
    setOrigBytes(file?.size ?? null);

    if (!file || !file.type.startsWith("image/")) {
      setError("Choose PNG, JPEG, or WebP.");
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
        setOrigBytes(null);
        setError(dimErr);
        return;
      }
    } catch {
      URL.revokeObjectURL(newUrl);
      bufRef.current = null;
      setOrigBytes(null);
      setError("Could not read this image.");
      return;
    }

    setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return newUrl; });
  }, []);

  const compress = useCallback(() => {
    if (!bufRef.current) return;

    // Terminate any in-flight worker before starting a new one
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
      setOutBytes(blob.size);
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
    };

    worker.onerror = () => {
      if (workerRef.current === worker) workerRef.current = null;
      worker.terminate();
      setError("Compression failed.");
    };

    // Transfer the copy — zero-copy into the worker; original bufRef is intact
    worker.postMessage({ type: "compress", buffer: copy, format, quality }, [copy]);
  }, [format, quality]);

  useEffect(() => {
    if (!srcUrl) return;
    const t = setTimeout(compress, 200);
    return () => clearTimeout(t);
  }, [srcUrl, compress]);

  const download = () => {
    if (!previewUrl) return;
    const ext = format === "image/jpeg" ? "jpg" : "webp";
    const a = document.createElement("a");
    a.href = previewUrl;
    a.download = `${lastName}-compressed.${ext}`;
    a.click();
    trackToolDownload("image-compressor", ext);
  };

  const clear = () => {
    workerRef.current?.terminate();
    workerRef.current = null;
    bufRef.current = null;
    setSrcUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setPreviewUrl((prev) => { if (prev) URL.revokeObjectURL(prev); return null; });
    setOrigBytes(null);
    setOutBytes(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const saved =
    origBytes && outBytes && origBytes > 0
      ? Math.round((1 - outBytes / origBytes) * 100)
      : null;

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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">Output format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ImgFmt)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/webp">WebP</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Quality ({Math.round(quality * 100)}%)
            </label>
            <input
              type="range"
              min={0.4}
              max={0.95}
              step={0.05}
              value={quality}
              onChange={(e) => setQuality(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {origBytes !== null && (
          <p className="text-xs text-muted-foreground">
            Original ~{(origBytes / 1024).toFixed(1)} KB
            {outBytes !== null && (
              <>
                {" "}
                → compressed ~{(outBytes / 1024).toFixed(1)} KB
                {saved !== null && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {" "}
                    (~{saved}% smaller)
                  </span>
                )}
              </>
            )}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium">Original</p>
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4">
              {srcUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcUrl} alt="" className="max-h-72 max-w-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">No file</span>
              )}
            </div>
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium">Compressed</p>
              <button
                type="button"
                disabled={!previewUrl}
                onClick={download}
                className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-40"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="" className="max-h-72 max-w-full object-contain" />
              ) : (
                <span className="text-sm text-muted-foreground">Adjust quality…</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
