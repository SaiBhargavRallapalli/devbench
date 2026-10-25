"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Image as ImageIcon, Loader2, ShieldCheck } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import { friendlyError } from "@/lib/friendly-error";
import { rejectInputImageDimensions } from "@/lib/image-worker-limits";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";

const SLUG = "remove-image-metadata";
const ACCEPT_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const QUALITY = 0.92;

type OutFormat = "keep" | "png" | "jpeg";

interface MetaRow {
  label: string;
  value: string;
  isLocation?: boolean;
}

const WANTED_TAGS: Array<{ key: string; label: string }> = [
  { key: "Make", label: "Camera make" },
  { key: "Model", label: "Camera model" },
  { key: "DateTimeOriginal", label: "Date taken" },
  { key: "LensModel", label: "Lens" },
  { key: "LensMake", label: "Lens make" },
  { key: "Software", label: "Software" },
];

function formatValue(val: unknown): string {
  if (val === null || val === undefined) return "—";
  if (typeof val === "number") return Number.isFinite(val) ? String(val) : "—";
  if (val instanceof Date) return val.toLocaleString();
  if (Array.isArray(val)) return val.join(", ");
  return String(val);
}

function extForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  return "png";
}

function formatKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function RemoveImageMetadataTool({ tool }: { tool: Tool }) {
  const [srcUrl, setSrcUrl] = useState<string | null>(null);
  const [srcName, setSrcName] = useState("");
  const [srcSize, setSrcSize] = useState(0);
  const [srcMime, setSrcMime] = useState("");
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [rows, setRows] = useState<MetaRow[]>([]);
  const [clean, setClean] = useState(false);
  const [fmt, setFmt] = useState<OutFormat>("keep");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBlob, setOutBlob] = useState<Blob | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const srcUrlRef = useRef<string | null>(null);
  const outUrlRef = useRef<string | null>(null);

  useEffect(() => {
    srcUrlRef.current = srcUrl;
  }, [srcUrl]);
  useEffect(() => {
    outUrlRef.current = outUrl;
  }, [outUrl]);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
      if (outUrlRef.current) URL.revokeObjectURL(outUrlRef.current);
    };
  }, []);

  const clearOutput = useCallback(() => {
    setOutUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setOutBlob(null);
  }, []);

  async function onFile(f: File | null) {
    setError("");
    setRows([]);
    setClean(false);
    setDims(null);
    imgRef.current = null;
    setSrcName("");
    setSrcSize(0);
    setSrcMime("");
    clearOutput();
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (!f) return;

    const looksJpegPngWebp =
      ACCEPT_MIME.has(f.type.toLowerCase()) || /\.(jpe?g|png|webp)$/i.test(f.name);
    if (!looksJpegPngWebp) {
      setError("Choose a JPEG, PNG, or WebP image.");
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
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      setSrcUrl(url);
      setSrcName(f.name);
      setSrcSize(f.size);
      const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
      const mimeFromExt =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "webp"
            ? "image/webp"
            : "image/png";
      setSrcMime(f.type || mimeFromExt);

      // Read EXIF — dynamic import keeps exifr out of the initial bundle.
      const found: MetaRow[] = [];
      try {
        const exifr = (await import("exifr")).default;
        const data: Record<string, unknown> | null = await exifr.parse(f, {
          tiff: true,
          exif: true,
          gps: true,
          iptc: false,
          xmp: false,
          icc: false,
          mergeOutput: true,
        });
        const all = data ?? {};

        if (all.GPSLatitude != null && all.GPSLongitude != null) {
          const latRef = (all.GPSLatitudeRef as string ?? "N") === "S" ? -1 : 1;
          const lonRef = (all.GPSLongitudeRef as string ?? "E") === "W" ? -1 : 1;
          const toDecimal = (v: unknown, ref: number): number => {
            const val = Array.isArray(v)
              ? (v[0] as number) + (v[1] as number) / 60 + (v[2] as number) / 3600
              : (v as number);
            return val * ref;
          };
          const lat = toDecimal(all.GPSLatitude, latRef);
          const lon = toDecimal(all.GPSLongitude, lonRef);
          found.push({
            label: "Location",
            value: `${lat.toFixed(6)}, ${lon.toFixed(6)}`,
            isLocation: true,
          });
        }

        for (const { key, label } of WANTED_TAGS) {
          const v = all[key];
          if (v !== undefined && v !== null) {
            found.push({ label, value: formatValue(v) });
          }
        }
      } catch {
        // Unreadable/absent metadata is not an error — treat as clean.
      }

      if (found.length === 0) {
        setClean(true);
      } else {
        setRows(found);
      }
    } catch (e) {
      setError(friendlyError(e, "Couldn't read this image — try a JPEG, PNG, or WebP file."));
      trackToolError(SLUG, "load", e instanceof Error ? e.message : String(e));
    }
  }

  function targetMime(): string {
    if (fmt === "png") return "image/png";
    if (fmt === "jpeg") return "image/jpeg";
    return srcMime.startsWith("image/") ? srcMime : "image/png";
  }

  function process() {
    const img = imgRef.current;
    if (!img || !dims || clean || busy) return;
    setBusy(true);
    setError("");
    clearOutput();

    try {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) throw new Error("Canvas unsupported");
      canvas.width = dims.w;
      canvas.height = dims.h;

      const mime = targetMime();
      // Re-encoding through the canvas drops every metadata block (EXIF, IPTC,
      // XMP, ICC…). JPEG gets a white background because it has no alpha.
      if (mime === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, dims.w, dims.h);
      } else {
        ctx.clearRect(0, 0, dims.w, dims.h);
      }
      ctx.drawImage(img, 0, 0, dims.w, dims.h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Couldn't re-encode this image — try a different output format.");
            trackToolError(SLUG, "strip", "toBlob returned null");
            setBusy(false);
            return;
          }
          setOutBlob(blob);
          setOutUrl(URL.createObjectURL(blob));
          setBusy(false);
          trackToolSuccess(SLUG, "strip", { format: mime, bytes: blob.size });
        },
        mime,
        mime === "image/png" ? undefined : QUALITY,
      );
    } catch (e) {
      setError(friendlyError(e, "Couldn't strip metadata from this image."));
      trackToolError(SLUG, "strip", e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  function download() {
    if (!outBlob) return;
    const base = srcName.replace(/\.[^.]+$/, "") || "image";
    const ext = extForMime(targetMime());
    downloadBlob(outBlob, `${base}-stripped.${ext}`, SLUG);
  }

  const canProcess = !clean && dims !== null;
  const savings =
    outBlob && srcSize ? ((1 - outBlob.size / srcSize) * 100).toFixed(1) : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Strips EXIF metadata — camera model, dates, and GPS location — by re-encoding
          the image in your browser. Nothing is uploaded.
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
          aria-label="Upload image to strip metadata"
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files[0];
            if (f) void onFile(f);
          }}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-colors"
        >
          {srcUrl ? (
            <img src={srcUrl} alt="Source preview" className="max-h-48 mx-auto rounded-xl object-contain" />
          ) : (
            <>
              <ImageIcon className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop an image or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">JPEG · PNG · WebP</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
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

        {clean && (
          <p
            role="status"
            className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground"
          >
            No metadata found — image is already clean. (PNGs and screenshots usually
            contain no EXIF data.)
          </p>
        )}

        {rows.length > 0 && (
          <div role="status" className="space-y-2 rounded-xl border border-border bg-muted/30 p-4">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Metadata found and will be removed
            </p>
            <ul className="divide-y divide-border">
              {rows.map((r) => (
                <li
                  key={r.label}
                  className={`flex flex-wrap gap-x-4 gap-y-1 py-2 text-sm ${
                    r.isLocation ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <span className="w-40 shrink-0">
                    {r.isLocation ? "📍 Location" : r.label}
                  </span>
                  <span className="font-mono break-all">{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {dims && (
          <div className="flex flex-wrap items-end gap-4">
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Output format</span>
              <select
                value={fmt}
                onChange={(e) => {
                  setFmt(e.target.value as OutFormat);
                  clearOutput();
                }}
                className="block rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="keep">Keep same ({extForMime(srcMime).toUpperCase()})</option>
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
              </select>
            </label>
            <button
              type="button"
              onClick={process}
              disabled={busy}
              aria-disabled={!canProcess || busy}
              title={
                !canProcess ? "No metadata found — image is already clean" : undefined
              }
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 aria-disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Remove metadata
            </button>
            <p className="basis-full text-xs text-muted-foreground">
              Re-encodes the image; quality is preserved visually but bytes may change.
              All metadata (EXIF, IPTC, XMP, ICC) is removed.
            </p>
          </div>
        )}

        {outBlob && outUrl && (
          <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-lg bg-muted px-2.5 py-1">
                Before: {formatKb(srcSize)}
              </span>
              <span aria-hidden>→</span>
              <span className="rounded-lg bg-muted px-2.5 py-1">
                After: {formatKb(outBlob.size)}
              </span>
              {savings !== null && (
                <span
                  className={`rounded-lg px-2.5 py-1 font-medium ${
                    Number(savings) >= 0
                      ? "bg-success/10 text-success"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {Number(savings) >= 0
                    ? `${savings}% smaller`
                    : `${Math.abs(Number(savings))}% larger`}
                </span>
              )}
              <button
                type="button"
                onClick={download}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
            <img
              src={outUrl}
              alt="Image with metadata removed"
              className="max-h-60 mx-auto rounded-xl object-contain"
            />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}
