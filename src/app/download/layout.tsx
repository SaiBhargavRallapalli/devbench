import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

const title = "Download";
const description =
  "Install DevBench on macOS — download the signed DMG, use Homebrew (desktop app or CLI), or keep using the browser app.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}/download` },
  ...socialMetadata({ title, description, canonicalPath: "/download" }),
};

export default function DownloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={breadcrumbSchema([{ name: "Download", path: "/download" }])} />
      {children}
    </>
  );
}
