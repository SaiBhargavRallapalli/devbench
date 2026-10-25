"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, Image as ImageIcon, Loader2 } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import { notify } from "@/lib/notify";
import { rejectInputImageDimensions } from "@/lib/image-worker-limits";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import { buildIco, squareTarget } from "@/lib/ico-builder";

const SLUG = "favicon-generator";
const MASTER = 48;
const SIZES = [16, 32, 48] as const;
const SNIPPET = '<link rel="icon" href="/favicon.ico">';

interface FaviconOutput {
  size: number;
  blob: Blob;
  url: string;
}

export default function FaviconGeneratorTool({ tool }: { tool: Tool }) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [srcName, setSrcName] = useState("");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [fillEnabled, setFillEnabled] = useState(false);
  const [fillColor, setFillColor] = useState("#ffffff");
  const [outputs, setOutputs] = useState<FaviconOutput[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const outUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    srcUrlRef.current = srcUrl;
  }, [srcUrl]);

  const clearOutputs = useCallback(() => {
    outUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    outUrlsRef.current = [];
    setOutputs([]);
  }, []);

  useEffect(() => {
    return () => {
      outUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    };
  }, []);

  async function onFile(f: File | null) {
    setError("");
    clearOutputs();
    imgRef.current = null;
    setDims(null);
    setSrcName("");
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }

    try {
      const url = URL.createObjectURL(f);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = url;
      });

      const dimErr = rejectInputImageDimensions(img.naturalWidth, img.naturalHeight);
      if (dimErr) {
        URL.revokeObjectURL(url);
        setError(dimErr);
        trackToolError(SLUG, "load", dimErr);
        return;
      }

      imgRef.current = img;
      setSrcName(f.name);
      setSrcUrl(url);
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
    } catch (e) {
      setError(
        friendlyError(e, "Couldn't read this image — try a PNG, JPEG, or WebP file."),
      );
      trackToolError(SLUG, "load", e instanceof Error ? e.message : String(e));
    }
  }

  // Render the source into a 48px master square, then downscale to each size.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !dims) return;
    let cancelled = false;
    (async () => {
      setGenerating(true);
      setError("");
      try {
        const master = document.createElement("canvas");
        master.width = MASTER;
        master.height = MASTER;
        const mctx = master.getContext("2d");
        if (!mctx) throw new Error("Canvas unsupported");
        mctx.imageSmoothingEnabled = true;
        mctx.imageSmoothingQuality = "high";
        if (fillEnabled) {
          mctx.fillStyle = fillColor;
          mctx.fillRect(0, 0, MASTER, MASTER);
        } else {
          mctx.clearRect(0, 0, MASTER, MASTER);
        }
        const t = squareTarget(dims.w, dims.h);
        const k = MASTER / t.size;
        mctx.drawImage(img, t.offsetX * k, t.offsetY * k, dims.w * k, dims.h * k);

        const next: FaviconOutput[] = [];
        for (const size of SIZES) {
          const c = document.createElement("canvas");
          c.width = size;
          c.height = size;
          const ctx = c.getContext("2d");
          if (!ctx) throw new Error("Canvas unsupported");
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(master, 0, 0, MASTER, MASTER, 0, 0, size, size);
          const blob = await new Promise<Blob>((resolve, reject) => {
            c.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("PNG export failed"))),
              "image/png",
            );
          });
          if (cancelled) return;
          next.push({ size, blob, url: URL.createObjectURL(blob) });
        }
        if (cancelled) {
          next.forEach((o) => URL.revokeObjectURL(o.url));
          return;
        }
        outUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
        outUrlsRef.current = next.map((o) => o.url);
        setOutputs(next);
        trackToolSuccess(SLUG, "generate", { sizes: SIZES.length });
      } catch (e) {
        if (!cancelled) {
          setError(friendlyError(e, "Couldn't generate favicons from this image."));
          trackToolError(SLUG, "generate", e instanceof Error ? e.message : String(e));
        }
      } finally {
        if (!cancelled) setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [dims, fillEnabled, fillColor]);

  function baseName(): string {
    return srcName.replace(/\.[^.]+$/, "") || "favicon";
  }

  function downloadPng(size: number) {
    const out = outputs.find((o) => o.size === size);
    if (!out) return;
    downloadBlob(out.blob, `${baseName()}-${size}.png`, SLUG);
  }

  async function downloadIco() {
    if (outputs.length === 0) return;
    try {
      const entries = [];
      for (const o of outputs) {
        entries.push({ size: o.size, pngBytes: new Uint8Array(await o.blob.arrayBuffer()) });
      }
      const ico = buildIco(entries);
      downloadBlob(new Blob([ico], { type: "image/x-icon" }), "favicon.ico", SLUG);
    } catch (e) {
      setError(friendlyError(e, "Couldn't build the .ico file."));
      trackToolError(SLUG, "build-ico", e instanceof Error ? e.message : String(e));
    }
  }

  async function copySnippet() {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      notify.success("Copied");
    } catch {
      notify.error("Copy failed — select the code and copy manually.");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Turns any image into a proper favicon set — 16, 32, and 48px PNGs plus a
          combined <code className="font-mono">favicon.ico</code>. Non-square images are
          padded on a transparent (or custom-colored) square. All in your browser.
        </p>

        {/* Upload zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Upload image to generate favicon"
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void onFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-colors"
        >
          {generating && dims ? (
            <>
              <Loader2 className="mx-auto w-10 h-10 text-muted-foreground mb-3 animate-spin" />
              <p className="text-sm font-medium">Generating favicons…</p>
            </>
          ) : srcUrl ? (
            <img src={srcUrl} alt="Source preview" className="max-h-48 mx-auto rounded-xl object-contain" />
          ) : (
            <>
              <ImageIcon className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop an image or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PNG · JPEG · WebP · any raster image</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        {dims && (
          <div className="flex flex-wrap items-end gap-4">
            <p className="text-xs text-muted-foreground">
              Source: {srcName} · {dims.w} × {dims.h}px
            </p>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={fillEnabled}
                onChange={(e) => setFillEnabled(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              Fill background
            </label>
            {fillEnabled && (
              <label className="flex items-center gap-2 text-sm">
                <span className="font-medium">Background color</span>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(e) => setFillColor(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded-lg border border-border bg-background p-1"
                />
                <span className="font-mono text-xs text-muted-foreground">{fillColor}</span>
              </label>
            )}
          </div>
        )}

        {outputs.length > 0 && (
          <>
            {/* Preview grid: each size at native + 4× zoom */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {outputs.map((o) => (
                <div
                  key={o.size}
                  className="flex flex-col items-center gap-3 rounded-xl border border-border bg-muted/30 p-4"
                >
                  <p className="text-xs font-medium text-muted-foreground">
                    {o.size} × {o.size}
                  </p>
                  <div className="flex h-24 items-center justify-center">
                    <img
                      src={o.url}
                      alt={`${o.size} by ${o.size} favicon preview at 4x zoom`}
                      width={o.size * 4}
                      height={o.size * 4}
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <img
                    src={o.url}
                    alt={`${o.size} by ${o.size} favicon preview at native size`}
                    width={o.size}
                    height={o.size}
                    className="rounded bg-muted"
                  />
                  <button
                    type="button"
                    onClick={() => downloadPng(o.size)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download {o.size}px PNG
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void downloadIco()}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90"
            >
              <Download className="h-4 w-4" />
              Download favicon.ico (16 + 32 + 48)
            </button>

            {/* HTML snippet */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Add it to your site</p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
                  {SNIPPET}
                </code>
                <button
                  type="button"
                  onClick={() => void copySnippet()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium hover:bg-muted"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Save <code className="font-mono">favicon.ico</code> in your site root, then
                paste this into the <code className="font-mono">&lt;head&gt;</code> of your pages.
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
