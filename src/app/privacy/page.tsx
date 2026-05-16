import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>
        <div className="mt-6 space-y-6 text-muted-foreground leading-relaxed">

          <p>
            This Privacy Policy explains how DevBench (devbench.co.in) collects, uses, and
            protects information when you visit and use the site. By using DevBench, you agree
            to the practices described below.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">1. Tool inputs and data processing</h2>
          <p>
            DevBench tools process your input <strong className="text-foreground">entirely
            within your browser</strong>. Text you paste, files you upload, and options you
            configure are handled by client-side JavaScript running on your own device. We do
            not operate a backend that receives, stores, or logs your tool inputs.
          </p>
          <p>
            Examples of data that never reaches our servers: JSON payloads, JWT tokens, Base64
            strings, passwords, hash inputs, API request bodies, PDF files, images, cron
            expressions, code you run in the playground, and any other text or file you provide
            to a DevBench tool.
          </p>
          <p>
            The two exceptions are features that require a network request by design:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm">
            <li>
              <strong className="text-foreground">API Tester</strong> — HTTP requests you
              send are routed through a CORS proxy so they can reach external APIs from a
              browser. The proxy forwards your request and returns the response; it does not
              log request bodies or headers beyond what is necessary to relay the response.
            </li>
            <li>
              <strong className="text-foreground">Webhook Simulator</strong> — payloads are
              sent to the destination URL you provide. HMAC signing happens in your browser
              before transmission; your signing secret is never sent to our servers.
            </li>
          </ul>

          <h2 className="text-lg font-semibold text-foreground pt-2">2. Analytics</h2>
          <p>
            DevBench uses <strong className="text-foreground">Google Analytics (via Google
            Tag Manager)</strong> and <strong className="text-foreground">Vercel
            Analytics</strong> to understand which tools are used, where visitors come from,
            and how the site performs. These services collect standard web analytics data:
            pages visited, referrer, browser type, country, and device type. Individual tool
            inputs are not included in analytics events.
          </p>
          <p>
            Analytics data helps us prioritise which tools to improve and which new tools to
            build. You can opt out of Google Analytics by using the{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google Analytics Opt-out Browser Add-on
            </a>
            .
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">3. Advertising</h2>
          <p>
            This site uses <strong className="text-foreground">Google AdSense</strong> to
            display advertisements. Google and its advertising partners use cookies and similar
            technologies to serve ads based on your prior visits to DevBench and other websites.
            Google&apos;s use of advertising cookies allows it and its partners to serve ads
            based on your visit here and/or other sites on the internet.
          </p>
          <p>
            You can opt out of personalised advertising by visiting{" "}
            <a
              href="https://adssettings.google.com"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-accent hover:underline"
            >
              Google Ad Settings
            </a>{" "}
            or{" "}
            <a
              href="https://www.aboutads.info/choices"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-accent hover:underline"
            >
              YourAdChoices
            </a>
            . DevBench does not control the cookies set by Google AdSense or its advertising
            partners.
          </p>
          <p>
            DevBench also participates in the <strong className="text-foreground">Namecheap
            affiliate programme</strong> (via Impact.com). If you click a Namecheap link and
            make a purchase, we may earn a commission at no extra cost to you. Affiliate links
            are clearly presented as hosting or domain recommendations.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">4. Cookies and local storage</h2>
          <p>
            DevBench itself stores one item in your browser&apos;s{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">localStorage</code>: your
            preferred light or dark colour theme. This preference never leaves your device and
            is not sent to any server.
          </p>
          <p>
            Third-party services (Google Analytics, Google AdSense, Vercel) may set their own
            cookies. These are governed by their respective privacy policies, which are linked
            in sections 2 and 3 above.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">5. Hosting and server logs</h2>
          <p>
            DevBench is hosted on <strong className="text-foreground">Vercel</strong>. Vercel
            may collect standard server access logs (IP address, requested URL, HTTP status
            code, timestamp, and user agent) as part of normal infrastructure operation. See{" "}
            <a
              href="https://vercel.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Vercel&apos;s Privacy Policy
            </a>{" "}
            for details on how they handle this data.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">6. Contact form</h2>
          <p>
            The{" "}
            <Link href="/contact" className="text-accent hover:underline">
              contact page
            </Link>{" "}
            lets you send a message to us via email. The form constructs a{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">mailto:</code> link that
            opens your email client; your message is not submitted to or stored by DevBench
            until you send it through your own email provider. We retain contact messages only
            as long as necessary to respond.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">7. Children&apos;s privacy</h2>
          <p>
            DevBench is not directed at children under 13 years of age. We do not knowingly
            collect personal information from children under 13. If you believe a child has
            submitted personal information to us, please{" "}
            <Link href="/contact" className="text-accent hover:underline">
              contact us
            </Link>{" "}
            and we will promptly delete it.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">8. Your rights</h2>
          <p>
            Because DevBench does not collect personal data through tool usage, there is
            generally no data stored about you to access, correct, or delete. If you have
            contacted us and wish to have your message deleted from our records, please reach
            out and we will honour that request promptly.
          </p>

          <h2 className="text-lg font-semibold text-foreground pt-2">9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy as the site evolves — for example, when new
            tools or features are added. The &ldquo;last updated&rdquo; date at the top of
            this page reflects the most recent revision. Continued use of DevBench after a
            change constitutes acceptance of the updated policy.
          </p>

          <p className="pt-2">
            Questions about this policy?{" "}
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
