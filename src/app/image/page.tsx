import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import ImageToolsHub from "@/components/image/ImageToolsHub";
import ImageBatchPanel from "@/components/image/ImageBatchPanel";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/social-metadata";
import { socialMetadata } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const TITLE = "Image Tools — Resize, Compress, Convert";
const DESC =
  "Free image utilities in your browser: resize, compress, convert HEIC/SVG/PNG/JPEG/WebP, remove backgrounds, read EXIF. No uploads to DevBench.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  keywords: [
    "image tools",
    "image converter",
    "resize image",
    "compress image",
    "HEIC to JPG",
    "background remover",
    "browser image editor",
  ],
  alternates: { canonical: `${SITE_URL}/image` },
  ...socialMetadata({
    title: TITLE,
    description: DESC,
    canonicalPath: "/image",
  }),
};

export default function ImageWorkspacePage() {
  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([{ name: "Image Tools", path: "/image" }])} />
      <main className="flex-1">
        <Suspense
          fallback={
            <div
              className="mx-auto max-w-6xl px-4 py-24 text-center text-sm text-muted-foreground"
              aria-busy
            >
              Loading image tools…
            </div>
          }
        >
          <ImageToolsHub />
          <ImageBatchPanel />
        </Suspense>
      </main>
    </>
  );
}
