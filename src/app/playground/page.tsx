import Link from "next/link";
import PlaygroundClient from "@/app/playground/playground-client";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ToolSeoContent from "@/components/tools/ToolSeoContent";
import ToolFaqSection from "@/components/tools/ToolFaqSection";
import TrackToolVisit from "@/components/TrackToolVisit";
import { getToolBySlug, getToolsByCategory, CATEGORIES } from "@/lib/tools-registry";
import { TOOL_PAGE_CONTENT } from "@/lib/tool-page-content";
import { TOOL_FAQS } from "@/lib/tool-faqs";
import { SITE_URL } from "@/lib/social-metadata";
import { publicHrefForToolSlug } from "@/lib/devbench-workspaces";
import { webApplicationEnrichment } from "@/lib/web-application-schema";

const PLAYGROUND_SLUG = "code-playground";

export default function PlaygroundPage() {
  const tool = getToolBySlug(PLAYGROUND_SLUG);
  const extra = TOOL_PAGE_CONTENT[PLAYGROUND_SLUG];
  const faqs = TOOL_FAQS[PLAYGROUND_SLUG] ?? [];
  const appDescription =
    extra?.metaDescription ??
    `${tool?.description ?? "Code playground"} Runs in your browser with optional Go compile via the official Go Playground API.`;

  const graph: object[] = [];

  if (tool) {
    graph.push(
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/playground#webapp`,
        name: tool.name,
        url: `${SITE_URL}/playground`,
        description: appDescription,
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
          screenshotUrl: `${SITE_URL}/opengraph-image`,
          featureList: [
            tool.description,
            "Editor with Output and Stdin tabs for supported languages",
            "Free to use — no account required",
            `${CATEGORIES[tool.category].label} workspace on DevBench`,
          ],
        }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: tool.name, item: `${SITE_URL}/playground` },
        ],
      }
    );
  }

  if (faqs.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }

  const jsonLd = graph.length > 0 ? { "@context": "https://schema.org", "@graph": graph } : null;

  const relatedTools = tool
    ? getToolsByCategory(tool.category)
        .filter((t) => t.slug !== PLAYGROUND_SLUG)
        .slice(0, 6)
    : [];
  const categoryMeta = tool ? CATEGORIES[tool.category] : null;

  return (
    <>
      <TrackToolVisit slug={PLAYGROUND_SLUG} />
      {jsonLd && <JsonLd data={jsonLd} />}
      <PlaygroundClient />
      <ToolSeoContent slug={PLAYGROUND_SLUG} />
      <ToolFaqSection slug={PLAYGROUND_SLUG} />
      {relatedTools.length > 0 && categoryMeta && (
        <aside className="max-w-6xl mx-auto px-4 pb-10 w-full">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            More {categoryMeta.label} tools
          </h2>
          <ul className="flex flex-wrap gap-2">
            {relatedTools.map((t) => (
              <li key={t.slug}>
                <Link
                  href={publicHrefForToolSlug(t.slug)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-sm hover:bg-muted transition-colors"
                >
                  <span className="font-mono text-xs opacity-70">{t.icon}</span>
                  {t.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      )}
      <Footer />
    </>
  );
}
