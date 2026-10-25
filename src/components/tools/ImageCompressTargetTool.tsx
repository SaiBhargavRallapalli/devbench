"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Trash2, Upload } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import {
  IMAGE_WORKER_LIMITS_HELP,
  rejectInputImageDimensions,
  rejectOutputDimensions,
} from "@/lib/image-worker-limits";
import {
  getImageWorkerUrl,
  type ImageWorkerMessage,
  type ImageWorkerResult,
} from "@/lib/image-worker";
import {
  TARGET_MAX_ATTEMPTS,
  TARGET_MAX_QUALITY,
  TARGET_MIN_QUALITY,
  TARGET_QUALITY_EPSILON,
  TARGET_RESUME_QUALITY,
  TARGET_TOLERANCE,
  formatBytes,
  minimumAchievableMessage,
  nextQuality,
  parseTargetSize,
  scaleForTarget,
} from "@/lib/image-target-size";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import ToolPageHero from "@/components/tools/ToolPageHero";

type ImgFmt = "image/jpeg" | "image/webp";
const SLUG = "image-compress-target";

/** Attempts spent bisecting quality before falling back to a downscale. */
const QUALITY_PHASE_ATTEMPTS = 7;

const PRESETS: { label: string; text: string; unit: "KB" | "MB" }[] = [
  { label: "50 KB", text: "50", unit: "KB" },
  { label: "100 KB", text: "100", unit: "KB" },
  { label: "200 KB", text: "200", unit: "KB" },
  { label: "500 KB", text: "500", unit: "KB" },
  { label: "1 MB", text: "1", unit: "MB" },
  { label: "2 MB", text: "2", unit: "MB" },
];

type Result = {
  blob: Blob;
  bytes: number;
  exact: boolean;
  downscaledTo: { width: number; height: number } | null;
  alreadyUnder: boolean;
};

type Best = { bytes: number; blob: Blob };

/**
 * Track the best candidate across attempts: the closest under-target result
 * wins; if nothing fits under the target, keep the smallest over-target one.
 */
function pickBest(prev: Best | null, bytes: number, blob: Blob, target: number): Best {
  if (!prev) return { bytes, blob };
  const prevGood = prev.bytes <= target;
  const good = bytes <= target;
  if (good && !prevGood) return { bytes, blob };
  if (good && prevGood) return bytes > prev.bytes ? { bytes, blob } : prev;
  if (!good && prevGood) return prev;
  return bytes < prev.bytes ? { bytes, blob } : prev;
}

/** One encode attempt on a fresh worker — sequential awaits keep the search loop simple. */
function runWorkerOnce(msg: ImageWorkerMessage): Promise<ImageWorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(getImageWorkerUrl());
    const timer = window.setTimeout(() => {
      worker.terminate();
      reject(new Error("timeout"));
    }, 30_000);
    worker.onmessage = (e: MessageEvent<ImageWorkerResult>) => {
      window.clearTimeout(timer);
      worker.terminate();
      resolve(e.data);
    };
    worker.onerror = () => {
      window.clearTimeout(timer);
      worker.terminate();
      reject(new Error("worker failed"));
    };
    const copy = msg.buffer.slice(0);
    worker.postMessage({ ...msg, buffer: copy }, [copy]);
  });
}

/** Lossless white-background intermediate so transparent pixels don't turn black in JPEG. */
async function flattenToWhite(
  buffer: ArrayBuffer,
  width: number,
  height: number,
): Promise<ArrayBuffer> {
  const bitmap = await createImageBitmap(new Blob([buffer]));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("encode failed");
  return blob.arrayBuffer();
}

