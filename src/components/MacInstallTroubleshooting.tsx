import CopyButton from "@/components/CopyButton";

const FIX_CMD = "xattr -cr /Applications/DevBench.app";

export default function MacInstallTroubleshooting() {
  return (
    <section
      className="mt-10 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm text-muted-foreground leading-relaxed"
      aria-labelledby="mac-gatekeeper-heading"
    >
      <h2 id="mac-gatekeeper-heading" className="text-base font-semibold text-foreground mb-2">
        “DevBench is damaged and can’t be opened”?
      </h2>
      <p className="mb-3">
        This usually means macOS blocked an <strong className="text-foreground">unsigned</strong> or{" "}
        <strong className="text-foreground">quarantined</strong> download — the app is not corrupt.
        Do <strong className="text-foreground">not</strong> move it to the Bin.
      </p>
      <p className="mb-2 font-medium text-foreground">Fix (after dragging DevBench to Applications):</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-muted/40 p-3">
        <code className="text-xs sm:text-sm font-mono text-foreground break-all">{FIX_CMD}</code>
        <CopyButton text={FIX_CMD} className="shrink-0 self-start sm:self-center" />
      </div>
      <p className="mt-3">
        Run that in Terminal, then open DevBench again. Alternatively: right-click the app →{" "}
        <strong className="text-foreground">Open</strong> → confirm once, or use{" "}
        <strong className="text-foreground">System Settings → Privacy &amp; Security → Open Anyway</strong>.
      </p>
      <p className="mt-3 text-xs">
        Future releases will use Apple notarization when signing secrets are configured. Until then,
        Homebrew (<code className="text-foreground">brew install --cask devbench</code>) clears
        quarantine automatically on install.
      </p>
    </section>
  );
}
