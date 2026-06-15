"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { Download, Camera, CameraOff, Copy, Check, Upload, X, ScanLine } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";
import ToolPageHero from "@/components/tools/ToolPageHero";

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

function GenerateTab() {
  const [text, setText] = useState("https://");
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    const t = text.trim();
    if (!t) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDataUrl(null);
      setErr("");
      return;
    }
    QRCode.toDataURL(t, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) {
          setDataUrl(url);
          setErr("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDataUrl(null);
          setErr("Could not generate QR for this input.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "qrcode.png";
    a.click();
    trackToolDownload("qr-code", "png");
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">Content (URL or text)</label>
        <textarea
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
      <div className="flex flex-wrap items-start gap-8">
        <div className="rounded-xl border border-border bg-white p-4 dark:bg-white">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="QR code" width={280} height={280} className="block" />
          ) : (
            <div className="flex h-[280px] w-[280px] items-center justify-center text-sm text-muted-foreground">
              Enter text to generate
            </div>
          )}
        </div>
        <div className="space-y-3">
          <button
            type="button"
            disabled={!dataUrl}
            onClick={download}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Download PNG
          </button>
          <p className="max-w-sm text-xs text-muted-foreground">
            Generated entirely in your browser. Large payloads may hit QR version limits.
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
    await navigator.clipboard.writeText(result).catch(() => {});
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
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
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
