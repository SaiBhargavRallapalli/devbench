import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import JsonLd from "@/components/JsonLd";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const JWT_TITLE = "JWT Debugger — Decode, Encode & Verify JWT Tokens Online";
const JWT_DESC =
  "Free online JWT debugger — decode headers and payloads, verify signatures (HS256/384/512, RS256, ES256, EdDSA), inspect claims and expiry. Runs entirely in your browser. No signup.";

export const metadata: Metadata = {
  title: JWT_TITLE,
  description: JWT_DESC,
  keywords: [
    "JWT debugger",
    "JWT decoder",
    "JWT encoder",
    "JSON Web Token",
    "verify JWT",
    "jwt.io alternative",
    "decode JWT online",
    "HS256",
    "RS256",
    "ES256",
    "EdDSA",
    "JWT verify signature",
    "JWT payload",
    "JWT claims",
  ],
  alternates: { canonical: `${SITE_URL}/jwt-debugger` },
  ...socialMetadata({
    title: JWT_TITLE,
    description: JWT_DESC,
    canonicalPath: "/jwt-debugger",
    ogImageUrl: `${SITE_URL}/jwt-debugger/opengraph-image`,
    ogImageAlt: `${JWT_TITLE} | DevBench`,
  }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "JWT Debugger",
  url: `${SITE_URL}/jwt-debugger`,
  description: JWT_DESC,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  provider: {
    "@type": "Organization",
    name: "DevBench",
    url: SITE_URL,
  },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/jwt-debugger/opengraph-image`,
    featureList: [
      "Decode JWT headers and payloads; inspect standard and custom claims",
      "Verify HMAC signatures (HS256, HS384, HS512) with Web Crypto",
      "Verify RSA signatures (RS256, RS384, RS512) with PEM public key",
      "Verify ECDSA signatures (ES256, ES384, ES512) and EdDSA",
      "Encode and sign new tokens with any supported algorithm",
      "Runs entirely in your browser — tokens are never sent to a server",
      "Free — no account required",
    ],
  }),
};

const jwtFaqs = TOOL_FAQS["jwt-debugger"] ?? [];
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: jwtFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function JwtDebuggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "JWT Debugger", path: "/jwt-debugger" }])} />
      <JsonLd data={faqSchema} />
      {children}
      <ToolFaqSection slug="jwt-debugger" />
      <Footer />
    </>
  );
}
