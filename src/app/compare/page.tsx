import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { TOOL_COMPARISONS } from "@/lib/tool-comparisons";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Compare tools",
  description:
    "Short guides for overlapping DevBench utilities — CSV vs TSV, text vs JSON diff, YAML converters vs the JSON workspace.",
  alternates: { canonical: `${SITE_URL}/compare` },
};

export default function CompareIndexPage() {
  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([{ name: "Compare tools", path: "/compare" }])} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight">Compare tools</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Pick the right utility when two tools overlap. Every linked tool runs in your browser.
        </p>
        <ul className="mt-8 space-y-4">
          {TOOL_COMPARISONS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/compare/${c.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/40 hover:bg-muted/30"
              >
                <span className="font-semibold text-foreground">{c.title}</span>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.deck}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <Footer />
    </>
  );
}
