import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";

const TITLE = "JSONPath Query — Query JSON Documents";
const DESC =
  "Run JSONPath expressions against your JSON with live results. Copy matches, try examples, RFC 9535 syntax.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESC,
  alternates: { canonical: `${SITE_URL}/json/path` },
  ...socialMetadata({
    title: TITLE,
    description: DESC,
    canonicalPath: "/json/path",
    ogImageUrl: `${SITE_URL}/json/opengraph-image`,
    ogImageAlt: `${TITLE} | DevBench`,
  }),
};

export default function JsonPathLayout({ children }: { children: React.ReactNode }) {
  return children;
}
