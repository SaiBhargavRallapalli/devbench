"use client";

import { useCallback, useId, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileImage,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import {
  IMAGE_WORKER_LIMITS_HELP,
  rejectOutputDimensions,
} from "@/lib/image-worker-limits";

const TOOL_SLUG = "image-merger";

type Layout = "horizontal" | "vertical" | "grid";
type OutputFmt = "image/png" | "image/jpeg" | "image/webp";

type Row = { id: string; file: File; preview: string };

type PlacedImage = {
  bmp: ImageBitmap;
  x: number;
  y: number;
  w: number;
  h: number;
};

function extForFmt(fmt: OutputFmt): string {
  if (fmt === "image/jpeg") return "jpg";
  if (fmt === "image/webp") return "webp";
  return "png";
}

function computeLayout(
  bitmaps: ImageBitmap[],
  layout: Layout,
  gap: number,
): { width: number; height: number; placed: PlacedImage[] } {
  if (bitmaps.length === 0) return { width: 0, height: 0, placed: [] };

  const placed: PlacedImage[] = [];

  if (layout === "horizontal") {
    const targetH = Math.max(...bitmaps.map((b) => b.height));
    const scaled = bitmaps.map((b) => {
      const scale = targetH / b.height;
      return { bmp: b, w: Math.round(b.width * scale), h: targetH };
    });
    const width =
      scaled.reduce((s, item) => s + item.w, 0) + gap * (scaled.length - 1);
    let x = 0;
    for (const item of scaled) {
      placed.push({ bmp: item.bmp, x, y: 0, w: item.w, h: item.h });
      x += item.w + gap;
    }
    return { width, height: targetH, placed };
  }

  if (layout === "vertical") {
    const targetW = Math.max(...bitmaps.map((b) => b.width));
    const scaled = bitmaps.map((b) => {
      const scale = targetW / b.width;
      return { bmp: b, w: targetW, h: Math.round(b.height * scale) };
    });
    const height =
      scaled.reduce((s, item) => s + item.h, 0) + gap * (scaled.length - 1);
    let y = 0;
    for (const item of scaled) {
      placed.push({ bmp: item.bmp, x: 0, y, w: item.w, h: item.h });
      y += item.h + gap;
    }
    return { width: targetW, height, placed };
  }

  const cols = 2;
  const rows = Math.ceil(bitmaps.length / cols);
  const colWidths = [0, 0];
  const rowHeights: number[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= bitmaps.length) continue;
      colWidths[c] = Math.max(colWidths[c], bitmaps[idx].width);
    }
    let rowH = 0;
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= bitmaps.length) continue;
      const b = bitmaps[idx];
      const scale = colWidths[c] / b.width;
      rowH = Math.max(rowH, Math.round(b.height * scale));
    }
    rowHeights.push(rowH);
  }

  const width = colWidths[0] + colWidths[1] + (bitmaps.length > 1 ? gap : 0);
  const height =
    rowHeights.reduce((s, h) => s + h, 0) + gap * Math.max(0, rows - 1);

  let y = 0;
  for (let r = 0; r < rows; r++) {
    let x = 0;
    for (let c = 0; c < cols; c++) {
      const idx = r * cols + c;
      if (idx >= bitmaps.length) break;
      const b = bitmaps[idx];
      const cellW = colWidths[c];
      const scale = cellW / b.width;
      const h = Math.round(b.height * scale);
      placed.push({ bmp: b, x, y, w: cellW, h });
      x += cellW + gap;
    }
    y += rowHeights[r] + gap;
  }

  return { width, height, placed };
}

async function mergeToBlob(
  rows: Row[],
  layout: Layout,
  gap: number,
  bgColor: string,
  fmt: OutputFmt,
  quality: number,
): Promise<Blob> {
  const bitmaps: ImageBitmap[] = [];
  try {
    for (const row of rows) {
      bitmaps.push(await createImageBitmap(row.file));
    }

    const { width, height, placed } = computeLayout(bitmaps, layout, gap);
    const dimErr = rejectOutputDimensions(width, height);
    if (dimErr) throw new Error(dimErr);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable");

    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    for (const item of placed) {
      ctx.drawImage(item.bmp, item.x, item.y, item.w, item.h);
    }

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error("Could not encode merged image"));
        },
        fmt,
        fmt === "image/png" ? undefined : quality,
      );
    });
  } finally {
    bitmaps.forEach((b) => b.close());
  }
}

