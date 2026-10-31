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
import {
  joinPageTexts,
  looksLikeScannedPdf,
  parsePageRange,
  wordStats,
} from "@/lib/pdf-text";
import { copyWithFeedback } from "@/lib/clipboard";

const SLUG = "pdf-to-text";
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const SCAN_MESSAGE =
  "No text layer found — this PDF appears to be scanned, so there's nothing to extract.";
const OPEN_FALLBACK = "Couldn't read this PDF — it may be password-protected or damaged.";

function rawMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

export default function PdfToTextTool({ tool }: { tool: Tool }) {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("");
  const [output, setOutput] = useState("");
  const [pagesExtracted, setPagesExtracted] = useState(0);
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const runSeqRef = useRef(0);

  const onFile = useCallback(async (f: File | null) => {
    // Invalidate any in-flight extraction for the previous file.
    runSeqRef.current++;
    setError("");
    setScanned(false);
    setOutput("");
    setPagesExtracted(0);
    setPageCount(0);
    setFile(null);
    if (!f) return;
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      setError("Choose a PDF file.");
      return;
    }
    if (f.size > MAX_PDF_BYTES) {
      setError("That PDF is over 50 MB — try a smaller file.");
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
      setPageCount(pdf.numPages);
      setFile(f);
    } catch (e) {
      setError(friendlyError(e, OPEN_FALLBACK));
      trackToolError(SLUG, "open", rawMessage(e));
    }
  }, []);

  const extract = useCallback(
    async (rangeInput: string) => {
      const f = file;
      if (!f) return;
      const seq = ++runSeqRef.current;
      setBusy(true);
      setError("");
      setScanned(false);
      try {
        const pdfjs = await getPdfJsModule();
        const buf = await f.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
        if (seq !== runSeqRef.current) return;

        const pageNums = parsePageRange(rangeInput, pdf.numPages);
        if (!pageNums) {
          setError("That page range isn't valid — try something like 1-3,5.");
          trackToolError(SLUG, "extract", "invalid page range");
          return;
        }

        const texts: string[] = [];
        for (const p of pageNums) {
          const page = await pdf.getPage(p);
          const content = await page.getTextContent();
          let text = "";
          for (const item of content.items) {
            if ("str" in item) {
              text += item.str;
              if (item.hasEOL) text += "\n";
            }
          }
          texts.push(text);
        }
        if (seq !== runSeqRef.current) return;

        const joined = joinPageTexts(texts);
        const isScanned = looksLikeScannedPdf(texts);
        setOutput(joined);
        setPagesExtracted(pageNums.length);
        setScanned(isScanned);
        if (!isScanned) {
          trackToolSuccess(SLUG, "extract", {
            pages: pageNums.length,
            words: wordStats(joined).words,
          });
        }
      } catch (e) {
        if (seq !== runSeqRef.current) return;
        setError(friendlyError(e, OPEN_FALLBACK));
        trackToolError(SLUG, "extract", rawMessage(e));
      } finally {
        if (seq === runSeqRef.current) setBusy(false);
      }
    },
    [file],
  );

  // Re-extract (debounced) whenever the file loads or the page range changes.
  useEffect(() => {
    if (!file) return;
    const t = window.setTimeout(() => void extract(range), 450);
    return () => window.clearTimeout(t);
  }, [file, range, extract]);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) void onFile(f);
  }

  async function copy() {
    if (!output) return;
    // copyWithFeedback toasts the same failure message the old catch did,
    // and adds the execCommand fallback it lacked.
    if (await copyWithFeedback(output)) notify.success("Copied");
  }

  function download() {
    if (!output) return;
    const base = file?.name.replace(/\.pdf$/i, "") || "document";
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    downloadBlob(blob, `${base}-extracted.txt`, SLUG);
  }

  const stats = output ? wordStats(output) : null;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
      <ToolPageHero tool={tool} />

      <div className="animate-slide-up space-y-6 rounded-2xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Pulls the embedded text layer out of a PDF and gives it back as plain,
          copyable text. Everything runs in your browser — your PDF is never uploaded.
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
          aria-label="Upload PDF to extract text"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-accent/50 hover:bg-muted/30 transition-colors"
        >
          {busy && file ? (
            <>
              <Loader2 className="mx-auto w-10 h-10 text-muted-foreground mb-3 animate-spin" />
              <p className="text-sm font-medium">Extracting text…</p>
            </>
          ) : file ? (
            <p className="text-sm font-medium font-mono break-all">{file.name}</p>
          ) : (
            <>
              <FileUp className="mx-auto w-10 h-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drop a PDF or click to upload</p>
              <p className="text-xs text-muted-foreground mt-1">PDF · up to 50 MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
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

        {pageCount > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {pageCount} page{pageCount === 1 ? "" : "s"} detected.
            </p>

            <div className="flex flex-wrap items-end gap-4">
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
                Extract
              </button>
            </div>
          </>
        )}

        {scanned && (
          <p
            role="alert"
            className="rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
          >
            {SCAN_MESSAGE} Try an OCR (optical character recognition) tool to turn the
            scanned pages into selectable text.
          </p>
        )}

        {stats && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-lg bg-muted px-2.5 py-1">
                {pagesExtracted} page{pagesExtracted === 1 ? "" : "s"}
              </span>
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
