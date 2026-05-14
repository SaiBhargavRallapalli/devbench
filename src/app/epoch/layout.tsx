import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Unix Timestamp Converter — Epoch to Date & Time";
const description =
  "Convert any Unix timestamp (seconds or milliseconds) to a human-readable date — paste 1715000000 and see it instantly. Live clock, timezone support, Year 2038 reference. No signup, browser-only.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "epoch converter",
    "unix timestamp converter",
    "timestamp to date",
    "unix time converter",
    "epoch time",
    "convert epoch",
    "seconds to date",
    "milliseconds to date",
    "unix epoch",
  ],
  alternates: { canonical: `${SITE_URL}/epoch` },
  ...socialMetadata({ title, description, canonicalPath: "/epoch" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Unix Timestamp Converter",
  url: `${SITE_URL}/epoch`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/epoch/opengraph-image`,
    featureList: [
      "Convert Unix timestamps (seconds or milliseconds) to human-readable dates",
      "Live clock showing current epoch and UTC time",
      "Timezone-aware date conversion",
      "Runs entirely in your browser — no data sent to a server",
    ],
  }),
};

const epochFaqs = TOOL_FAQS["epoch"] ?? [];
const faqSchema = epochFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: epochFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function EpochLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Epoch / Unix Time", path: "/epoch" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="epoch" />
    </>
  );
}
