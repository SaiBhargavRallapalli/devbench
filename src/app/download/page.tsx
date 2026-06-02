import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InstallOptions from "@/components/InstallOptions";
import MacInstallTroubleshooting from "@/components/MacInstallTroubleshooting";
import { fetchLatestGitHubRelease } from "@/lib/github-release";

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
        <h1 className="text-3xl font-bold tracking-tight">Download DevBench</h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Use DevBench in the browser at no install cost, or install the macOS app for an
          offline-capable desktop experience. The CLI is available for scripts and terminals.
        </p>

        <div className="mt-10">
          <InstallOptions release={release} />
        </div>

        <MacInstallTroubleshooting />

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
