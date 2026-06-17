"use client";

import { useState, useRef, useCallback } from "react";
import {
  Upload, Download, Film, ImageIcon, X, Loader2, AlertCircle, Play,
} from "lucide-react";
import ToolPageHero from "@/components/tools/ToolPageHero";
import type { Tool } from "@/lib/tools-registry";
import { trackToolDownload } from "@/lib/analytics-events";

type Tab      = "convert" | "gif";
type OutFmt   = "mp4" | "webm";
type Phase    = "idle" | "loading" | "processing" | "done" | "error";

const CORE_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm";

const VIDEO_ACCEPT =
  "video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.webm,.mov,.avi,.mkv,.mts,.m2ts";

const GIF_WIDTHS = [240, 320, 480, 640] as const;
type GifWidth = typeof GIF_WIDTHS[number];

function fileExt(f: File): string {
  return f.name.split(".").pop()?.toLowerCase() ?? "mp4";
}

function outputName(f: File, ext: string): string {
  return `${f.name.replace(/\.[^.]+$/, "")}.${ext}`;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function VideoConverterTool({ tool }: { tool: Tool }) {
  const [tab, setTab]           = useState<Tab>(tool.slug === "gif-maker" ? "gif" : "convert");
  const [file, setFile]         = useState<File | null>(null);
  const [outFmt, setOutFmt]     = useState<OutFmt>("mp4");
  const [crf, setCrf]           = useState(23);
  const [gifFps, setGifFps]     = useState(10);
  const [gifWidth, setGifWidth] = useState<GifWidth>(480);
  const [gifStart, setGifStart] = useState("0");
  const [gifDur, setGifDur]     = useState("5");
  const [phase, setPhase]       = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outName, setOutName]   = useState("");
  const [error, setError]       = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ffmpegRef = useRef<any>(null);
  const previewUrlRef = useRef<string | null>(null);

  function revokeAll() {
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    if (outputUrl) URL.revokeObjectURL(outputUrl);
  }

  const selectFile = useCallback((f: File) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = URL.createObjectURL(f);
    setFile(f);
    setOutputUrl(null);
    setError(null);
    setPhase("idle");
    setProgress(0);
    setStatusMsg("");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) selectFile(f);
  }, [selectFile]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) selectFile(f);
    e.target.value = "";
  }, [selectFile]);

  function reset() {
    revokeAll();
    setFile(null);
    setOutputUrl(null);
    setError(null);
    setPhase("idle");
    setProgress(0);
    setStatusMsg("");
  }

  function switchTab(t: Tab) {
    reset();
    setTab(t);
  }

  async function loadFFmpeg() {
    if (ffmpegRef.current?.loaded) return ffmpegRef.current;
    const { FFmpeg } = await import("@ffmpeg/ffmpeg");
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }: { progress: number }) => {
      setProgress(Math.round(p * 100));
    });
    setStatusMsg("Downloading FFmpeg engine (~25 MB, cached after first use)…");
    await ffmpeg.load({ coreURL: CORE_URL, wasmURL: WASM_URL });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  async function handleConvert() {
    if (!file) return;
    setPhase("loading");
    setProgress(0);
    setError(null);
    setOutputUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      const { fetchFile } = await import("@ffmpeg/util");

      const inputExt  = fileExt(file);
      const inputFile = `input.${inputExt}`;

      setStatusMsg("Reading file…");
      setPhase("processing");
      setProgress(0);
      await ffmpeg.writeFile(inputFile, await fetchFile(file));

      if (tab === "convert") {
        const ext    = outFmt;
        const output = `output.${ext}`;
        setStatusMsg(`Converting to ${ext.toUpperCase()}…`);

        const args = outFmt === "mp4"
          ? ["-i", inputFile, "-c:v", "libx264", "-crf", String(crf), "-preset", "fast",
             "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", output]
          : ["-i", inputFile, "-c:v", "libvpx-vp9", "-crf", String(crf), "-b:v", "0",
             "-c:a", "libopus", "-b:a", "128k", output];

        await ffmpeg.exec(args);

        const data = await ffmpeg.readFile(output) as Uint8Array;
        const mime = outFmt === "mp4" ? "video/mp4" : "video/webm";
        const url  = URL.createObjectURL(new Blob([data.buffer as ArrayBuffer], { type: mime }));
        setOutputUrl(url);
        setOutName(outputName(file, ext));
        await ffmpeg.deleteFile(inputFile).catch(() => {});
        await ffmpeg.deleteFile(output).catch(() => {});

      } else {
        const palette = "palette.png";
        const output  = "output.gif";
        const ss      = gifStart;
        const t       = gifDur;
        const vf      = `fps=${gifFps},scale=${gifWidth}:-1:flags=lanczos`;

        setStatusMsg("Generating palette…");
        setProgress(0);
        await ffmpeg.exec([
          "-i", inputFile, "-ss", ss, "-t", t,
          "-vf", `${vf},palettegen=stats_mode=diff`, "-y", palette,
        ]);

        setStatusMsg("Rendering GIF…");
        setProgress(50);
        await ffmpeg.exec([
          "-i", inputFile, "-i", palette, "-ss", ss, "-t", t,
          "-lavfi", `${vf}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5`,
          "-y", output,
        ]);

        const data = await ffmpeg.readFile(output) as Uint8Array;
        const url  = URL.createObjectURL(new Blob([data.buffer as ArrayBuffer], { type: "image/gif" }));
        setOutputUrl(url);
        setOutName(outputName(file, "gif"));
        await ffmpeg.deleteFile(inputFile).catch(() => {});
        await ffmpeg.deleteFile(palette).catch(() => {});
        await ffmpeg.deleteFile(output).catch(() => {});
      }

      setPhase("done");
      setProgress(100);
      setStatusMsg("Done!");

    } catch (err) {
      setPhase("error");
      setError(err instanceof Error ? err.message : "Conversion failed. Check the file format and try again.");
    }
  }

  function handleDownload() {
    if (!outputUrl || !outName) return;
    const a = document.createElement("a");
    a.href     = outputUrl;
    a.download = outName;
    a.click();
    trackToolDownload(tool.slug, outName.split(".").pop() ?? "");
  }

  const busy = phase === "loading" || phase === "processing";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      {/* Tab switcher */}
      <div className="mb-6 flex gap-1 rounded-xl bg-muted/50 p-1 text-sm">
        {(["convert", "gif"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "convert" ? <Film className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
            {t === "convert" ? "Video Converter" : "GIF Maker"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card">
        {!file ? (
          /* ── Drop zone ─────────────────────────────────────────── */
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center gap-4 p-10 text-center"
          >
            <div className="rounded-full bg-muted p-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Drop a video file here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tab === "convert"
                  ? "MP4, WebM, MOV, AVI, MKV supported"
                  : "MP4, WebM, MOV — clips under 30 s work best for GIFs"}
              </p>
            </div>
            <label className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted">
              Browse file
              <input type="file" accept={VIDEO_ACCEPT} className="sr-only" onChange={handleInput} />
            </label>
          </div>
        ) : (
          /* ── Settings + actions ────────────────────────────────── */
          <div className="p-6">

            {/* File info bar */}
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
              <Film className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{fmtSize(file.size)}</p>
              </div>
              <button
                onClick={reset}
                disabled={busy}
                aria-label="Remove file"
                className="rounded-md p-1 transition-colors hover:bg-muted disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── Convert settings ── */}
            {tab === "convert" && (
              <div className="mb-6 space-y-5">
                <div>
                  <p className="mb-2 text-sm font-medium">Output format</p>
                  <div className="flex gap-2">
                    {(["mp4", "webm"] as OutFmt[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setOutFmt(fmt)}
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          outFmt === fmt
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {fmt === "mp4" ? "MP4 (H.264)" : "WebM (VP9)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Quality</span>
                    <span className="text-muted-foreground">
                      {crf <= 20 ? "High" : crf <= 28 ? "Medium" : "Low"} (CRF {crf})
                    </span>
                  </div>
                  <input
                    type="range" min={18} max={35} value={crf}
                    onChange={(e) => setCrf(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Best quality (larger file)</span>
                    <span>Smaller file</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── GIF settings ── */}
            {tab === "gif" && (
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="gif-start" className="mb-2 block text-sm font-medium">
                    Start time (seconds)
                  </label>
                  <input
                    id="gif-start"
                    type="number" min={0} step={0.5} value={gifStart}
                    onChange={(e) => setGifStart(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="gif-dur" className="mb-2 block text-sm font-medium">
                    Duration (seconds, max 30)
                  </label>
                  <input
                    id="gif-dur"
                    type="number" min={1} max={30} step={0.5} value={gifDur}
                    onChange={(e) => setGifDur(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Frame rate (FPS)</p>
                  <div className="flex gap-1">
                    {[5, 10, 15, 20].map((fps) => (
                      <button
                        key={fps}
                        onClick={() => setGifFps(fps)}
                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                          gifFps === fps
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {fps}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium">Width (px)</p>
                  <div className="flex gap-1">
                    {GIF_WIDTHS.map((w) => (
                      <button
                        key={w}
                        onClick={() => setGifWidth(w)}
                        className={`flex-1 rounded-lg border py-2 text-sm font-medium transition-colors ${
                          gifWidth === w
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background hover:bg-muted"
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {busy && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{statusMsg}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 flex gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* GIF preview */}
            {phase === "done" && outputUrl && tab === "gif" && (
              <div className="mb-6">
                <p className="mb-2 text-sm font-medium">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={outputUrl}
                  alt="GIF preview"
                  className="max-h-64 rounded-lg border border-border"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              {phase !== "done" ? (
                <button
                  onClick={handleConvert}
                  disabled={busy}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {busy ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                  ) : (
                    <><Play className="h-4 w-4" /> {tab === "convert" ? "Convert" : "Make GIF"}</>
                  )}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Download className="h-4 w-4" /> Download {outName}
                  </button>
                  <button
                    onClick={() => { setPhase("idle"); setOutputUrl(null); }}
                    className="rounded-xl border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-muted"
                  >
                    Convert another
                  </button>
                </>
              )}
            </div>

          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        All processing runs in your browser — no files are uploaded to any server.
        The FFmpeg engine (~25 MB) is downloaded once and cached by your browser.
      </p>
    </main>
  );
}
