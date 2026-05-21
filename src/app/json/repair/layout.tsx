import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";

const TITLE = "JSON Repair — Fix Broken JSON Online";
const DESC =
  "Auto-fix trailing commas, missing commas, truncated JSON, markdown fences, over-escaped quotes, and more. Runs in your browser.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/json/repair` },
  ...socialMetadata({
    title: TITLE,
    description: DESC,
    canonicalPath: "/json/repair",
    ogImageUrl: `${SITE_URL}/json/opengraph-image`,
    ogImageAlt: `${TITLE} | DevBench`,
  }),
};

export default function JsonRepairLayout({ children }: { children: React.ReactNode }) {
  return children;
}
