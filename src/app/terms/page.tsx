import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">
          Terms &amp; Conditions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: November 2026
        </p>
        <div className="mt-6 space-y-6 text-muted-foreground leading-relaxed">

          <p>
            These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of
            DevBench (devbench.co.in) and its tools. By using the site you agree
            to these Terms. If you do not agree, please do not use DevBench.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">1. The service</h2>
          <p>
            DevBench is a collection of browser-based developer tools. It is{" "}
            <strong className="text-foreground">free forever</strong> — there are no
            accounts, no subscriptions, no in-app purchases, and no payments of any
            kind. The site is funded by advertising and, occasionally, clearly marked
            affiliate links (see section 6).
          </p>
          <p>
            You must be at least 13 years old to use DevBench. We may add, change, or
            remove tools at any time, and we do not guarantee that the site will be
            uninterrupted, error-free, or available at any particular moment.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">2. Acceptable use</h2>
          <p>
            You may use DevBench for personal and internal work purposes. You must not
            use the site to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>
              break the law, infringe others&apos; rights, or distribute malicious or
              illegal content;
            </li>
            <li>
              abuse the features that make network requests — the API Tester proxy,
              Webhook Simulator, Notebook &rarr; PDF conversion, and Go playground —
              for spam, scanning, attacking systems, or overwhelming third parties;
            </li>
            <li>
              disrupt, probe, or reverse-engineer the site in a way that harms its
              operation or other users;
            </li>
            <li>
              scrape the site at abusive rates or republish substantial portions of it
              as your own service; or
            </li>
            <li>
              misrepresent your affiliation with DevBench or use our name and logo
              without permission.
            </li>
          </ul>
          <p>
            We may restrict or block access when we reasonably believe these rules are
            being violated.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">3. Your inputs and outputs</h2>
          <p>
            Anything you paste into DevBench tools remains{" "}
            <strong className="text-foreground">yours</strong>. For client-side tools
            your input never reaches our servers (see section 1 of our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            ), and the results a tool produces — formatted text, generated files,
            decoded tokens, calculations — are yours to use and rely on.
          </p>
          <p>
            You are responsible for the data you enter, including having the rights and
            permissions to use it. DevBench tools are utilities for developers; their
            output is informational and should be verified before being used for
            decisions with legal, financial, or safety consequences.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">4. Intellectual property</h2>
          <p>
            The DevBench site — its design, branding, text, documentation, and code —
            belongs to the DevBench contributors. The{" "}
            <strong className="text-foreground">code is released under the MIT
            License</strong>{" "}
            (see the{" "}
            <a
              href="https://github.com/saibhargavrallapalli/devbench/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              LICENSE file
            </a>{" "}
            in our repository), which lets anyone use, copy, modify, and redistribute
            it under those terms.
          </p>
          <p>
            Tool <em>outputs</em> are not our intellectual property — they are yours
            (section 3). The DevBench name, logo, and site layout may not be
            reproduced or used in a way that suggests endorsement without permission.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">5. Open-source licenses</h2>
          <p>
            DevBench is built on top of dozens of open-source packages. Each of those
            packages remains licensed under its own terms (typically MIT, Apache-2.0,
            or BSD), which continue to apply to them independently of our license. Our
            MIT license covers the DevBench source code itself — the full dependency
            list is published in{" "}
            <a
              href="https://github.com/saibhargavrallapalli/devbench/blob/main/package.json"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              package.json
            </a>{" "}
            in the repository.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">6. Ads and third-party links</h2>
          <p>
            DevBench displays advertisements served by{" "}
            <strong className="text-foreground">Google AdSense</strong> and may contain
            affiliate links to third-party products. Ads and affiliate placements do not
            receive the text or files you enter into tools, and they never influence
            how any tool behaves. Third-party sites you reach through ads or links have
            their own terms and privacy policies; we are not responsible for their
            content or practices.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">7. No warranties</h2>
          <p>
            DevBench is provided <strong className="text-foreground">&ldquo;as
            is&rdquo;</strong> and{" "}
            <strong className="text-foreground">&ldquo;as available&rdquo;</strong>,
            without warranties of any kind — express or implied, including
            merchantability, fitness for a particular purpose, and non-infringement. We
            do not warrant that tool output is accurate, complete, or that the site
            will be secure or continuously available.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">8. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, the DevBench contributors will not
            be liable for any indirect, incidental, special, consequential, or
            exemplary damages, or for any loss of data, profits, goodwill, or business
            interruption, arising from your use of (or inability to use) the site —
            even if advised of the possibility of such damages.
          </p>
          <p>
            Our total liability for any claim relating to DevBench is limited to the
            amount you have paid us in the last twelve months — which is nothing,
            because DevBench is free. Some jurisdictions do not allow certain
            limitations, so parts of this section may not apply to you.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">9. Privacy</h2>
          <p>
            How we handle information is described in the{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            , which forms part of these Terms.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">10. Changes to these terms</h2>
          <p>
            We may update these Terms as the site evolves. The &ldquo;last
            updated&rdquo; date at the top reflects the most recent revision, and
            continued use of DevBench after a change means you accept the updated
            Terms.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">11. Governing law</h2>
          <p>
            These Terms are governed by the laws of India, without regard to its
            conflict-of-law rules, and any disputes are subject to the jurisdiction of
            the courts of India.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">12. Contact</h2>
          <p>
            Questions about these Terms?{" "}
            <Link href="/contact" className="text-accent hover:underline">
              Reach out via the contact page
            </Link>
            .
          </p>

        </div>
      </main>
      <Footer />
    </>
  );
}
