"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Camera, CameraOff, Copy, Check, Upload, X, ScanLine, ImagePlus } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { copyWithFeedback } from "@/lib/clipboard";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "generate" | "scan";

// Augment window for BarcodeDetector (not yet in lib.dom.d.ts universally)
declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): {
        detect(source: ImageBitmapSource | HTMLCanvasElement): Promise<{ rawValue: string }[]>;
      };
      getSupportedFormats?(): Promise<string[]>;
    };
  }
}

// ─── Generate Tab ─────────────────────────────────────────────────────────────

type LogoPos = "tl" | "tc" | "tr" | "ml" | "mc" | "mr" | "bl" | "bc" | "br";

/** 3×3 position picker; col/row are fractions of the scannable inner area. */
const LOGO_POSITIONS: readonly { id: LogoPos; label: string; col: 0 | 0.5 | 1; row: 0 | 0.5 | 1 }[] = [
  { id: "tl", label: "Top left", col: 0, row: 0 },
  { id: "tc", label: "Top centre", col: 0.5, row: 0 },
  { id: "tr", label: "Top right", col: 1, row: 0 },
  { id: "ml", label: "Middle left", col: 0, row: 0.5 },
  { id: "mc", label: "Centre", col: 0.5, row: 0.5 },
  { id: "mr", label: "Middle right", col: 1, row: 0.5 },
  { id: "bl", label: "Bottom left", col: 0, row: 1 },
  { id: "bc", label: "Bottom centre", col: 0.5, row: 1 },
  { id: "br", label: "Bottom right", col: 1, row: 1 },
];

/** Preview/download edge target; actual canvas snaps to whole modules for crisp pixels. */
const QR_TARGET_PX = 1024;
/** Quiet zone in modules (spec minimum is 4). */
const QR_MARGIN = 4;
/** Modules kept clear at every edge so finder/timing/alignment patterns survive the logo. */
const QR_SAFE_EDGE = 8;

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("logo failed to load"));
    img.src = src;
  });
}

