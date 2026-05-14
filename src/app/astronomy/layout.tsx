import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Sun & Moon — Sunrise, Sunset, Moon Phase";
const description =
  "Sunrise, sunset, solar noon, moon illumination and moonrise/moonset for any date and location. Uses astronomical formulas in your browser — no external API.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sunrise sunset calculator",
    "moon phase today",
    "moonrise moonset",
    "golden hour",
    "astronomy calculator",
  ],
  alternates: { canonical: `${SITE_URL}/astronomy` },
  ...socialMetadata({ title, description, canonicalPath: "/astronomy" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Sun & Moon Calculator",
  url: `${SITE_URL}/astronomy`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Sunrise, sunset, and solar noon times for any date and location",
      "Moon phase, illumination percentage, moonrise and moonset",
      "Golden hour and blue hour windows for photography",
      "Uses SunCalc astronomical algorithms — no external API calls",
      "Runs entirely in your browser — your location is never sent to a server",
    ],
  }),
};

const astronomyFaqs = TOOL_FAQS["astronomy"] ?? [];
const faqSchema = astronomyFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: astronomyFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function AstronomyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Astronomy", path: "/astronomy" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <section className="max-w-5xl mx-auto px-4 pb-10 w-full border-t border-border pt-8 mt-2 space-y-3">
        <h2 className="text-base font-semibold text-foreground mt-2 mb-2">Accuracy note</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Times use standard astronomical algorithms (SunCalc). Actual sunrise depends on terrain and altitude — results assume a flat
          horizon. Polar regions may show &quot;always up&quot; or &quot;always down&quot; for the Moon when paths never cross the horizon.
        </p>
      </section>
      <ToolFaqSection slug="astronomy" />
      <Footer />
    </>
  );
}
