import Link from "next/link";
import { Shield, Zap, Globe, Sparkles, ArrowRight } from "lucide-react";
import { TOOLS } from "@/lib/tools-registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FavoritesBar from "@/components/FavoritesBar";
import EngagementHome from "@/components/EngagementHome";
import JsonLd from "@/components/JsonLd";
import { FOOTER_CATEGORY_ORDER } from "@/lib/site-navigation";
import { getCategoryHighlightTools } from "@/lib/category-navigation";
import { toolGroupSchema } from "@/lib/tool-structured-data";
import TrackedAffiliateLink from "@/components/TrackedAffiliateLink";
import EngagementFloatingCta from "@/components/EngagementFloatingCta";

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "DevBench",
  url: "https://www.devbench.co.in",
  description:
    `${TOOLS.length}+ free tools in your browser — JSON, PDFs, converters, calculators. No signup.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.devbench.co.in/?q={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

const homepageToolGroupsSchema = {
  "@context": "https://schema.org",
  "@graph": FOOTER_CATEGORY_ORDER.map((category) =>
    toolGroupSchema(category, getCategoryHighlightTools(category, 5)),
  ),
};

const WHY_DEVBENCH_FEATURES = [
  {
    icon: Shield,
    title: "Private on your device",
    desc: "Nothing is uploaded to our servers. What you paste stays in your browser.",
  },
  {
    icon: Zap,
    title: "Ready when you are",
    desc: "No account, no queue. Pick a tool and use it in one click.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <Header />
      <FavoritesBar />
      <main id="main" className="flex-1">
        {/* Hero — server-rendered for fast LCP */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-light),transparent_70%)] opacity-60" />
          <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 rounded-full border border-border bg-card text-sm text-muted-foreground">
              <Sparkles
                className="h-3.5 w-3.5 shrink-0 text-accent"
                strokeWidth={2}
                aria-hidden
              />
              <span className="leading-none">
                {TOOLS.length} free tools · no signup · runs in your browser
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4 text-balance">
              Your Developer{" "}
              <span className="text-accent">Workbench</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Whether you ship code, study, or just need to fix a file fast — format JSON, work with
              PDFs, tweak images, or run a calculator in one place. It runs directly in your browser.
              Free, no install.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              <Link
                href="/json"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-md transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Open the JSON formatter — runs entirely in your browser"
              >
                Start using tools now
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("tools");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title="Browse the full catalog of free in-browser tools"
              >
                Browse all tools
              </button>
            </div>

            <div className="max-w-5xl mx-auto space-y-10 text-left md:text-center">
              <section aria-labelledby="why-devbench-heading">
                <h2
                  id="why-devbench-heading"
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  Why DevBench for free online developer tools
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  {WHY_DEVBENCH_FEATURES.map((f) => (
                    <div
                      key={f.title}
                      className="flex flex-row md:flex-col md:items-center gap-3 md:gap-4 rounded-2xl border border-border/70 bg-card/50 px-4 py-5 md:text-center shadow-sm shadow-black/[0.03]"
                    >
                      <div className="shrink-0 rounded-xl bg-accent/10 p-2.5 md:p-3">
                        <f.icon className="h-5 w-5 text-accent md:h-6 md:w-6" aria-hidden />
                      </div>
                      <div className="min-w-0 flex-1 md:flex-none">
                        <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground md:mx-auto md:max-w-[18rem]">
                          {f.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section aria-labelledby="tool-count-heading">
                <h2
                  id="tool-count-heading"
                  className="text-lg font-semibold tracking-tight text-foreground sm:text-xl"
                >
                  {TOOLS.length}+ free online developer tools in one place
                </h2>
                <div className="mt-6 flex flex-row md:flex-col md:items-center gap-3 md:gap-4 rounded-2xl border border-border/70 bg-card/50 px-4 py-5 md:mx-auto md:max-w-md shadow-sm shadow-black/[0.03]">
                  <div className="shrink-0 rounded-xl bg-accent/10 p-2.5 md:p-3">
                    <Globe className="h-5 w-5 text-accent md:h-6 md:w-6" aria-hidden />
                  </div>
                  <p className="min-w-0 flex-1 text-xs leading-relaxed text-muted-foreground md:max-w-[18rem]">
                    From JSON and PDFs to money, health, and date helpers — free forever.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </section>

        <div className="border-b border-border bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="text-muted-foreground uppercase tracking-wide font-medium text-[10px]">
              Sponsored
            </span>
            <TrackedAffiliateLink
              href="https://namecheap.pxf.io/c/7275861/3884366/5618?partnerpropertyid=8365175"
              vendor="namecheap"
              offer="shared_hosting"
              placement="homepage_sponsor_bar"
              className="hover:text-foreground transition-colors"
            >
              Shared Hosting from $1.58/mo ↗
            </TrackedAffiliateLink>
            <span aria-hidden="true" className="opacity-30 hidden sm:inline">·</span>
            <TrackedAffiliateLink
              href="https://namecheap.pxf.io/c/7275861/3884368/5618?partnerpropertyid=8365175"
              vendor="namecheap"
              offer="vps_hosting"
              placement="homepage_sponsor_bar"
              className="hover:text-foreground transition-colors"
            >
              VPS Hosting from $6.88/mo ↗
            </TrackedAffiliateLink>
            <span aria-hidden="true" className="opacity-30 hidden sm:inline">·</span>
            <TrackedAffiliateLink
              href="https://namecheap.pxf.io/c/7275861/3884352/5618?partnerpropertyid=8365175"
              vendor="namecheap"
              offer="domains_ssl_dns"
              placement="homepage_sponsor_bar"
              className="hover:text-foreground transition-colors"
            >
              Domains, SSLs & Premium DNS — Discounts Sitewide ↗
            </TrackedAffiliateLink>
          </div>
        </div>

        <EngagementHome tools={TOOLS} />
      </main>
      <EngagementFloatingCta />
      <Footer />

      <JsonLd data={websiteSchema} />
      <JsonLd data={homepageToolGroupsSchema} />
    </>
  );
}
