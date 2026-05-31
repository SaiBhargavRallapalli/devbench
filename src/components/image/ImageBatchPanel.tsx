"use client";

import { useRef, useState } from "react";
import JSZip from "jszip";
import { Download, ImageIcon, Loader2 } from "lucide-react";
import {
  batchConvertImages,
  isBatchConvertibleImage,
  type ImageBatchItem,
  type ImageOutputFormat,
} from "@/lib/image-batch-convert";
import { downloadBlob } from "@/lib/pdf-download";
import { trackToolDownload } from "@/lib/analytics-events";

const FORMAT_OPTIONS: { id: ImageOutputFormat; label: string }[] = [
  { id: "image/png", label: "PNG" },
  { id: "image/jpeg", label: "JPEG" },
  { id: "image/webp", label: "WebP" },
];

export default function ImageBatchPanel() {
  const [items, setItems] = useState<ImageBatchItem[]>([]);
  const [outFormat, setOutFormat] = useState<ImageOutputFormat>("image/webp");
  const [quality, setQuality] = useState(85);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: ImageBatchItem[] = [];
    for (const f of Array.from(files)) {
      if (!isBatchConvertibleImage(f)) continue;
      next.push({ name: f.name, file: f });
    }
    if (next.length === 0) {
      setStatus("No supported images selected (PNG, JPEG, WebP, HEIC, SVG, etc.).");
      return;
    }
    setItems((prev) => [...prev, ...next]);
    setStatus("");
  }

  async function convertAll() {
    if (!items.length) return;
    setBusy(true);
    setStatus("Converting…");
    try {
      const converted = await batchConvertImages(items, outFormat, quality, (p) => {
        setStatus(`${p.phase}: ${p.name} (${p.index + 1}/${p.total})`);
      });

      if (converted.length === 1) {
        downloadBlob(converted[0].blob, converted[0].name, "image-format-converter");
        trackToolDownload("image-format-converter", outFormat.split("/")[1] ?? "batch");
        setStatus("Downloaded converted image.");
        return;
      }

      const zip = new JSZip();
      for (const { name, blob } of converted) {
        zip.file(name, blob);
      }
      const zipped = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipped, "converted-images.zip", "image-format-converter");
      trackToolDownload("image-format-converter", "zip");
      setStatus(`Downloaded ZIP with ${converted.length} files.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Batch conversion failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 border-t border-border">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Batch image convert</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Convert multiple images to PNG, JPEG, or WebP at once — HEIC and SVG
          supported. Results download as a ZIP when you add more than one file.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Output format
            </label>
            <div className="flex gap-2">
              {FORMAT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setOutFormat(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                    outFormat === f.id
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {outFormat !== "image/png" && (
            <div className="min-w-[180px] flex-1 max-w-xs">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Quality — {quality}%
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.svg"
          multiple
          className="hidden"
          onChange={(e) => void onFiles(e.target.files)}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted"
          >
            Add images
          </button>
          <button
            type="button"
            disabled={busy || !items.length}
            onClick={() => void convertAll()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Convert & download
          </button>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setItems([]);
                setStatus("");
              }}
              className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted"
            >
              Clear ({items.length})
            </button>
          )}
        </div>
        {items.length > 0 && (
          <ul className="text-xs font-mono text-muted-foreground space-y-0.5 max-h-24 overflow-auto">
            {items.map((i) => (
              <li key={`${i.name}-${i.file.size}`}>{i.name}</li>
            ))}
          </ul>
        )}
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </div>
    </section>
  );
}
