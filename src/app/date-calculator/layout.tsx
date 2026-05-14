import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Date Calculator — Add or Subtract Years, Months, Weeks, Days";
const description =
  "Add or subtract time from any date — calendar-safe months/years, weeks and days. See the resulting weekday instantly. Free, runs in your browser.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "date calculator",
    "add days to date",
    "date arithmetic",
    "calendar calculator",
    "subtract weeks from date",
  ],
  alternates: { canonical: `${SITE_URL}/date-calculator` },
  ...socialMetadata({ title, description, canonicalPath: "/date-calculator" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Date Calculator",
  url: `${SITE_URL}/date-calculator`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Add or subtract years, months, weeks, and days from any date",
      "Calendar-safe month arithmetic (handles month-end dates correctly)",
      "Shows resulting weekday name",
      "Runs entirely in your browser — no data sent to a server",
      "Free — no account required",
    ],
  }),
};

const dateFaqs = TOOL_FAQS["date-calculator"] ?? [];
const faqSchema = dateFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: dateFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function DateCalculatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Date Calculator", path: "/date-calculator" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <section className="max-w-5xl mx-auto px-4 pb-10 w-full border-t border-border pt-8 mt-2 space-y-3">
        <h2 className="text-base font-semibold text-foreground mt-2 mb-2">How date math works here</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Years and months adjust on the <strong className="text-foreground">calendar</strong> (month lengths differ). Weeks and days are
          added after that as ordinary day counts. Results use your browser&apos;s local calendar for the selected date.
        </p>
      </section>
      <ToolFaqSection slug="date-calculator" />
      <Footer />
    </>
  );
}
