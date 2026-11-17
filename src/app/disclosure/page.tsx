import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DisclosurePage() {
  return (
    <>
      <Header />
      <main className="mx-auto flex-1 w-full max-w-2xl px-4 py-10 sm:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Affiliate Disclosure</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: November 2026</p>
        <div className="mt-6 space-y-6 text-muted-foreground leading-relaxed">

          <p>
            DevBench (devbench.co.in) participates in affiliate and referral programs.{" "}
            <strong className="text-foreground">
              We earn commissions when you shop through the links on this site
            </strong>{" "}
            or sign up for a service we link to. This comes at no extra cost to you - the
            price you pay is the same whether you use our link or go directly.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">Where affiliate links appear</h2>
          <p>
            Affiliate links may appear in the &quot;Recommended for developers&quot; sections on
            tool pages, in blog posts and guides, and on resources pages. Every placement shows a
            disclosure notice directly next to the links, and the same notice appears at the top
            of every page on the site.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">How to recognise an affiliate link</h2>
          <p>
            Affiliate links point to third-party sites and open in a new tab. In the page markup
            they carry <code className="text-foreground">rel=&quot;sponsored nofollow&quot;</code>,
            which tells search engines the link is a paid placement, as Google&apos;s link
            guidelines require.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">Which programs we join</h2>
          <p>
            We only list products and services we would use ourselves, such as hosting, domain,
            and developer-tool providers. Affiliate relationships never influence which tools we
            build, how a tool works, or what a recommendation says. Recommendations stay
            editorial: if a product is not worth a developer&apos;s time, a commission does not
            change that.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">Ads are separate</h2>
          <p>
            DevBench also shows ads served by Google AdSense. Ad content is chosen by the ad
            network, not by us, and is separate from our editorial affiliate recommendations.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">Why affiliate links exist</h2>
          <p>
            Commissions help keep every DevBench tool free, with no signup and no paywall. If you
            have questions about this disclosure, reach us via the{" "}
            <Link href="/contact" className="underline underline-offset-2 hover:text-foreground">
              contact page
            </Link>
            .
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
