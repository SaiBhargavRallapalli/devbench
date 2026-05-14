import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Text Diff Checker — Compare Two Texts Online";
const description =
  "Compare two texts side-by-side or unified. Find additions and deletions with line and character highlighting. Ignore whitespace, regex search — private, client-side diff tool.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "diff checker",
    "text compare",
    "compare text online",
    "text diff",
    "difference finder",
    "diffchecker alternative",
  ],
  alternates: { canonical: `${SITE_URL}/diff-checker` },
  ...socialMetadata({ title, description, canonicalPath: "/diff-checker" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Text Diff Checker",
  url: `${SITE_URL}/diff-checker`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Side-by-side and unified diff views",
      "Line-level and character-level change highlighting",
      "Ignore whitespace option",
      "Regex search within diff results",
      "Private — runs entirely in your browser",
      "Free — no account required",
    ],
  }),
};

const diffFaqs = TOOL_FAQS["diff-checker"] ?? [];
const faqSchema = diffFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: diffFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function DiffCheckerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Diff Checker", path: "/diff-checker" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="diff-checker" />
    </>
  );
}
