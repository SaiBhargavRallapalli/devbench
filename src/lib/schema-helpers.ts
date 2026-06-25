import type { Faq } from "@/lib/tool-faqs";

function faqMainEntity(faqs: Faq[]) {
  return faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  }));
}

/** FAQPage node for inclusion in a `@graph` array (no `@context`). */
export function faqPageGraphNode(faqs: Faq[]): object | null {
  if (faqs.length === 0) return null;
  return {
    "@type": "FAQPage",
    mainEntity: faqMainEntity(faqs),
  };
}

/** Standalone FAQPage JSON-LD with `@context` — for a dedicated `<JsonLd>` tag. */
export function faqPageSchema(faqs: Faq[]): object | null {
  const node = faqPageGraphNode(faqs);
  if (!node) return null;
  return {
    "@context": "https://schema.org",
    ...node,
  };
}
