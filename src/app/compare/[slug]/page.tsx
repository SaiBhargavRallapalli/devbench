import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { TOOL_COMPARISONS } from "@/lib/tool-comparisons";
import { socialMetadata, SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOL_COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = TOOL_COMPARISONS.find((c) => c.slug === slug);
  if (!comp) return { title: "Compare" };
  const canonicalPath = `/compare/${comp.slug}`;
  return {
    title: comp.title,
    description: comp.deck,
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    ...socialMetadata({
      title: comp.title,
      description: comp.deck,
      canonicalPath,
    }),
  };
}

export default async function CompareArticlePage({ params }: Props) {
  const { slug } = await params;
  const comp = TOOL_COMPARISONS.find((c) => c.slug === slug);
  if (!comp) notFound();

  const faqSchema = comp.faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: comp.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([
        { name: "Compare tools", path: "/compare" },
        { name: comp.title, path: `/compare/${comp.slug}` },
      ])} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link href="/compare" className="hover:text-accent">
            Compare tools
          </Link>
          <span className="mx-2 opacity-50">/</span>
          <span className="text-foreground">{comp.slug}</span>
        </nav>
        <article>
          <h1 className="text-3xl font-bold tracking-tight">{comp.title}</h1>
          <p className="mt-4 text-muted-foreground leading-relaxed">{comp.deck}</p>

          <section className="mt-8 space-y-4">
            {comp.intro.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </section>

          <section className="mt-10 space-y-8">
            <div>
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/tools/${comp.a.slug}`}
                  className="text-accent hover:underline"
                >
                  {comp.a.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{comp.whenA}</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                <Link
                  href={`/tools/${comp.b.slug}`}
                  className="text-accent hover:underline"
                >
                  {comp.b.name}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{comp.whenB}</p>
            </div>
          </section>

          <section className="mt-10 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <caption className="mb-3 text-left font-semibold text-foreground">
                {comp.table.caption}
              </caption>
              <thead>
                <tr className="border-b border-border text-left">
                  {comp.table.headers.map((h) => (
                    <th key={h} className="py-2 pr-4 font-medium text-foreground align-top">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comp.table.rows.map((row) => (
                  <tr key={row[0]} className="border-b border-border/60 align-top">
                    {row.map((cell, i) => (
                      <td
                        key={i}
                        className={`py-2.5 pr-4 leading-relaxed ${
                          i === 0 ? "font-medium text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-10 space-y-8">
            {comp.sections.map((s) => (
              <div key={s.h2}>
                <h2 className="text-lg font-semibold">{s.h2}</h2>
                {s.p.map((para, i) => (
                  <p key={i} className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </section>

          <p className="mt-10 rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
            {comp.summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/tools/${comp.a.slug}`}
              className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Open {comp.a.name}
            </Link>
            <Link
              href={`/tools/${comp.b.slug}`}
              className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Open {comp.b.name}
            </Link>
          </div>

          <section className="mt-12">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Frequently Asked Questions
            </h2>
            <div className="mt-3 flex flex-col divide-y divide-border rounded-xl border border-border overflow-hidden">
              {comp.faq.map((f) => (
                <details key={f.q} className="group bg-card">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden w-full flex items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-muted/40 transition-colors">
                    <span className="text-sm font-medium text-foreground">{f.q}</span>
                    <span className="text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
