import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import Footer from "@/components/Footer";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const description =
  "Free Notepad++ style editor in your browser: tabs, syntax highlighting, split view, find/replace, bookmarks, macros, and local session restore. Files stay on your device.";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Notepad++ Workspace",
  url: `${SITE_URL}/notepad`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Multi-tab documents with dirty indicators",
      "30+ syntax highlighting languages",
      "Split editor vertical and horizontal",
      "Find, replace, go to line, bookmarks",
      "UTF-8, UTF-8 BOM, UTF-16 LE encoding on save",
      "Macro record and playback",
      "Named session save and restore",
      "Runs entirely in your browser",
    ],
  }),
};

const faqs = TOOL_FAQS["notepad-plus-plus"] ?? [];
const faqSchema =
  faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      }
    : null;

export default function NotepadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Notepad++", path: "/notepad" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="notepad-plus-plus" />
      <Footer />
    </>
  );
}
