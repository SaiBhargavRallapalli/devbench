import type { Metadata } from "next";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import ToolFaqSection from "@/components/tools/ToolFaqSection";

export const metadata: Metadata = {
  title: "JWT Debugger — Decode, Encode & Verify Tokens | DevBench",
  description:
    "Free online JWT decoder and encoder. Inspect headers and payloads, verify HMAC signatures (HS256/384/512), see claim breakdown and expiry — runs entirely in your browser.",
  keywords: [
    "JWT decoder",
    "JWT encoder",
    "JSON Web Token",
    "verify JWT",
    "jwt.io alternative",
    "decode JWT online",
  ],
  alternates: { canonical: "https://devbench.co.in/jwt-debugger" },
};

const faqs = TOOL_FAQS["jwt-debugger"] ?? [];

const jsonLd =
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

export default function JwtDebuggerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      {children}
      <ToolFaqSection slug="jwt-debugger" />
    </>
  );
}
