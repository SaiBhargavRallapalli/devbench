import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import Footer from "@/components/Footer";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "API Tester — Online REST Client & HTTP Testing Tool";
const description =
  "Test REST APIs online — GET, POST, PUT, DELETE with custom headers, Bearer/Basic/API key auth, request body, and request history. CORS-free via proxy. No signup, browser-based.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "API tester",
    "REST client online",
    "HTTP client online",
    "test API online",
    "Postman alternative",
    "curl online",
    "test REST API",
    "API testing tool",
    "GET POST request tester",
  ],
  alternates: { canonical: `${SITE_URL}/api-tester` },
  ...socialMetadata({ title, description, canonicalPath: "/api-tester" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "API Tester",
  url: `${SITE_URL}/api-tester`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/api-tester/opengraph-image`,
    featureList: [
      "Send GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS requests",
      "Custom request headers and Bearer/Basic/API key authentication",
      "JSON, form data, and raw text request bodies",
      "CORS-free requests via server-side proxy",
      "Request history and code snippet export",
      "WebSocket connection testing",
      "Free — no account required",
    ],
  }),
};

const apiFaqs = TOOL_FAQS["api-tester"] ?? [];
const faqSchema = apiFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: apiFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function ApiTesterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "API Tester", path: "/api-tester" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="api-tester" />
      <Footer />
    </>
  );
}
