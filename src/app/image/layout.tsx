import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import Footer from "@/components/Footer";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const description =
  "Free image utilities in your browser: resize, compress, convert formats, remove backgrounds, read EXIF. No uploads to DevBench — processing stays on your device.";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Image Tools",
  url: `${SITE_URL}/image`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Resize and compress JPEG, PNG, and WebP",
      "Convert HEIC, SVG, and other formats",
      "Batch convert multiple images to a ZIP",
      "Remove image backgrounds with AI in-browser",
      "Read EXIF metadata from photos",
      "Runs entirely in your browser — files never uploaded to a server",
    ],
  }),
};

const imageFaqs = [
  ...(TOOL_FAQS["image-format-converter"] ?? []),
  ...(TOOL_FAQS["image-compressor"] ?? []).slice(0, 2),
];
const faqSchema =
  imageFaqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: imageFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

export default function ImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Image Tools", path: "/image" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="image-format-converter" />
      <Footer />
    </>
  );
}