export default function ImageCompressTargetTool({ tool }: { tool: Tool }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const bufRef = useRef<ArrayBuffer | null>(null);
  const dimsRef = useRef<{ width: number; height: number } | null>(null);
  const srcTypeRef = useRef<string>("");
  const srcUrlRef = useRef<string | null>(null);
  const outUrlRef = useRef<string | null>(null);
  const runSeqRef = useRef(0);

  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [targetText, setTargetText] = useState("50");
  const [unit, setUnit] = useState<"KB" | "MB">("KB");
  const [format, setFormat] = useState<ImgFmt>("image/jpeg");
  const [error, setError] = useState("");
  const [targetError, setTargetError] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [origBytes, setOrigBytes] = useState<number | null>(null);
  const [lastName, setLastName] = useState("image");

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);
  useEffect(() => { outUrlRef.current = outUrl; }, [outUrl]);

  useEffect(() => {
    return () => {
      // Invalidate in-flight runs. Ref mutation in cleanup is intentional here
      // (runSeqRef is a mutable counter, not a DOM node).
      // eslint-disable-next-line react-hooks/exhaustive-deps
      runSeqRef.current++;
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
      if (outUrlRef.current) URL.revokeObjectURL(outUrlRef.current);
    };
  }, []);

  const clearOutUrl = useCallback(() => {
    setOutUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const onPickFile = useCallback(async (file: File | null) => {
    setError("");
    setTargetError("");
    setResult(null);
    clearOutUrl();
    setOrigBytes(file?.size ?? null);

    if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      setOrigBytes(null);
      return;
    }

    const newUrl = URL.createObjectURL(file);
    try {
      const buffer = await file.arrayBuffer();
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
      bufRef.current = buffer;
      dimsRef.current = { width: dims.w, height: dims.h };
      srcTypeRef.current = file.type;
      setDims({ width: dims.w, height: dims.h });
    } catch {
      URL.revokeObjectURL(newUrl);
      bufRef.current = null;
      setOrigBytes(null);
      setError("Could not read this image.");
      return;
    }

    setLastName(file.name.replace(/\.[^.]+$/, "") || "image");
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return newUrl;
    });
  }, [clearOutUrl]);

  const runCompress = useCallback(async () => {
    const buffer = bufRef.current;
    const dims = dimsRef.current;
    if (!buffer || !dims) return;

    const targetBytes = parseTargetSize(targetText, unit);
    if (targetBytes === null) {
      setTargetError("Enter a target size greater than 0 (e.g. 50 or 1.5).");
      return;
    }
    setTargetError("");

    const seq = ++runSeqRef.current;
    const stale = () => runSeqRef.current !== seq;
    setRunning(true);
    setError("");

    try {
      const finish = (res: Result) => {
        clearOutUrl();
        setResult(res);
        setOutUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return URL.createObjectURL(res.blob);
        });
      };

      // (1) Already under the target — nothing to compress, offer the original.
      if (origBytes !== null && origBytes <= targetBytes) {
        if (stale()) return;
        finish({
          blob: new Blob([buffer], { type: srcTypeRef.current || "image/jpeg" }),
          bytes: origBytes,
          exact: true,
          downscaledTo: null,
          alreadyUnder: true,
        });
        trackToolSuccess(SLUG, "compress", { outcome: "already-under" });
        return;
      }

      // Transparent → white intermediate when encoding JPEG from PNG/WebP.
      let source = buffer;
      if (format === "image/jpeg" && srcTypeRef.current !== "image/jpeg") {
        source = await flattenToWhite(buffer, dims.width, dims.height);
        if (stale()) return;
      }

      let attempts = 0;
      let best: Best | null = null;
      let downscaledTo: { width: number; height: number } | null = null;

      // (2) Quality bisection: [lo, hi] brackets the quality that hits the target.
      let lo = TARGET_MIN_QUALITY;
      let hi = TARGET_MAX_QUALITY;
      let q = TARGET_MAX_QUALITY;
      let currentSource = source;
      let currentWidth = dims.width;
      let currentHeight = dims.height;

      while (attempts < TARGET_MAX_ATTEMPTS) {
        attempts++;
        const res = await runWorkerOnce({
          type: "compress",
          buffer: currentSource,
          format,
          quality: q,
        });
        if (stale()) return;
        if (!res.ok) throw new Error(res.error || "Compression failed.");
        const blob = new Blob([res.buffer], { type: format });
        best = pickBest(best, blob.size, blob, targetBytes);
        if (Math.abs(blob.size - targetBytes) <= targetBytes * TARGET_TOLERANCE) break;
        if (blob.size > targetBytes) hi = q;
        else lo = q;

        // (3) Quality floor reached and still over → downscale, then resume the search.
        const qualityPhaseDone =
          hi - lo < TARGET_QUALITY_EPSILON || attempts >= QUALITY_PHASE_ATTEMPTS;
        if (qualityPhaseDone && blob.size > targetBytes) {
          if (downscaledTo) break; // already downscaled once — best effort
          const scaleDims = scaleForTarget(blob.size, targetBytes, currentWidth, currentHeight);
          if (!scaleDims) break;
          const dimErr = rejectOutputDimensions(scaleDims.width, scaleDims.height);
          if (dimErr) throw new Error(dimErr);
          const rz = await runWorkerOnce({
            type: "resize",
            buffer: source,
            format,
            quality: TARGET_RESUME_QUALITY,
            width: scaleDims.width,
            height: scaleDims.height,
          });
          if (stale()) return;
          if (!rz.ok) throw new Error(rz.error || "Resize failed.");
          attempts++;
          downscaledTo = scaleDims;
          currentSource = source;
          currentWidth = scaleDims.width;
          currentHeight = scaleDims.height;
          const rzBlob = new Blob([rz.buffer], { type: format });
          best = pickBest(best, rzBlob.size, rzBlob, targetBytes);
          if (Math.abs(rzBlob.size - targetBytes) <= targetBytes * TARGET_TOLERANCE) break;
          // Resume the bisection around the post-resize quality.
          if (rzBlob.size > targetBytes) {
            lo = TARGET_MIN_QUALITY;
            hi = TARGET_RESUME_QUALITY;
          } else {
            lo = TARGET_RESUME_QUALITY;
            hi = TARGET_MAX_QUALITY;
          }
          q = nextQuality(lo, hi, rzBlob.size, targetBytes);
          continue;
        }

        if (qualityPhaseDone) break; // under target but not within tolerance — done
        const nq = nextQuality(lo, hi, blob.size, targetBytes);
        if (nq <= lo || nq >= hi) break;
        q = nq;
      }

      if (stale() || !best) return;
      finish({
        blob: best.blob,
        bytes: best.bytes,
        exact: best.bytes <= targetBytes,
        downscaledTo,
        alreadyUnder: false,
      });
      trackToolSuccess(SLUG, "compress", {
        outcome: best.bytes <= targetBytes ? "target-reached" : "best-effort",
        attempts,
        downscaled: downscaledTo ? "yes" : "no",
      });
    } catch (e) {
      if (stale()) return;
      const raw = e instanceof Error ? e.message : String(e);
      setError(friendlyError(e, "Couldn't compress this image."));
      trackToolError(SLUG, "compress", raw);
    } finally {
      if (!stale()) setRunning(false);
    }
  }, [clearOutUrl, format, origBytes, targetText, unit]);

  // Debounced auto-run (300ms) whenever the image or target inputs change.
  useEffect(() => {
    if (!srcUrl) return;
    const t = setTimeout(() => void runCompress(), 300);
    return () => clearTimeout(t);
  }, [srcUrl, runCompress]);

  const download = () => {
    if (!result) return;
    const ext = result.alreadyUnder
      ? srcTypeRef.current === "image/png"
        ? "png"
        : srcTypeRef.current === "image/webp"
          ? "webp"
          : "jpg"
      : format === "image/jpeg"
        ? "jpg"
        : "webp";
    const suffix = result.alreadyUnder ? "-original" : "-compressed";
    downloadBlob(result.blob, `${lastName}${suffix}.${ext}`, SLUG);
  };

  const clear = () => {
    runSeqRef.current++;
    bufRef.current = null;
    dimsRef.current = null;
    srcTypeRef.current = "";
    setDims(null);
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    clearOutUrl();
    setOrigBytes(null);
    setResult(null);
    setError("");
    setTargetError("");
    setRunning(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const savings =
    result && origBytes && origBytes > 0
      ? Math.round((1 - result.bytes / origBytes) * 100)
      : null;

  const targetBytesNow = parseTargetSize(targetText, unit);
  const statusText = (() => {
    if (!result || running) return null;
    if (result.alreadyUnder) {
      return `Your image is already ${formatBytes(result.bytes)} — under the ${
        targetBytesNow ? formatBytes(targetBytesNow) : "requested"
      } target. No compression needed.`;
    }
    if (!targetBytesNow) return null;
    if (result.exact) {
      return `Reached ${formatBytes(result.bytes)} of ${formatBytes(targetBytesNow)} target${
        savings !== null ? ` (−${savings}%)` : ""
      }.`;
    }
    return `Closest achievable: ${formatBytes(result.bytes)} (target ${formatBytes(
      targetBytesNow,
    )}). ${minimumAchievableMessage(targetBytesNow)}`;
  })();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-xs text-muted-foreground leading-relaxed">{IMAGE_WORKER_LIMITS_HELP}</p>

        {!srcUrl ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              void onPickFile(e.dataTransfer.files?.[0] ?? null);
            }}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileRef.current?.click();
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Upload image to compress"
            className={`group flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-16 text-center transition-colors ${
              dragOver
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/50 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => void onPickFile(e.target.files?.[0] ?? null)}
            />
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <Upload className="h-7 w-7 text-accent" />
            </div>
            <div>
              <p className="text-base font-semibold">
                Drop an image here, or click to upload
              </p>
              <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG, or WebP</p>
            </div>
            <span className="flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              🔒 Runs 100% in your browser
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Image loaded (~{origBytes !== null ? formatBytes(origBytes) : "?"})
            </p>
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </button>
          </div>
        )}

        {/* Target size controls */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ict-target" className="mb-2 block text-sm font-medium">
              Target size
            </label>
            <div className="flex gap-2">
              <input
                id="ict-target"
                type="number"
                min="0"
                step="0.1"
                inputMode="decimal"
                value={targetText}
                onChange={(e) => setTargetText(e.target.value)}
                aria-invalid={targetError ? true : undefined}
                aria-describedby={targetError ? "ict-target-error" : undefined}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
              />
              <select
                aria-label="Target size unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as "KB" | "MB")}
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="KB">KB</option>
                <option value="MB">MB</option>
              </select>
            </div>
            {targetError && (
              <p id="ict-target-error" className="mt-2 text-sm text-destructive" role="alert">
                {targetError}
              </p>
            )}
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-medium">Output format</legend>
            <div className="flex gap-4">
              {(["image/jpeg", "image/webp"] as ImgFmt[]).map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="ict-format"
                    value={f}
                    checked={format === f}
                    onChange={() => setFormat(f)}
                  />
                  {f === "image/jpeg" ? "JPEG" : "WebP"}
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {/* Preset chips — common form upload limits */}
        <div>
          <p className="mb-2 text-sm font-medium">Common limits</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setTargetText(p.text);
                  setUnit(p.unit);
                }}
                aria-pressed={targetText === p.text && unit === p.unit}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  targetText === p.text && unit === p.unit
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {running && (
          <p className="text-sm text-muted-foreground" role="status">
            Finding the best settings for your target…
          </p>
        )}

        {statusText && (
          <p className="text-sm font-medium" role="status">
            {statusText}
          </p>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {srcUrl && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium">Original</p>
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={srcUrl}
                  alt="Original image"
                  className="max-h-72 max-w-full object-contain"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {origBytes !== null ? formatBytes(origBytes) : ""}
                {dims ? ` · ${dims.width}×${dims.height}px` : ""}
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">Result</p>
                <button
                  type="button"
                  disabled={!result}
                  onClick={download}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
              <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-muted/20 p-4">
                {outUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={outUrl}
                    alt="Compressed image preview"
                    className="max-h-72 max-w-full object-contain"
                  />
                ) : result?.alreadyUnder ? (
                  <span className="text-sm text-muted-foreground">
                    No changes needed — download the original.
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">Working…</span>
                )}
              </div>
              {result && savings !== null && !result.alreadyUnder && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {formatBytes(result.bytes)} ({savings}% smaller)
                  {result.downscaledTo &&
                    ` · downscaled to ${result.downscaledTo.width}×${result.downscaledTo.height}px to reach the target`}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
