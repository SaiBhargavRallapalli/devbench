import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import PdfToolsHub from "@/components/pdf/PdfToolsHub";
import PdfBatchPanel from "@/components/pdf/PdfBatchPanel";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/social-metadata";
import { socialMetadata } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const TITLE = "PDF Tools — Image to PDF, Page Editor";
const DESC =
  "Free PDF utilities in your browser: combine images into one PDF, remove or extract pages. No uploads to DevBench — processing stays on your device.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: ["PDF", "image to pdf", "merge images pdf", "pdf pages", "browser pdf"],
  alternates: { canonical: `${SITE_URL}/pdf` },
  ...socialMetadata({
    title: TITLE,
    description: DESC,
    canonicalPath: "/pdf",
  }),
};

export default function PdfWorkspacePage() {
  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([{ name: "PDF Tools", path: "/pdf" }])} />
      <main className="flex-1">
        <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground" aria-busy>Loading PDF tools…</div>}>
          <PdfToolsHub />
          <PdfBatchPanel />
        </Suspense>
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-4 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">
            Which PDF tool do I need?
          </h2>
          <p>
            PDF tasks usually fall into five buckets, and each has a dedicated tool in the grid
            above. <strong className="text-foreground">Combine or split:</strong> merge several
            files — or several images — into one PDF, or pull a page range back out with the
            split tool. <strong className="text-foreground">Fix orientation and order:</strong>{" "}
            rotate pages that scanned upside down, delete the pages you do not want, and drag
            the rest into the right sequence.{" "}
            <strong className="text-foreground">Shrink:</strong> compression reduces file size
            for upload limits on portals and email attachments without re-creating the document
            from scratch. <strong className="text-foreground">Convert:</strong> turn images into
            a PDF, export PDF pages back to JPG, or produce a PDF from HTML.{" "}
            <strong className="text-foreground">Mark and compare:</strong> add page numbers or
            a watermark for drafts and submissions, or diff two PDFs to see what changed
            between versions.
          </p>
          <p>
            Every tool here runs <strong className="text-foreground">entirely in your browser</strong>{" "}
            using pdf-lib and PDF.js — files are read with the File API, processed in memory,
            and written back to a download. Nothing is uploaded to DevBench servers, which is
            why the workspace is safe for contracts, ID scans, tax documents, and anything else
            you would not paste into a random website. There is no account, no watermarked
            output, and no file-count quota; practical limits are your device&apos;s memory,
            with documents under 20 MB processing near-instantly on a typical laptop. For
            repeat jobs, the batch panel queues multiple files through the same operation in
            one pass.
          </p>
        </section>
      </main>
    </>
  );
}
