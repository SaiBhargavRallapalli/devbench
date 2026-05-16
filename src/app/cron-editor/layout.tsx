import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import Footer from "@/components/Footer";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Cron Expression Editor — Build & Decode Cron Jobs Online";
const description =
  "Build and decode cron expressions online — plain-English description, next 10 run times, GitHub Actions, Kubernetes, and crontab syntax. Free, no signup, runs in your browser.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "cron editor",
    "cron expression",
    "crontab",
    "cron job",
    "schedule builder",
    "cron syntax",
    "cron job generator",
    "cron parser online",
    "github actions cron",
    "kubernetes cronjob",
  ],
  alternates: { canonical: `${SITE_URL}/cron-editor` },
  ...socialMetadata({ title, description, canonicalPath: "/cron-editor" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Cron Expression Editor",
  url: `${SITE_URL}/cron-editor`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/cron-editor/opengraph-image`,
    featureList: [
      "Build cron expressions with a visual field editor",
      "Plain-English description of any cron expression",
      "Next 10 scheduled run times with relative timestamps",
      "Presets for common schedules: every minute, hourly, daily, weekly, monthly",
      "GitHub Actions, Kubernetes CronJob, and crontab syntax reference",
      "Runs entirely in your browser — no data sent to a server",
    ],
  }),
};

const cronFaqs = TOOL_FAQS["cron-editor"] ?? [];
const faqSchema = cronFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: cronFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function CronEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Cron Editor", path: "/cron-editor" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="cron-editor" />
      <Footer />
    </>
  );
}
