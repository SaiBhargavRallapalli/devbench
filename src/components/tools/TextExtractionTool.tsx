"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Copy, Download, FileUp, Loader2, Play } from "lucide-react";
import type { Tool } from "@/lib/tools-registry";
import ToolPageHero from "@/components/tools/ToolPageHero";
import { downloadBlob } from "@/lib/pdf-download";
import { getPdfJsModule } from "@/lib/pdfjs-app";
import { friendlyError } from "@/lib/friendly-error";
import { notify } from "@/lib/notify";
import { trackToolError, trackToolSuccess } from "@/lib/analytics-events";
import { joinPageTexts, parsePageRange, wordStats } from "@/lib/pdf-text";
import { copyWithFeedback } from "@/lib/clipboard";

const SLUG = "image-to-text";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 25 * 1024 * 1024;
const MAX_OCR_PAGES = 20;

// tesseract.js is loaded from jsDelivr at runtime (already allowlisted in the
// site's CSP for scripts, workers and connections) so the OCR engine and its
// language packs ship on demand instead of in the bundle. Same pattern the
// video converter uses for ffmpeg.
const TESSERACT_SRC = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
const TESSERACT_OPTIONS = {
  workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/worker.min.js",
  corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.0",
  langPath: "https://cdn.jsdelivr.net/gh/naptha/tessdata@gh-pages/4.0.0",
} as const;

const LANGUAGES: ReadonlyArray<{ code: string; label: string }> = [
  { code: "eng", label: "English" },
  { code: "hin", label: "Hindi" },
  { code: "tel", label: "Telugu" },
  { code: "tam", label: "Tamil" },
  { code: "spa", label: "Spanish" },
  { code: "fra", label: "French" },
  { code: "deu", label: "German" },
  { code: "por", label: "Portuguese" },
  { code: "ita", label: "Italian" },
  { code: "rus", label: "Russian" },
  { code: "ara", label: "Arabic" },
  { code: "jpn", label: "Japanese" },
  { code: "kor", label: "Korean" },
  { code: "chi_sim", label: "Chinese (Simplified)" },
];

// Minimal typings for the UMD global — avoids adding an npm dependency.
interface TesseractLoggerMessage {
  status: string;
  progress: number;
}

interface TesseractWorker {
  recognize(input: HTMLCanvasElement): Promise<{ data: { text: string } }>;
  terminate(): Promise<void>;
}

interface TesseractGlobal {
  createWorker(
    langs?: string,
    oem?: number,
    options?: Partial<{
      logger: (m: TesseractLoggerMessage) => void;
      workerPath: string;
      corePath: string;
      langPath: string;
    }>,
  ): Promise<TesseractWorker>;
}

declare global {
  interface Window {
    Tesseract?: TesseractGlobal;
  }
}

let tesseractLoader: Promise<TesseractGlobal> | null = null;

function loadTesseract(): Promise<TesseractGlobal> {
  if (window.Tesseract) return Promise.resolve(window.Tesseract);
  if (tesseractLoader) return tesseractLoader;
  tesseractLoader = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = TESSERACT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.Tesseract) {
        resolve(window.Tesseract);
      } else {
        tesseractLoader = null;
        reject(new Error("OCR engine loaded but did not initialize"));
      }
    };
    script.onerror = () => {
      tesseractLoader = null;
      reject(new Error("Couldn't download the OCR engine — check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return tesseractLoader;
}

function rawMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

const OPEN_FALLBACK = "Couldn't read that file — it may be damaged or in an unsupported format.";
const OCR_FALLBACK = "Text recognition failed — try a sharper image or fewer pages.";
const EMPTY_MESSAGE =
  "No readable text found. Try a sharper, higher-contrast image, or check that the right languages are selected.";

type Source =
  | { kind: "image"; file: File; previewUrl: string }
  | { kind: "pdf"; file: File; pageCount: number };

function isPdf(f: File): boolean {
  return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf");
}

function isImage(f: File): boolean {
  return (
    f.type.startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(f.name)
  );
}

/** Draw an image file onto a canvas, scaling small scans up and huge photos down. */
async function imageFileToCanvas(file: File): Promise<HTMLCanvasElement> {
  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    // Fallback for browsers without createImageBitmap on this format.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () => reject(new Error("image decode failed"));
        el.src = url;
      });
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const ctx = c.getContext("2d");
      if (!ctx) throw new Error("canvas unavailable");
      ctx.drawImage(img, 0, 0);
      return c;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const longest = Math.max(bitmap.width, bitmap.height);
  // OCR likes ~300 DPI text: nudge small images up, cap huge ones for memory.
  let scale = 1;
  if (longest < 1600) scale = Math.min(2.5, 1600 / Math.max(1, longest));
  else if (longest > 4000) scale = 4000 / longest;

  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(bitmap.width * scale));
  c.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  return c;
}

