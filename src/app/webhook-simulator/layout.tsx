import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Webhook Payload Simulator — GitHub, Stripe, Slack, Shopify";
const description =
  "Generate, send, and verify signed webhook payloads — GitHub, Stripe, Slack, Shopify, or a generic HMAC. Signing runs locally; your secret never leaves the browser.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "webhook simulator",
    "test webhook",
    "GitHub webhook signature",
    "Stripe webhook signing secret",
    "Slack X-Slack-Signature",
    "Shopify HMAC SHA256",
    "verify webhook signature",
    "HMAC generator",
  ],
  alternates: { canonical: `${SITE_URL}/webhook-simulator` },
  ...socialMetadata({ title, description, canonicalPath: "/webhook-simulator" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Webhook Payload Simulator",
  url: `${SITE_URL}/webhook-simulator`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Generate signed webhook payloads for GitHub, Stripe, Slack, and Shopify",
      "HMAC-SHA256 signing runs in your browser — secrets never leave your device",
      "Send test payloads to any URL",
      "Verify incoming webhook signatures",
      "Free — no account required",
    ],
  }),
};

const webhookFaqs = TOOL_FAQS["webhook-simulator"] ?? [];
const faqSchema = webhookFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: webhookFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function WebhookSimulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd
        data={breadcrumbSchema([{ name: "Webhook Simulator", path: "/webhook-simulator" }])}
      />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="webhook-simulator" />
    </>
  );
}
