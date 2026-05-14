import type { Metadata } from "next";
import Footer from "@/components/Footer";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import JsonLd from "@/components/JsonLd";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const title = "Linux & Server Commands Cheat Sheet";
const description =
  "Searchable CLI reference: basics, permissions, processes, networking, Docker, Kubernetes, disk/memory, and troubleshooting — with copy-ready examples. Runs in your browser.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "linux cheat sheet",
    "bash commands",
    "docker commands",
    "kubectl cheat sheet",
    "server troubleshooting",
    "journalctl",
    "ssh",
  ],
  alternates: { canonical: `${SITE_URL}/linux-cheatsheet` },
  ...socialMetadata({ title, description, canonicalPath: "/linux-cheatsheet" }),
};

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Linux & Server Commands Cheat Sheet",
  url: `${SITE_URL}/linux-cheatsheet`,
  description,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  provider: { "@type": "Organization", name: "DevBench", url: SITE_URL },
  ...webApplicationEnrichment({
    screenshotUrl: `${SITE_URL}/opengraph-image`,
    featureList: [
      "Searchable Linux and server command reference",
      "Categories: file system, permissions, processes, networking, Docker, Kubernetes, disk/memory",
      "Copy-ready command examples",
      "Troubleshooting and diagnostic commands",
      "Runs entirely in your browser — no data sent to a server",
    ],
  }),
};

const linuxFaqs = TOOL_FAQS["linux-cheatsheet"] ?? [];
const faqSchema = linuxFaqs.length > 0
  ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: linuxFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    }
  : null;

export default function LinuxCheatsheetLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={webAppSchema} />
      <JsonLd data={breadcrumbSchema([{ name: "Linux Cheat Sheet", path: "/linux-cheatsheet" }])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {children}
      <section className="max-w-5xl mx-auto px-4 pb-10 w-full border-t border-border pt-8 mt-2 space-y-3">
        <h2 className="text-base font-semibold text-foreground mt-2 mb-2">About this cheat sheet</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Commands are generic patterns — paths, port numbers, and unit names are examples. Always confirm{" "}
          <strong className="text-foreground">destructive</strong> operations (<code className="font-mono text-xs">rm -rf</code>,{" "}
          <code className="font-mono text-xs">kill -9</code>, <code className="font-mono text-xs">docker system prune</code>) on
          staging first. Production servers differ by distro and policy — use your runbooks where they conflict.
        </p>
      </section>
      <ToolFaqSection slug="linux-cheatsheet" />
      <Footer />
    </>
  );
}
