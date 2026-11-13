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

        <section className="mt-10 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-base font-semibold text-foreground">Choosing an install option</h2>
          <p>
            There are three ways to use DevBench, and they are not interchangeable. The{" "}
            <strong className="text-foreground">browser app</strong> is the full product — every
            tool, the workspace hubs, and the blog, with no account and nothing to update. The{" "}
            <strong className="text-foreground">terminal CLI</strong> is a small Homebrew
            package for scripts and shell workflows: pipe JSON in, get formatted output back,
            without opening a browser. The{" "}
            <strong className="text-foreground">desktop app</strong> packages the workspace as a
            native macOS window when you want it out of your browser tabs. If you only ever
            paste-and-copy in a tab, start with the browser app and skip installing anything.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6">
            Terminal CLI: install, run, update
          </h2>
          <p>
            The CLI ships through the DevBench Homebrew tap and requires macOS with{" "}
            <a
              href="https://brew.sh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Homebrew
            </a>{" "}
            installed. Add the tap once, then install:
          </p>
          <pre className="rounded-lg bg-muted/40 p-3 font-mono text-xs overflow-x-auto">{`brew tap SaiBhargavRallapalli/devbench
brew install devbench`}</pre>
          <p>
            It reads from standard input, so it composes with the usual shell building blocks —
            curl a payload, pipe it through a formatter, write the result to a file:
          </p>
          <pre className="rounded-lg bg-muted/40 p-3 font-mono text-xs overflow-x-auto">{`echo '{"ok":true}' | devbench json-format`}</pre>
          <p>
            Keep it current with <code className="rounded bg-muted px-1">brew upgrade devbench</code>{" "}
            and remove it with{" "}
            <code className="rounded bg-muted px-1">brew uninstall devbench</code>; the tap itself
            can be dropped with{" "}
            <code className="rounded bg-muted px-1">brew untap SaiBhargavRallapalli/devbench</code>.
            Neither the CLI nor the browser app collects an account or usage profile — the CLI
            processes stdin locally, and the browser app never sends your file contents anywhere.
          </p>

          <h2 className="text-base font-semibold text-foreground mt-6">
            Releases, versions, and troubleshooting
          </h2>
          <p>
            Every published version is tagged on GitHub, where the{" "}
            <a
              href="https://github.com/SaiBhargavRallapalli/devbench/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              releases page
            </a>{" "}
            lists changelogs and source archives. If a brew install fails, the usual culprits are
            a stale Homebrew cache (run <code className="rounded bg-muted px-1">brew update</code>{" "}
            first) or an outdated macOS version — the CLI targets the current and previous macOS
            releases. For anything that does not resolve from the changelog,{" "}
            <Link href="/contact" className="text-accent hover:underline">
              open a contact form
            </Link>{" "}
            with the exact command output, or{" "}
            <a
              href="https://github.com/saibhargavrallapalli/devbench/issues/new"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              raise an issue
            </a>{" "}
            on GitHub.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}