export default function ImageMergerTool({ tool }: { tool: Tool }) {
  const inputId = useId();
  const [rows, setRows] = useState<Row[]>([]);
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [gap, setGap] = useState(8);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [fmt, setFmt] = useState<OutputFmt>("image/png");
  const [quality, setQuality] = useState(0.92);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const revokePreview = useCallback((url: string) => {
    URL.revokeObjectURL(url);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) revokePreview(prev);
      return null;
    });
  }, [revokePreview]);

  const clearAll = useCallback(() => {
    setRows((prev) => {
      prev.forEach((r) => revokePreview(r.preview));
      return [];
    });
    clearPreview();
    setError("");
  }, [revokePreview, clearPreview]);

  const pushFiles = useCallback(
    (list: FileList | File[]) => {
      setError("");
      clearPreview();
      const files = Array.from(list).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (files.length === 0) {
        setError("Choose image files (PNG, JPEG, WebP, GIF, etc.).");
        return;
      }
      const next: Row[] = files.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
      }));
      setRows((prev) => [...prev, ...next]);
    },
    [clearPreview],
  );

  const removeAt = (idx: number) => {
    clearPreview();
    setRows((prev) => {
      const row = prev[idx];
      if (!row) return prev;
      revokePreview(row.preview);
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  };

  const move = (idx: number, dir: -1 | 1) => {
    clearPreview();
    setRows((prev) => {
      const j = idx + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[j]] = [copy[j], copy[idx]];
      return copy;
    });
  };

  const runMerge = async (forPreview: boolean) => {
    if (rows.length < 2) {
      setError("Add at least two images to merge.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const blob = await mergeToBlob(rows, layout, gap, bgColor, fmt, quality);
      if (forPreview) {
        clearPreview();
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        downloadBlob(blob, `merged.${extForFmt(fmt)}`, TOOL_SLUG);
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Could not merge images — try smaller files.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const totalMb = useMemo(
    () => rows.reduce((s, r) => s + r.file.size, 0) / (1024 * 1024),
    [rows],
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <label
          htmlFor={inputId}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            pushFiles(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-12 text-center transition-colors hover:border-accent/50 hover:bg-muted/50"
        >
          <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            Drop images here or click to browse
          </p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            PNG, JPEG, WebP, GIF, BMP — add two or more, reorder, then merge.
            Runs entirely in your browser.
          </p>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files;
              if (f?.length) pushFiles(f);
              e.target.value = "";
            }}
          />
        </label>

        {rows.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Layout
                </span>
                <select
                  value={layout}
                  disabled={busy}
                  onChange={(e) => {
                    clearPreview();
                    setLayout(e.target.value as Layout);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="horizontal">Side by side</option>
                  <option value="vertical">Stacked</option>
                  <option value="grid">Grid (2 columns)</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Gap ({gap}px)
                </span>
                <input
                  type="range"
                  min={0}
                  max={48}
                  step={2}
                  value={gap}
                  disabled={busy}
                  onChange={(e) => {
                    clearPreview();
                    setGap(Number(e.target.value));
                  }}
                  className="w-full"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Background
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    disabled={busy}
                    onChange={(e) => {
                      clearPreview();
                      setBgColor(e.target.value);
                    }}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    disabled={busy}
                    onChange={(e) => {
                      clearPreview();
                      setBgColor(e.target.value);
                    }}
                    className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm"
                  />
                </div>
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Output format
                </span>
                <select
                  value={fmt}
                  disabled={busy}
                  onChange={(e) => setFmt(e.target.value as OutputFmt)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </label>
            </div>

            {fmt !== "image/png" && (
              <label className="block max-w-xs space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Quality ({Math.round(quality * 100)}%)
                </span>
                <input
                  type="range"
                  min={0.5}
                  max={1}
                  step={0.01}
                  value={quality}
                  disabled={busy}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
              </label>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{rows.length}</span>
                {" "}image{rows.length === 1 ? "" : "s"} ·{" "}
                {totalMb < 0.01 ? "<0.01" : totalMb.toFixed(2)} MB total
              </p>
              <button
                type="button"
                onClick={clearAll}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Clear all
              </button>
            </div>

            <ul className="space-y-2">
              {rows.map((row, idx) => (
                <li
                  key={row.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background p-3"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.preview}
                    alt={row.file.name}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{row.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(row.file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Move up"
                      disabled={busy || idx === 0}
                      onClick={() => move(idx, -1)}
                      className="rounded-lg p-2 hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Move down"
                      disabled={busy || idx === rows.length - 1}
                      onClick={() => move(idx, 1)}
                      className="rounded-lg p-2 hover:bg-muted disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove"
                      disabled={busy}
                      onClick={() => removeAt(idx)}
                      className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {previewUrl && (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Preview
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Merged preview"
                  className="max-h-80 w-full rounded-lg object-contain"
                />
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void runMerge(true)}
                disabled={busy || rows.length < 2}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-semibold hover:bg-muted disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileImage className="h-4 w-4" />
                )}
                Preview merge
              </button>
              <button
                type="button"
                onClick={() => void runMerge(false)}
                disabled={busy || rows.length < 2}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download merged image
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <p className="flex items-start gap-2 text-xs text-muted-foreground">
          <FileImage className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Side-by-side aligns images to the tallest height; stacked aligns to the
          widest width; grid uses two columns left-to-right. {IMAGE_WORKER_LIMITS_HELP}
        </p>
      </div>
    </main>
  );
}