export default function TextExtractionTool({ tool }: { tool: Tool }) {
  const [source, setSource] = useState<Source | null>(null);
  const [langs, setLangs] = useState<string[]>(["eng"]);
  const [range, setRange] = useState("");
  const [output, setOutput] = useState("");
  const [pagesExtracted, setPagesExtracted] = useState(0);
  const [empty, setEmpty] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ label: string; ratio: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const runSeqRef = useRef(0);

  const onFile = useCallback(async (f: File | null) => {
    // Invalidate any in-flight extraction for the previous file.
    runSeqRef.current++;
    setError("");
    setEmpty(false);
    setOutput("");
    setPagesExtracted(0);
    setProgress(null);
    setBusy(false);
    setSource((prev) => {
      if (prev?.kind === "image") URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    if (!f) return;

    if (isPdf(f)) {
      if (f.size > MAX_PDF_BYTES) {
        setError("That PDF is over 25 MB — try a smaller file for OCR.");
        return;
      }
      try {
        const pdfjs = await getPdfJsModule();
        const buf = await f.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
        if (pdf.numPages < 1) {
          setError("This PDF has no pages.");
          return;
        }
        setSource({ kind: "pdf", file: f, pageCount: pdf.numPages });
      } catch (e) {
        setError(friendlyError(e, OPEN_FALLBACK));
        trackToolError(SLUG, "open", rawMessage(e));
      }
      return;
    }

    if (isImage(f)) {
      if (f.size > MAX_IMAGE_BYTES) {
        setError("That image is over 15 MB — try a smaller file.");
        return;
      }
      setSource({ kind: "image", file: f, previewUrl: URL.createObjectURL(f) });
      return;
    }

    setError("Choose an image (PNG, JPG, WebP…) or a scanned PDF.");
  }, []);

  // Revoke the preview URL when the component unmounts.
  useEffect(
    () => () => {
      setSource((prev) => {
        if (prev?.kind === "image") URL.revokeObjectURL(prev.previewUrl);
        return prev;
      });
    },
    [],
  );

  const toggleLang = useCallback((code: string) => {
    setLangs((prev) => {
      if (prev.includes(code)) {
        // Keep at least one language selected.
        return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
      }
      return [...prev, code];
    });
  }, []);

  const extract = useCallback(
    async (rangeInput: string) => {
      const src = source;
      if (!src) return;
      if (langs.length === 0) {
        setError("Pick at least one language.");
        return;
      }
      const seq = ++runSeqRef.current;
      setBusy(true);
      setError("");
      setEmpty(false);
      setOutput("");
      setPagesExtracted(0);

      let worker: TesseractWorker | null = null;
      try {
        const Tesseract = await loadTesseract();
        if (seq !== runSeqRef.current) return;

        worker = await Tesseract.createWorker(langs.join("+"), undefined, {
          ...TESSERACT_OPTIONS,
          logger: (m) => {
            if (seq !== runSeqRef.current) return;
            if (m.status === "recognizing text") {
              setProgress((prev) => ({
                label: prev?.label ?? "Recognizing text…",
                ratio: m.progress,
              }));
            } else {
              setProgress({ label: "Loading OCR engine…", ratio: 0 });
            }
          },
        });
        if (seq !== runSeqRef.current) return;

        const texts: string[] = [];
        if (src.kind === "image") {
          setProgress({ label: "Recognizing text…", ratio: 0 });
          const canvas = await imageFileToCanvas(src.file);
          if (seq !== runSeqRef.current) return;
          const result = await worker.recognize(canvas);
          if (seq !== runSeqRef.current) return;
          texts.push(result.data.text);
          setPagesExtracted(1);
        } else {
          const pdfjs = await getPdfJsModule();
          const buf = await src.file.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
          if (seq !== runSeqRef.current) return;

          const pageNums = parsePageRange(rangeInput, pdf.numPages);
          if (!pageNums) {
            setError("That page range isn't valid — try something like 1-3,5.");
            trackToolError(SLUG, "extract", "invalid page range");
            return;
          }
          if (pageNums.length > MAX_OCR_PAGES) {
            setError(`OCR is limited to ${MAX_OCR_PAGES} pages per run — narrow the page range.`);
            trackToolError(SLUG, "extract", "page cap exceeded");
            return;
          }

          for (let i = 0; i < pageNums.length; i++) {
            const page = await pdf.getPage(pageNums[i]);
            // ~2x scale ≈ 144 DPI render — a good trade-off for OCR accuracy.
            const viewport = page.getViewport({ scale: 2 });
            const canvas = document.createElement("canvas");
            canvas.width = Math.ceil(viewport.width);
            canvas.height = Math.ceil(viewport.height);
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("canvas unavailable");
            await page.render({ canvas, canvasContext: ctx, viewport }).promise;
            if (seq !== runSeqRef.current) return;

            const base = i / pageNums.length;
            const slice = 1 / pageNums.length;
            setProgress({
              label: `Recognizing page ${i + 1} of ${pageNums.length}…`,
              ratio: base,
            });
            const result = await worker.recognize(canvas);
            if (seq !== runSeqRef.current) return;
            texts.push(result.data.text);
            setProgress({
              label: `Recognizing page ${i + 1} of ${pageNums.length}…`,
              ratio: base + slice,
            });
          }
          setPagesExtracted(pageNums.length);
        }

        const joined = src.kind === "pdf" ? joinPageTexts(texts) : texts[0].replace(/\s+$/u, "");
        setOutput(joined);
        setProgress(null);
        const isEmpty = joined.trim().length === 0;
        setEmpty(isEmpty);
        if (!isEmpty) {
          trackToolSuccess(SLUG, "extract", {
            kind: src.kind,
            langs: langs.length,
            words: wordStats(joined).words,
          });
        }
      } catch (e) {
        if (seq !== runSeqRef.current) return;
        setError(friendlyError(e, OCR_FALLBACK));
        trackToolError(SLUG, "extract", rawMessage(e));
      } finally {
        if (worker) void worker.terminate().catch(() => undefined);
        if (seq === runSeqRef.current) {
          setBusy(false);
          setProgress(null);
        }
      }
    },
    [source, langs],
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) void onFile(f);
  }

  async function copy() {
    if (!output) return;
    if (await copyWithFeedback(output)) notify.success("Copied");
  }

  function download() {
    if (!output) return;
    const base =
      source?.file.name.replace(/\.(pdf|png|jpe?g|webp|gif|bmp|avif)$/i, "") || "document";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${base}-ocr.txt`, SLUG);
  }

  const stats = output ? wordStats(output) : null;
  const ratio = progress ? Math.max(0, Math.min(1, progress.ratio)) : 0;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Reads text out of photos, screenshots and scanned PDFs with optical character
          recognition (OCR). Everything runs in your browser — your file is never uploaded.
          The first run downloads the OCR engine and language data, which can take a moment.
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
          aria-label="Upload an image or scanned PDF to extract text"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-colors"
        >
          {busy && source ? (
            <>
              <Loader2 className="mx-auto w-10 h-10 text-muted-foreground mb-3 animate-spin" />
              <p className="text-sm font-medium">Extracting text…</p>
            </>
          ) : source ? (
            <p className="text-sm font-medium font-mono break-all">{source.file.name}</p>
          ) : (
            <>
              <FileUp className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop an image or scanned PDF, or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG · JPG · WebP · GIF · BMP up to 15 MB · scanned PDF up to 25 MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
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

        {source && (
          <>
            {source.kind === "image" && (
              <div className="flex justify-center rounded-xl border border-border bg-muted/30 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img
                  src={source.previewUrl}
                  alt="Preview of the uploaded image"
                  className="max-h-56 rounded-lg object-contain"
                />
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Text language(s)</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((l) => {
                  const active = langs.includes(l.code);
                  return (
                    <button
                      key={l.code}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleLang(l.code)}
                      className={
                        active
                          ? "rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                          : "rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted"
                      }
                    >
                      {l.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Pick every language that appears in the file — mixed-language pages work best with
                all of them selected.
              </p>
            </div>

            {source.kind === "pdf" && (
              <p className="text-sm text-muted-foreground">
                {source.pageCount} page{source.pageCount === 1 ? "" : "s"} detected. OCR renders
                each page as an image, so it works on scans with no text layer.
              </p>
            )}

            <div className="flex flex-wrap items-end gap-4">
              {source.kind === "pdf" && (
                <label className="block space-y-1.5 text-sm">
                  <span className="font-medium">Pages to extract</span>
                  <input
                    type="text"
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    placeholder="e.g. 1-3,5 — leave empty for all pages"
                    className="block w-full max-w-xs rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>
              )}
              <button
                type="button"
                onClick={() => void extract(range)}
                disabled={busy}
                aria-busy={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-40"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Extract text
              </button>
            </div>

            {busy && progress && (
              <div className="space-y-1.5" role="status" aria-live="polite">
                <p className="text-xs text-muted-foreground">{progress.label}</p>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-accent transition-[width] duration-300"
                    style={{ width: `${Math.round(ratio * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {empty && (
          <p
            role="alert"
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            {EMPTY_MESSAGE}
          </p>
        )}

        {stats && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {source?.kind === "pdf" && (
                <span className="rounded-lg bg-muted px-2.5 py-1">
                  {pagesExtracted} page{pagesExtracted === 1 ? "" : "s"}
                </span>
              )}
              <span className="rounded-lg bg-muted px-2.5 py-1">
                {stats.words.toLocaleString()} words
              </span>
              <span className="rounded-lg bg-muted px-2.5 py-1">
                {stats.chars.toLocaleString()} chars
              </span>
              <div className="ml-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => void copy()}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-40"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
                <button
                  type="button"
                  onClick={download}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 disabled:opacity-40"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download .txt
                </button>
              </div>
            </div>
            <pre
              role="status"
              aria-live="polite"
              className="max-h-96 min-h-24 overflow-auto rounded-xl border border-border bg-muted/30 p-4 text-xs font-mono whitespace-pre-wrap break-words"
            >
              {output || "—"}
            </pre>
          </div>
        )}
      </div>
    </main>
  );
}
