import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallOptions from "@/components/InstallOptions";
import MacInstallTroubleshooting from "@/components/MacInstallTroubleshooting";
import { fetchLatestGitHubRelease } from "@/lib/github-release";
import { SHOW_MAC_APP_DOWNLOAD } from "@/lib/distribution";

export default async function DownloadPage() {
  const release = await fetchLatestGitHubRelease();

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
        <h1 className="text-3xl font-bold tracking-tight">Install DevBench</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Use DevBench in the browser at no install cost. The terminal CLI is available for
          scripts and automation.
          {SHOW_MAC_APP_DOWNLOAD
            ? " The macOS desktop app can be installed from the options below."
            : " The macOS desktop app installer is temporarily unavailable."}
        </p>

        <div className="mt-10">
          <InstallOptions release={release} />
        </div>

        {SHOW_MAC_APP_DOWNLOAD ? <MacInstallTroubleshooting /> : null}

        <section className="mt-10 rounded-xl border border-border bg-card/50 p-5 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground mb-2">Browser (no install)</h2>
          <p>
            Every tool at{" "}
            <Link href="/" className="text-accent hover:underline">
              devbench.co.in
            </Link>{" "}
            runs in your browser. You can also add the site to your dock from Safari or Chrome
            (Install app) for quick access.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
