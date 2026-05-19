/**
 * Batch PDF operations — process multiple files sequentially in-browser.
 */
import { PDFDocument } from "pdf-lib";

export type PdfBatchItem = {
  name: string;
  bytes: Uint8Array;
};

export type PdfBatchProgress = {
  index: number;
  total: number;
  name: string;
  phase: "loading" | "processing" | "done" | "error";
  error?: string;
};

/** Merge many PDFs into one document. */
export async function batchMergePdfs(
  items: PdfBatchItem[],
  onProgress?: (p: PdfBatchProgress) => void,
): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.({ index: i, total: items.length, name: item.name, phase: "loading" });
    try {
      const src = await PDFDocument.load(item.bytes.slice(0));
      const pages = await merged.copyPages(src, src.getPageIndices());
      for (const p of pages) merged.addPage(p);
      onProgress?.({ index: i, total: items.length, name: item.name, phase: "done" });
    } catch (e) {
      onProgress?.({
        index: i,
        total: items.length,
        name: item.name,
        phase: "error",
        error: (e as Error).message,
      });
      throw e;
    }
  }
  onProgress?.({ index: items.length, total: items.length, name: "save", phase: "processing" });
  return merged.save();
}

/** Extract page count per file (batch inspect). */
export async function batchInspectPdfs(
  items: PdfBatchItem[],
  onProgress?: (p: PdfBatchProgress) => void,
): Promise<{ name: string; pages: number }[]> {
  const results: { name: string; pages: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    onProgress?.({ index: i, total: items.length, name: item.name, phase: "loading" });
    try {
      const doc = await PDFDocument.load(item.bytes.slice(0));
      results.push({ name: item.name, pages: doc.getPageCount() });
      onProgress?.({ index: i, total: items.length, name: item.name, phase: "done" });
    } catch (e) {
      onProgress?.({
        index: i,
        total: items.length,
        name: item.name,
        phase: "error",
        error: (e as Error).message,
      });
      throw e;
    }
  }
  return results;
}
