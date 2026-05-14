import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Code Beautify — Formatters, Validators, Converters";
const description =
  "Online beautifiers for HTML, CSS, JavaScript, TypeScript, TSX, JSON, Markdown, YAML, GraphQL, XML, SQL (Prettier / sql-formatter), plus Python indent cleanup — all client-side.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "HTML formatter",
    "CSS beautifier",
    "JavaScript prettifier",
    "Python indent",
    "SQL formatter",
    "JSON beautifier",
    "online formatter",
    "code beautifier",
    "Prettier online",
  ],
  alternates: { canonical: `${SITE_URL}/code-beautify` },
  ...socialMetadata({ title, description, canonicalPath: "/code-beautify" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Code Beautify",
  url: `${SITE_URL}/code-beautify`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Format HTML, CSS, JavaScript, TypeScript, TSX, JSON, Markdown, YAML, GraphQL, XML, SQL",
      "Python indentation cleanup",
      "Uses Prettier under the hood for JS/TS/HTML/CSS/JSON/YAML",
      "Runs entirely in your browser via Web Workers — no data sent to a server",
      "Free — no account required",
    ],
  }),
};

const beautifyFaqs = TOOL_FAQS["code-beautify"] ?? [];
const faqSchema = beautifyFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: beautifyFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function CodeBeautifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Code Beautify", path: "/code-beautify" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="code-beautify" />
    </>
  );
}
