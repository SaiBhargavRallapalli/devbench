import type { Metadata } from "next";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "AWS Lambda Sandbox — Test Handlers in Your Browser";
const description =
  "Run Node.js Lambda handlers against API Gateway, SQS, S3, EventBridge, and other event payloads. Sandboxed in a Web Worker — no AWS credentials, no network, fully client-side.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AWS Lambda sandbox",
    "test Lambda function",
    "Lambda local testing",
    "Lambda event payload",
    "API Gateway event sample",
    "SQS event sample",
    "Lambda handler runner",
  ],
  alternates: { canonical: `${SITE_URL}/lambda-sandbox` },
  ...socialMetadata({ title, description, canonicalPath: "/lambda-sandbox" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AWS Lambda Sandbox",
  url: `${SITE_URL}/lambda-sandbox`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/lambda-sandbox/opengraph-image`,
    featureList: [
      "Run Node.js Lambda handler functions in the browser",
      "Pre-built event templates: API Gateway, SQS, S3, SNS, DynamoDB Streams, EventBridge, Cognito",
      "Sandboxed Web Worker execution — no AWS credentials needed",
      "View console.log output and handler return values",
      "Runs entirely in your browser — no data sent to a server",
    ],
  }),
};

const lambdaFaqs = TOOL_FAQS["lambda-sandbox"] ?? [];
const faqSchema = lambdaFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: lambdaFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function LambdaSandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd
        data={breadcrumbSchema([{ name: "Lambda Sandbox", path: "/lambda-sandbox" }])}
      />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <ToolFaqSection slug="lambda-sandbox" />
    </>
  );
}
