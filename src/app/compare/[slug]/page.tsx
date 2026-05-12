import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { TOOL_COMPARISONS } from "@/lib/tool-comparisons";
import { SITE_URL } from "@/lib/social-metadata";
import { breadcrumbSchema } from "@/lib/breadcrumb-schema";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return TOOL_COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = TOOL_COMPARISONS.find((c) => c.slug === slug);
  if (!comp) return { title: "Compare" };
  return {
    title: comp.title,
    description: comp.deck,
    alternates: { canonical: `${SITE_URL}/compare/${comp.slug}` },
  };
}

export default async function CompareArticlePage({ params }: Props) {
  const { slug } = await params;
  const comp = TOOL_COMPARISONS.find((c) => c.slug === slug);
  if (!comp) notFound();

  return (
    <>
      <Header />
      <JsonLd data={breadcrumbSchema([
        { name: "Compare tools", path: "/compare" },
        { name: comp.title, path: `/compare/${comp.slug}` },
      ])} />
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
        </article>
      </main>
      <Footer />
    </>
  );
}
