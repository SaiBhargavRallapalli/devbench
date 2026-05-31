"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { Download, RefreshCw, Image as ImageIcon, Trash2 } from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";
import { IMAGE_WORKER_LIMITS_HELP, rejectInputImageDimensions } from "@/lib/image-worker-limits";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml";

const FORMAT_LABELS: Record<OutputFormat, string> = {
  "image/png":  "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/svg+xml": "SVG",
};

const FORMAT_EXTS: Record<OutputFormat, string> = {
  "image/png":  "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function tracePresetForQuality(quality: number): string {
  if (quality >= 71) return "detailed";
  if (quality >= 41) return "default";
  return "posterized2";
}

const ACCEPTS =
  "image/png, image/jpeg, image/webp, image/bmp, image/gif, image/avif, image/tiff, image/svg+xml, image/heic, image/heif, .heic, .heif";

const HEIC_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

function isHeicFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "heic" || ext === "heif") return true;
  return HEIC_MIMES.has(file.type.toLowerCase());
}

function isSvgFile(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return file.type === "image/svg+xml" || ext === "svg";
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/") || isHeicFile(file) || isSvgFile(file);
}

function revokeUrl(url: string | null) {
  if (url) URL.revokeObjectURL(url);
}

async function decodeHeicToPng(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/png" });
  return Array.isArray(result) ? result[0] : result;
}

// Extract natural pixel dimensions from an SVG string (viewBox or width/height attrs)
function parseSvgDimensions(svgText: string): { w: number; h: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return { w: 800, h: 600 };

  const wAttr = svg.getAttribute("width");
  const hAttr = svg.getAttribute("height");
  const vb    = svg.getAttribute("viewBox");

  if (wAttr && hAttr) {
    const w = parseFloat(wAttr);
    const h = parseFloat(hAttr);
    if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) return { w, h };
  }
  if (vb) {
    const parts = vb.trim().split(/[\s,]+/).map(Number);
    if (parts.length >= 4 && parts[2] > 0 && parts[3] > 0) {
      return { w: parts[2], h: parts[3] };
    }
  }
  return { w: 800, h: 600 };
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

