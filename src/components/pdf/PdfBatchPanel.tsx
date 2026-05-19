"use client";

import { useState, useRef } from "react";
import { FileStack, Loader2, Download } from "lucide-react";
import { batchMergePdfs, batchInspectPdfs, type PdfBatchItem } from "@/lib/pdf-batch";

export default function PdfBatchPanel() {
  const [items, setItems] = useState<PdfBatchItem[]>([]);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const next: PdfBatchItem[] = [];
    for (const f of Array.from(files)) {
      if (f.type !== "application/pdf") continue;
      const buf = new Uint8Array(await f.arrayBuffer());
      next.push({ name: f.name, bytes: buf });
    }
    setItems((prev) => [...prev, ...next]);
  }

  async function mergeAll() {
    if (items.length < 2) {
      setStatus("Add at least two PDF files to merge.");
      return;
    }
    setBusy(true);
    setStatus("Merging…");
    try {
      const out = await batchMergePdfs(items, (p) => {
        setStatus(`${p.phase}: ${p.name} (${p.index + 1}/${p.total})`);
      });
      const blob = new Blob([new Uint8Array(out)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "merged.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      setStatus("Merged and downloaded.");
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function inspectAll() {
    if (!items.length) return;
    setBusy(true);
    try {
      const info = await batchInspectPdfs(items);
      setStatus(info.map((i) => `${i.name}: ${i.pages} pages`).join(" · "));
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 border-t border-border">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <FileStack className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold">Batch PDF tools</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Merge multiple PDFs or inspect page counts — all processing stays in your browser.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
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
            Add PDFs
          </button>
          <button
            type="button"
            disabled={busy || items.length < 2}
            onClick={() => void mergeAll()}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Merge & download
          </button>
          <button
            type="button"
            disabled={busy || !items.length}
            onClick={() => void inspectAll()}
            className="rounded-lg border border-border px-3 py-2 text-xs hover:bg-muted disabled:opacity-50"
          >
            Inspect page counts
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
              <li key={i.name}>{i.name}</li>
            ))}
          </ul>
        )}
        {status && <p className="text-xs text-muted-foreground">{status}</p>}
      </div>
    </section>
  );
}
