import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import Footer from "@/components/Footer";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const description =
  "Free PDF utilities in your browser: combine images into one PDF, remove or extract pages. No uploads to DevBench — processing stays on your device.";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "PDF Tools",
  url: `${SITE_URL}/pdf`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Merge multiple PDFs into one",
      "Split PDF by page range",
      "Rotate PDF pages",
      "Compress PDF to reduce file size",
      "Add page numbers and watermarks",
      "Convert images to PDF and PDF pages to JPG",
      "Runs entirely in your browser — files never uploaded to a server",
    ],
  }),
};

const pdfFaqs = TOOL_FAQS["pdf"] ?? [];
const faqSchema = pdfFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: pdfFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function PdfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "PDF Tools", path: "/pdf" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="pdf" />
      <Footer />
    </>
  );
}