export default function ImageFormatConverterTool({ tool }: { tool: Tool }) {
  const [srcUrl, setSrcUrl]       = useState<string | null>(null);
  const [srcName, setSrcName]     = useState("");
  const [srcSize, setSrcSize]     = useState(0);
  const [srcType, setSrcType]     = useState("");
  const [svgDims, setSvgDims]     = useState<{ w: number; h: number } | null>(null);

  const [outUrl, setOutUrl]       = useState<string | null>(null);
  const [outSize, setOutSize]     = useState(0);
  const [outFormat, setOutFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality]     = useState(92);
  const [converting, setConverting] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [decodingHeic, setDecodingHeic] = useState(false);
  const [loadError, setLoadError]   = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);
  const [dims, setDims]           = useState<{ w: number; h: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const srcUrlRef = useRef<string | null>(null);
  const outUrlRef = useRef<string | null>(null);

  useEffect(() => { srcUrlRef.current = srcUrl; }, [srcUrl]);
  useEffect(() => { outUrlRef.current = outUrl; }, [outUrl]);

  useEffect(() => {
    return () => {
      revokeUrl(srcUrlRef.current);
      revokeUrl(outUrlRef.current);
    };
  }, []);

  const clearOutput = useCallback(() => {
    setOutUrl((prev) => {
      revokeUrl(prev);
      return null;
    });
    setOutSize(0);
    setConvertError(null);
  }, []);

  const clearAll = useCallback(() => {
    setSrcUrl((prev) => {
      revokeUrl(prev);
      return null;
    });
    clearOutput();
    setSrcName("");
    setSrcSize(0);
    setSrcType("");
    setSvgDims(null);
    setDims(null);
    setLoadError(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [clearOutput]);

  function applyDimensionCheck(w: number, h: number, url: string): boolean {
    const dimErr = rejectInputImageDimensions(w, h);
    if (dimErr) {
      revokeUrl(url);
      setSrcUrl(null);
      setLoadError(dimErr);
      return false;
    }
    setDims({ w, h });
    return true;
  }

  function probeRasterDimensions(url: string) {
    const probe = new Image();
    probe.onload = () => {
      if (!applyDimensionCheck(probe.naturalWidth, probe.naturalHeight, url)) return;
    };
    probe.onerror = () => {
      revokeUrl(url);
      setSrcUrl(null);
      setLoadError("Could not read this image.");
    };
    probe.src = url;
  }

  const loadFile = useCallback(async (file: File) => {
    if (!isImageFile(file)) return;

    setLoading(true);
    setLoadError(null);
    setConvertError(null);
    clearOutput();
    setDims(null);
    setSvgDims(null);
    setSrcName(file.name);
    setSrcSize(file.size);
    setSrcType(
      isHeicFile(file) ? "image/heic" : isSvgFile(file) ? "image/svg+xml" : file.type,
    );
    setSrcUrl((prev) => {
      revokeUrl(prev);
      return null;
    });

    const heic = isHeicFile(file);
    setDecodingHeic(heic);

    try {
      const displayBlob = heic ? await decodeHeicToPng(file) : file;
      const url = URL.createObjectURL(displayBlob);
      setSrcUrl(url);

      if (isSvgFile(file)) {
        setOutFormat((fmt) => (fmt === "image/svg+xml" ? "image/png" : fmt));
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const parsed = parseSvgDimensions(text);
          setSvgDims(parsed);
          applyDimensionCheck(parsed.w, parsed.h, url);
        };
        reader.onerror = () => {
          revokeUrl(url);
          setSrcUrl(null);
          setLoadError("Could not read this SVG file.");
        };
        reader.readAsText(file);
      } else {
        probeRasterDimensions(url);
      }
    } catch {
      setLoadError(
        heic
          ? "Could not read this HEIC file. It may be corrupted or use an unsupported codec."
          : "Could not read this image.",
      );
    } finally {
      setLoading(false);
      setDecodingHeic(false);
    }
  }, [clearOutput]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!isImageFile(file)) {
      setLoadError("Unsupported file type. Upload an image file.");
      return;
    }
    loadFile(file);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadFile(file);
  }

  function convert() {
    if (!srcUrl) return;
    setConverting(true);
    setConvertError(null);
    clearOutput();

    const img = new Image();
    img.onerror = () => {
      setConvertError("Could not decode the image for conversion.");
      setConverting(false);
    };
    img.onload = () => {
      const canvas = canvasRef.current!;
      // SVGs may report 0 natural dimensions — use parsed viewBox/width attrs instead
      const w = img.naturalWidth  || svgDims?.w || 800;
      const h = img.naturalHeight || svgDims?.h || 600;
      const dimErr = rejectInputImageDimensions(w, h);
      if (dimErr) {
        setConvertError(dimErr);
        setConverting(false);
        return;
      }

      canvas.width  = w;
      canvas.height = h;
      setDims({ w, h });

      const ctx = canvas.getContext("2d")!;

      if (outFormat === "image/svg+xml") {
        void (async () => {
          try {
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const ImageTracer = (await import("imagetracerjs")).default;
            const svg = ImageTracer.imagedataToSVG(
              ctx.getImageData(0, 0, w, h),
              tracePresetForQuality(quality),
            );
            const blob = new Blob([svg], { type: "image/svg+xml" });
            const url = URL.createObjectURL(blob);
            setOutUrl(url);
            setOutSize(blob.size);
          } catch {
            setConvertError("SVG tracing failed. Try a simpler image or lower trace detail.");
          } finally {
            setConverting(false);
          }
        })();
        return;
      }

      // Fill white background for JPEG (transparent → white), also good default for SVG source
      if (outFormat === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const q = outFormat === "image/png" ? undefined : quality / 100;
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setConvertError("Conversion failed. Try a different output format.");
            setConverting(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          setOutUrl(url);
          setOutSize(blob.size);
          setConverting(false);
        },
        outFormat,
        q,
      );
    };
    img.src = srcUrl;
  }

  function onFormatChange(fmt: OutputFormat) {
    setOutFormat(fmt);
    clearOutput();
  }

  const outputFormats = (Object.keys(FORMAT_LABELS) as OutputFormat[]).filter(
    (fmt) => !(srcType === "image/svg+xml" && fmt === "image/svg+xml"),
  );

  function download() {
    if (!outUrl) return;
    const a = document.createElement("a");
    const base = srcName.replace(/\.[^.]+$/, "");
    a.href = outUrl;
    a.download = `${base}.${FORMAT_EXTS[outFormat]}`;
    a.click();
    trackToolDownload("image-format-converter", FORMAT_EXTS[outFormat]);
  }

  const savings = outSize && srcSize ? ((1 - outSize / srcSize) * 100).toFixed(1) : null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ToolPageHero tool={tool} />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8 space-y-6">
        <p className="text-sm text-muted-foreground rounded-xl border border-border bg-muted/30 px-4 py-3">
          Converting many files at once? Use{" "}
          <Link href="/image" className="font-medium text-accent hover:underline">
            batch image convert on the Image tools hub
          </Link>
          .
        </p>

        {/* Upload zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-colors"
        >
          {loading ? (
            <>
              <RefreshCw className="mx-auto w-10 h-10 text-muted-foreground mb-3 animate-spin" />
              <p className="text-sm font-medium">{decodingHeic ? "Decoding HEIC…" : "Loading image…"}</p>
            </>
          ) : srcUrl ? (
            <img src={srcUrl} alt="Source" className="max-h-48 mx-auto rounded-xl object-contain" />
          ) : (
            <>
              <ImageIcon className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop an image or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">HEIC · SVG · PNG · JPEG · WebP · BMP · GIF · AVIF · TIFF</p>
              {loadError && (
                <p className="text-xs text-destructive mt-2">{loadError}</p>
              )}
            </>
          )}
          <input ref={inputRef} type="file" accept={ACCEPTS} className="hidden" onChange={onFileChange} />
        </div>

        {srcUrl && (
          <>
            {/* Source info */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="px-2.5 py-1 rounded-lg bg-muted font-mono">{srcName}</span>
              <span className="px-2.5 py-1 rounded-lg bg-muted">
                {(srcType.split("/")[1] ?? "unknown").toUpperCase()}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-muted">{formatBytes(srcSize)}</span>
              {dims && <span className="px-2.5 py-1 rounded-lg bg-muted">{dims.w} × {dims.h}px</span>}
              <button
                type="button"
                onClick={clearAll}
                className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>

            {/* Conversion controls */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-5">
              <div className="flex flex-wrap items-end gap-6">
                {/* Output format */}
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground font-medium">Output format</label>
                  <div className="flex gap-2 flex-wrap">
                    {outputFormats.map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => onFormatChange(fmt)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                          outFormat === fmt
                            ? "bg-accent text-accent-foreground border-accent"
                            : "bg-muted text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {FORMAT_LABELS[fmt]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality / trace detail — hidden for PNG output */}
                {outFormat !== "image/png" && (
                  <div className="space-y-1.5 flex-1 min-w-[200px]">
                    <label className="text-xs text-muted-foreground font-medium">
                      {outFormat === "image/svg+xml" ? "Trace detail" : "Quality"} — {quality}%
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                    {outFormat === "image/svg+xml" && (
                      <p className="text-xs text-muted-foreground">
                        Traces pixels into vector paths. Best for logos, icons, and flat graphics.
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={convert}
                  disabled={converting || !dims}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${converting ? "animate-spin" : ""}`} />
                  {converting ? "Converting…" : "Convert"}
                </button>
              </div>
              {convertError && (
                <p className="text-xs text-destructive">{convertError}</p>
              )}
              <p className="text-xs text-muted-foreground">{IMAGE_WORKER_LIMITS_HELP}</p>
            </div>

            {/* Result */}
            {outUrl && (
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="px-2.5 py-1 rounded-lg bg-muted">{FORMAT_LABELS[outFormat]}</span>
                    <span className="px-2.5 py-1 rounded-lg bg-muted">{formatBytes(outSize)}</span>
                    {savings !== null && (
                      <span className={`px-2.5 py-1 rounded-lg font-medium ${
                        Number(savings) > 0
                          ? "bg-success/10 text-success"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        {Number(savings) > 0 ? `${savings}% smaller` : `${Math.abs(Number(savings))}% larger`}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={download}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent/20 text-sm font-medium transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
                <img src={outUrl} alt="Converted" className="max-h-60 mx-auto rounded-xl object-contain" />
              </div>
            )}
          </>
        )}

        {/* Hidden canvas for conversion */}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
}
