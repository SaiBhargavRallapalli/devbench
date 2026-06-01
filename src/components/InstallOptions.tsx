import Link from "next/link";
import { Apple, Download, Package, Terminal } from "lucide-react";
import InstallCommand from "@/components/InstallCommand";
import {
  APP_VERSION,
  distributionLinks,
  GITHUB_REPOSITORY,
} from "@/lib/distribution";
import type { GitHubReleaseSummary } from "@/lib/github-release";

type InstallOptionsProps = {
  release?: GitHubReleaseSummary | null;
  compact?: boolean;
};

export default function InstallOptions({ release, compact = false }: InstallOptionsProps) {
  const versionLabel = release?.version ?? APP_VERSION;
  const dmgArm64 = release?.dmgArm64Url ?? distributionLinks.dmgLatest.arm64;
  const dmgX64 = release?.dmgX64Url ?? distributionLinks.dmgLatest.x64;
  const hasPublishedRelease = Boolean(release);

  return (
    <div className={compact ? "space-y-6" : "space-y-8"}>
      <section aria-labelledby="install-mac-heading">
        <div className="mb-3 flex items-center gap-2">
          <Apple className="h-5 w-5 text-accent" aria-hidden />
          <h2
            id="install-mac-heading"
            className={compact ? "text-lg font-semibold" : "text-xl font-semibold"}
          >
            macOS desktop app
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Full DevBench UI with a local server — your data stays on your Mac. Signed and
          notarized when release automation has Apple credentials configured.
          {hasPublishedRelease ? (
            <>
              {" "}
              Latest release:{" "}
              <Link
                href={release!.htmlUrl}
                className="text-accent hover:underline font-medium"
              >
                {release!.tagName}
              </Link>
              .
            </>
          ) : (
            <>
              {" "}
              Expected version <strong className="text-foreground">v{versionLabel}</strong> — if
              downloads 404, run the{" "}
              <a
                href={`https://github.com/${GITHUB_REPOSITORY}/actions/workflows/release.yml`}
                className="text-accent hover:underline"
              >
                Release workflow
              </a>{" "}
              on GitHub.
            </>
          )}
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={dmgArm64}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground hover:opacity-90 transition-opacity"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download for Apple Silicon
          </a>
          <a
            href={dmgX64}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden />
            Download for Intel Mac
          </a>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Or install with Homebrew cask (below). All builds:{" "}
          <Link href={distributionLinks.releasesPage} className="text-accent hover:underline">
            GitHub Releases
          </Link>
          .
        </p>
      </section>

      <section aria-labelledby="install-brew-heading">
        <div className="mb-3 flex items-center gap-2">
          <Package className="h-5 w-5 text-accent" aria-hidden />
          <h2
            id="install-brew-heading"
            className={compact ? "text-lg font-semibold" : "text-xl font-semibold"}
          >
            Homebrew
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Tap once, then install the <strong className="text-foreground">CLI</strong> and/or the{" "}
          <strong className="text-foreground">desktop app</strong> (cask).
        </p>
        <div className="space-y-3">
          <InstallCommand command={distributionLinks.brew.tap} label="1. Add tap" />
          <InstallCommand
            command={distributionLinks.brew.installDesktop}
            label="2a. Desktop app (GUI)"
          />
          <InstallCommand
            command={distributionLinks.brew.installCli}
            label="2b. Terminal CLI only"
          />
        </div>
      </section>

      <section aria-labelledby="install-cli-heading">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-5 w-5 text-accent" aria-hidden />
          <h2
            id="install-cli-heading"
            className={compact ? "text-lg font-semibold" : "text-xl font-semibold"}
          >
            Terminal CLI
          </h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground leading-relaxed">
          Pipe JSON through formatters and encoders from your shell — no GUI required.
        </p>
        <InstallCommand command={distributionLinks.brew.oneLinerCli} />
        <p className="mt-3 text-sm text-muted-foreground font-mono">
          echo &apos;{`{"ok":true}`}&apos; | devbench json-format
        </p>
      </section>
    </div>
  );
}