function GenerateTab() {
  const [text, setText] = useState("https://");
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoName, setLogoName] = useState("");
  const [logoPos, setLogoPos] = useState<LogoPos>("mc");
  const [logoSize, setLogoSize] = useState(20);
  const [shrunk, setShrunk] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw QR (and optional logo) straight onto the canvas so preview and PNG are identical.
  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const t = text.trim();
    if (!t) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(false);
      setErr("");
      return;
    }
    (async () => {
      try {
        const qr = QRCode.create(t, { errorCorrectionLevel: logoUrl ? "H" : "M" });
        const size = qr.modules.size;
        const data = qr.modules.data;
        const scale = Math.max(1, Math.floor(QR_TARGET_PX / (size + QR_MARGIN * 2)));
        const dim = scale * (size + QR_MARGIN * 2);
        canvas.width = dim;
        canvas.height = dim;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, dim, dim);
        ctx.fillStyle = "#000000";
        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            if (data[y * size + x]) {
              ctx.fillRect((x + QR_MARGIN) * scale, (y + QR_MARGIN) * scale, scale, scale);
            }
          }
        }
        let didShrink = false;
        if (logoUrl) {
          const img = await loadImage(logoUrl);
          if (cancelled) return;
          const pos = LOGO_POSITIONS.find((p) => p.id === logoPos) ?? LOGO_POSITIONS[4];
          // Desired logo box (image + white backing pad), clamped to the scannable area.
          let logoPx = Math.round((dim * logoSize) / 100);
          let pad = Math.max(4, Math.round(logoPx * 0.12));
          let box = logoPx + pad * 2;
          const safe = (size - QR_SAFE_EDGE * 2) * scale;
          if (box > safe) {
            const k = safe / box;
            logoPx = Math.max(1, Math.floor(logoPx * k));
            pad = Math.max(2, Math.floor(pad * k));
            box = logoPx + pad * 2;
            didShrink = true;
          }
          const safeOrigin = (QR_MARGIN + QR_SAFE_EDGE) * scale;
          const bx = Math.round(safeOrigin + pos.col * (safe - box));
          const by = Math.round(safeOrigin + pos.row * (safe - box));
          ctx.fillStyle = "#ffffff";
          roundRectPath(ctx, bx, by, box, box, Math.max(2, pad));
          ctx.fill();
          ctx.drawImage(img, bx + pad, by + pad, logoPx, logoPx);
        }
        if (cancelled) return;
        setShrunk(didShrink);
        setReady(true);
        setErr("");
      } catch {
        if (cancelled) return;
        setReady(false);
        setErr("Could not generate QR for this input.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [text, logoUrl, logoPos, logoSize]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "qrcode.png";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      trackToolDownload("qr-code", "png");
    }, "image/png");
  };

  const handleLogoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file for the logo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoUrl(String(reader.result));
      setLogoName(file.name);
      setErr("");
    };
    reader.onerror = () => setErr("Could not read the logo image.");
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoUrl(null);
    setLogoName("");
  };

  const sizeHint = shrunk
    ? "Shrunk to fit this code's scannable area — smaller codes can't host a big logo."
    : logoSize > 25
      ? "Big logos can hurt scannability — 20–25% is the safe zone."
      : "High (H) error correction keeps the code scannable with the logo.";

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="qr-code-tool-l77" className="mb-2 block text-sm font-medium">Content (URL or text)</label>
        <textarea id="qr-code-tool-l77"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-border bg-background px-3 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
          spellCheck={false}
        />
      </div>
      {err && (
        <p className="text-sm text-destructive" role="alert">
          {err}
        </p>
      )}

      {/* Logo overlay */}
      <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted">
            <ImagePlus className="h-4 w-4" />
            {logoUrl ? "Replace logo" : "Add logo"}
            <input type="file" accept="image/*" className="sr-only" onChange={handleLogoFile} />
          </label>
          {logoUrl && (
            <button
              type="button"
              onClick={clearLogo}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Remove logo
            </button>
          )}
          {logoName && (
            <span className="max-w-40 truncate text-xs text-muted-foreground" title={logoName}>
              {logoName}
            </span>
          )}
        </div>
        {!logoUrl && (
          <p className="text-xs text-muted-foreground">
            Optional — put your own logo inside the code. Error correction switches to high (H) so it still scans.
          </p>
        )}
        {logoUrl && (
          <div className="flex flex-wrap items-start gap-6">
            <div>
              <p id="qr-code-logo-pos" className="mb-2 block text-sm font-medium">
                Position
              </p>
              <div role="group" aria-labelledby="qr-code-logo-pos" className="grid grid-cols-3 gap-1.5">
                {LOGO_POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-label={p.label}
                    aria-pressed={logoPos === p.id}
                    title={p.label}
                    onClick={() => setLogoPos(p.id)}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                      logoPos === p.id
                        ? "border-accent bg-accent/15"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        logoPos === p.id ? "bg-accent" : "bg-muted-foreground/40"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="min-w-56 flex-1">
              <label htmlFor="qr-code-logo-size" className="mb-2 block text-sm font-medium">
                Logo size: <span className="text-accent">{logoSize}%</span>
              </label>
              <input
                id="qr-code-logo-size"
                type="range"
                min={10}
                max={30}
                step={1}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="w-full accent-accent"
              />
              <p
                className={`mt-1.5 text-xs ${
                  shrunk || logoSize > 25 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                }`}
              >
                {sizeHint}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-8">
        <div className="rounded-xl border border-border bg-white p-4 dark:bg-white">
          <div className="relative h-[280px] w-[280px]">
            <canvas
              ref={canvasRef}
              width={QR_TARGET_PX}
              height={QR_TARGET_PX}
              role="img"
              aria-label="QR code preview"
              className={`block h-[280px] w-[280px] ${ready ? "" : "hidden"}`}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
                Enter text to generate
              </div>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <button
            type="button"
            disabled={!ready}
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <p className="max-w-sm text-xs text-muted-foreground">
            {logoUrl
              ? "Generated entirely in your browser — logo composited onto a 1024px PNG."
              : "Generated entirely in your browser. Large payloads may hit QR version limits."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Scan Tab ─────────────────────────────────────────────────────────────────

function ScanTab() {
  const [result, setResult] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraErr, setCameraErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [support, setSupport] = useState<"yes" | "no" | "unknown">("unknown");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animRef = useRef<number | null>(null);

  // Check BarcodeDetector support on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupport(typeof window !== "undefined" && "BarcodeDetector" in window ? "yes" : "no");
  }, []);

  const stopCamera = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const decodeFromCanvas = useCallback(
    async (canvas: HTMLCanvasElement): Promise<string | null> => {
      if (support !== "yes") return null;
      try {
        const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });
        const results = await detector.detect(canvas);
        return results[0]?.rawValue ?? null;
      } catch {
        return null;
      }
    },
    [support]
  );

  const startCamera = useCallback(async () => {
    setCameraErr("");
    setResult(null);
    if (support === "no") {
      setCameraErr(
        "Live scanning requires the BarcodeDetector API (Chrome/Edge 83+). Try uploading a QR image instead."
      );
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
    } catch {
      setCameraErr(
        "Camera access denied. Please allow camera permission and try again."
      );
      return;
    }

    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
    }
    setScanning(true);

    const tick = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !streamRef.current) return;
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          const decoded = await decodeFromCanvas(canvas);
          if (decoded) {
            setResult(decoded);
            stopCamera();
            return;
          }
        }
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  }, [support, decodeFromCanvas, stopCamera]);

  const decodeFile = useCallback(
    async (file: File) => {
      setCameraErr("");
      setResult(null);
      const bmp = await createImageBitmap(file).catch(() => null);
      if (!bmp) {
        setCameraErr("Could not read the image file.");
        return;
      }

      if (support === "yes") {
        const canvas = document.createElement("canvas");
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(bmp, 0, 0);
        const decoded = await decodeFromCanvas(canvas);
        bmp.close();
        if (decoded) {
          setResult(decoded);
        } else {
          setCameraErr("No QR code found in the image.");
        }
      } else {
        bmp.close();
        setCameraErr(
          "Image scanning requires the BarcodeDetector API (Chrome/Edge 83+). Your browser is not supported."
        );
      }
    },
    [support, decodeFromCanvas]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) decodeFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) decodeFile(file);
  };

  const copyResult = async () => {
    if (!result) return;
    if (!(await copyWithFeedback(result))) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUrl = result && /^https?:\/\//i.test(result);

  return (
    <div className="space-y-5">
      {/* Browser support notice */}
      {support === "no" && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <strong>Limited support:</strong> QR scanning requires the BarcodeDetector API,
          available in Chrome and Edge 83+. Firefox and Safari are not yet supported.
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!scanning ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={support === "no"}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            <Camera className="w-4 h-4" />
            Use Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <CameraOff className="w-4 h-4" />
            Stop Camera
          </button>
        )}

        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
            dragOver
              ? "border-accent/60 bg-accent/10 text-accent"
              : "border-border bg-background hover:bg-muted"
          }`}
        >
          <Upload className="w-4 h-4" />
          Upload Image
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileInput}
          />
        </label>
      </div>

      {/* Camera view */}
      {scanning && (
        <div className="relative rounded-xl overflow-hidden border border-border bg-black aspect-video max-w-md">
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border-2 border-white/70 rounded-xl relative">
              <ScanLine className="absolute top-1/2 -translate-y-1/2 left-0 right-0 mx-auto w-full h-5 text-white/70 animate-pulse" />
            </div>
          </div>
          <p className="absolute bottom-3 left-0 right-0 text-center text-xs text-white/70">
            Point camera at a QR code
          </p>
        </div>
      )}

      {!scanning && <canvas ref={canvasRef} className="hidden" />}

      {/* Error */}
      {cameraErr && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          {cameraErr}
        </div>
      )}

      {/* Result */}
      {result && (
        <div key={result} className="animate-slide-up rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              QR Code Decoded
            </p>
            <button
              type="button"
              onClick={copyResult}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="font-mono text-sm break-all">{result}</p>
          {isUrl && (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              Open URL →
            </a>
          )}
        </div>
      )}

      {/* Drop zone hint */}
      {!scanning && !result && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
            dragOver
              ? "border-accent/60 bg-accent/5"
              : "border-border"
          }`}
        >
          <ScanLine className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Drag and drop a QR code image here, or use the buttons above.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Supports JPEG, PNG, WebP, and more.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function QrCodeTool({ tool }: { tool: Tool }) {
  const [tab, setTab] = useState<Tab>("generate");

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />
      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl bg-muted/50 p-1">
          {(["generate", "scan"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                tab === t
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "generate" ? "Generate QR" : "Scan QR"}
            </button>
          ))}
        </div>

        {tab === "generate" ? <GenerateTab /> : <ScanTab />}
      </div>
    </main>
  );
}
