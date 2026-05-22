import type { ToolPageContent } from "./_types";

export const pageContentPdf: Record<string, ToolPageContent> = {
  "image-to-pdf": {
    title: "Image to PDF — JPG, PNG, WebP to One PDF (Free, Browser-Only)",
    metaDescription:
      "Merge images into a single A4 PDF: reorder pages, PNG/JPEG/WebP/GIF supported. Runs entirely in your browser — nothing uploaded to DevBench.",
    openingParagraph:
      "Image to PDF turns any sequence of photos or screenshots into one print-ready document. Drop files or pick them from disk, drag to reorder pages, and download a PDF where each image fits an A4 page with margins. Raster formats decode locally; large bitmaps are scaled so embedding stays reliable — ideal for scans, invoices, and boards.",
  },

  "merge-pdf": {
    title: "Merge PDF — Combine PDF Files Online Free",
    metaDescription:
      "Merge multiple PDF files into one online — drag to reorder, combine any number of PDFs. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Merge PDF combines any number of PDF files into a single document in the order you choose — drag files to reorder them before merging. Drop your PDFs, rearrange as needed, and download the merged file in seconds. All processing happens in your browser using pdf-lib — your files are never uploaded to a server. Free, no account needed.",
  },

  "split-pdf": {
    title: "Split PDF — Extract Pages Online Free",
    metaDescription:
      "Split a PDF into individual pages online — each page saved as a separate PDF in a ZIP. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Split PDF breaks a multi-page PDF into individual one-page PDF files, each packaged in a downloadable ZIP archive. Useful for extracting specific pages from contracts, reports, or scanned documents. All processing happens in your browser — your PDF is never sent to a server. Drop a PDF and download the split pages in seconds. Free, no account required.",
  },

  "organize-pdf": {
    title: "Organize PDF — Reorder Pages Online Free",
    metaDescription:
      "Reorder PDF pages online — drag pages to new positions, then download the reorganised PDF. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Organize PDF lets you drag and drop pages into any order and download the reorganised document. Load a PDF, see page thumbnails, drag to reorder, and export the new PDF. Useful for fixing scanned documents with out-of-order pages and reordering report sections. All processing runs in your browser with pdf-lib — nothing is ever uploaded.",
  },

  "rotate-pdf": {
    title: "Rotate PDF Pages — Fix Orientation Online Free",
    metaDescription:
      "Rotate all PDF pages by 90°, 180°, or 270° online. Fix portrait/landscape orientation on scanned PDFs. No upload, no signup, 100% client-side.",
    openingParagraph:
      "Rotate PDF corrects page orientation — rotate all pages by 90°, 180°, or 270° clockwise to fix scanned documents uploaded upside-down or sideways. The rotation is applied to PDF metadata, so text quality is preserved. Load a PDF, choose the rotation angle, and download the corrected file. Runs entirely in your browser — nothing is uploaded.",
  },

  "compress-pdf": {
    title: "Compress PDF — Reduce PDF File Size Online",
    metaDescription:
      "Reduce PDF file size online using object stream compression. Best for digital (non-scanned) PDFs. Shows before/after size. No upload, no signup, client-side.",
    openingParagraph:
      "Compress PDF reduces the file size of digital PDFs by applying PDF object stream compression — effective for PDFs with many objects, fonts, and embedded resources. Works best on digitally-created PDFs rather than scanned images. Shows before and after file size. All processing runs in your browser with pdf-lib — your PDF is never uploaded. Free, no account needed.",
  },

  "watermark-pdf": {
    title: "Watermark PDF — Add Text Watermark Online Free",
    metaDescription:
      "Add a diagonal text watermark to all PDF pages online. Adjustable text, font size, and opacity. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "Watermark PDF adds a diagonal text overlay across all pages — useful for marking drafts, confidential documents, and sample files. Enter the watermark text, adjust the font size and opacity, and download the watermarked PDF instantly. All processing happens in your browser using pdf-lib — your file is never uploaded to a server. Free, no account needed.",
  },

  "pdf-page-numbers": {
    title: "Add Page Numbers to PDF — Free Online Tool",
    metaDescription:
      "Add footer page numbers to a PDF online — centered, optional 'Page X of Y' format. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF Page Numbers stamps a page number at the bottom center of every page — choose between a simple number or the 'Page X of Y' format. Useful for reports, proposals, and academic papers that need consistent page references. All processing runs in your browser with pdf-lib — your file is never uploaded to a server. Free, no account needed.",
  },

  "pdf-page-editor": {
    title: "PDF Page Editor — Remove or Extract Pages Online",
    metaDescription:
      "Remove specific pages from a PDF or extract selected pages into a new PDF online. No upload, no signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF Page Editor lets you select individual pages to remove from a PDF or extract into a new document. Load a PDF, toggle which pages to keep or remove, and download the result. Useful for trimming cover pages, removing blank pages, and extracting specific sections from large reports. All processing happens in your browser using pdf-lib — nothing is ever uploaded.",
  },

  "text-to-pdf": {
    title: "Text to PDF — Convert Plain Text to PDF Online",
    metaDescription:
      "Convert plain text to a downloadable A4 PDF online — automatic line wrapping and page breaks. No upload, no signup, 100% in your browser.",
    openingParagraph:
      "Text to PDF converts plain text into a formatted A4 PDF with automatic line wrapping and page breaks. Paste any text — notes, logs, code output, or article content — and download a clean, printable PDF in one click. Useful when you need a PDF from clipboard content without opening a word processor. All processing happens in your browser. Free, no account needed.",
  },

  "html-to-pdf": {
    title: "HTML to PDF — Convert HTML via Browser Print",
    metaDescription:
      "Preview HTML in the browser and save as PDF using your browser's built-in print dialog. No server upload, no API key. No signup, 100% in your browser.",
    openingParagraph:
      "HTML to PDF renders any HTML document in a sandboxed preview and triggers the browser's native print-to-PDF dialog — using your browser's own rendering engine for the highest fidelity. No file is uploaded to a server. Paste HTML markup, preview the result, click Generate PDF, and save from the print dialog. Works with styled HTML including CSS.",
  },

  "ipynb-to-pdf": {
    title: "Jupyter Notebook to PDF — Convert .ipynb Online Free",
    metaDescription:
      "Convert Jupyter .ipynb notebooks to PDF online — markdown, code cells, outputs, and figures preserved. No server, no LaTeX. 100% in your browser. No signup.",
    openingParagraph:
      "Jupyter Notebook to PDF converts .ipynb files to printable PDFs entirely in your browser — no server, no nbconvert, no LaTeX required. Markdown cells render as formatted HTML, code cells display with styled source boxes and output, and base64-encoded PNG figures are preserved. Preview the HTML output before printing, then click Generate PDF to save via the browser's print dialog.",
  },

  "pdf-to-jpg": {
    title: "PDF to JPG — Export PDF Pages as Images Online",
    metaDescription:
      "Export each PDF page as a JPEG image online — adjustable quality and scale, all pages in a ZIP. No signup, 100% client-side in your browser.",
    openingParagraph:
      "PDF to JPG renders each page of a PDF as a JPEG image using PDF.js and packages all images in a downloadable ZIP archive. Adjust output quality and scale factor before downloading. Useful for creating thumbnails, sharing PDF content as images, and extracting pages for presentations. All processing runs in your browser — your PDF is never uploaded.",
  },

  "pdf-compare": {
    title: "Compare PDF Files — PDF Text Diff Online",
    metaDescription:
      "Compare two PDF files online — extracts text and shows a unified diff of differences. Best for digital (non-scanned) PDFs. No upload, no signup, client-side.",
    openingParagraph:
      "PDF Compare extracts text from two PDF files and shows a colour-coded unified diff highlighting additions and deletions. Most useful for comparing contracts, policy documents, and reports that are digitally created rather than scanned. Drag in two PDFs and see the changes in seconds. All extraction and diffing happens in your browser — no files are uploaded.",
  },
};
