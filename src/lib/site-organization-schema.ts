import { TOOLS } from "@/lib/tools-registry";
import { GITHUB_REPOSITORY } from "@/lib/distribution";
import { SITE_CONTACT_EMAIL, SITE_URL } from "@/lib/site-config";

/** Site-wide Organization node — emitted once from the root layout. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: "DevBench",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.svg`,
  description: `${TOOLS.length}+ free online developer tools — JSON formatter, Base64 encoder, regex tester, JWT debugger, UUID generator & more. No login required; runs in your browser.`,
  foundingDate: "2026-05-04",
  sameAs: [
    `https://github.com/${GITHUB_REPOSITORY}`,
    "https://www.producthunt.com/products/devbench-2",
    "https://twitter.com/devbench",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: SITE_CONTACT_EMAIL,
    url: `${SITE_URL}/contact`,
  },
};

/** Homepage-only WebSite with sitelinks searchbox — do not duplicate in root layout. */
export function websiteSchemaWithSearch(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: "DevBench",
    url: SITE_URL,
    description: `${TOOLS.length}+ free tools in your browser — JSON, PDFs, converters, calculators. No signup.`,
    publisher: { "@id": `${SITE_URL}/#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
