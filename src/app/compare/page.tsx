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

        <section className="mt-8 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <p>
            Overlapping tools are a good problem to have — until you waste ten minutes in the
            wrong one. These guides explain where each pair of DevBench utilities diverges: what
            the inputs accept, how the output differs, and which one matches your task. Each
            comparison includes a feature table, worked guidance on when to choose which side,
            and answers to the questions people actually hit while converting files.
          </p>
          <p>
            All of the tools compared here share the same ground rules: they run entirely in
            your browser, require no account, and never upload your data. That makes it easy to
            switch between them mid-task — a CSV that fails to import in one converter can go
            straight into the other without leaving the page.
          </p>
        </section>

        <ul className="mt-8 space-y-4">
          {TOOL_COMPARISONS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/compare/${c.slug}`}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent/40 hover:bg-muted/30"
              >
                <span className="font-semibold text-foreground">{c.title}</span>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.deck}</p>
                <span className="mt-3 inline-block text-xs text-accent">
                  {c.table.rows.length} comparison points · {c.faq.length} FAQ →
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-10 rounded-2xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground leading-relaxed">
          <h2 className="font-semibold text-foreground">How to use these guides</h2>
          <p className="mt-2">
            Start with the table — it answers most questions at a glance. If your case is less
            obvious, the sections below it walk through real scenarios (database exports,
            re-formatted API payloads, Kubernetes manifests). When both tools genuinely fit,
            either works: they share the same client-side engine, so the only difference is the
            interface you prefer.
          </p>
          <p className="mt-3">
            Missing a comparison?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Request one
            </Link>{" "}
            — or open the{" "}
            <Link href="/" className="text-accent hover:underline">
              full tool index
            </Link>{" "}
            to browse everything DevBench offers.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
