import packageJson from "../../package.json";

/** GitHub repo that publishes DevBench releases (DMGs + source archives). */
export const GITHUB_OWNER = "SaiBhargavRallapalli";
export const GITHUB_REPO = "devbench";
export const GITHUB_REPOSITORY = `${GITHUB_OWNER}/${GITHUB_REPO}` as const;

export const HOMEBREW_TAP = "SaiBhargavRallapalli/devbench";

/** Shipped app version (keep in sync with release tags). */
export const APP_VERSION = packageJson.version;

/** Set true when DMG / desktop install CTAs are ready for public use. */
export const SHOW_MAC_APP_DOWNLOAD = false;

const RELEASES_BASE = `https://github.com/${GITHUB_REPOSITORY}/releases`;

export const distributionLinks = {
  releasesPage: RELEASES_BASE,
  latestRelease: `${RELEASES_BASE}/latest`,
  /** Stable asset names produced by CI (redirect via /releases/latest/download/). */
  dmgLatest: {
    arm64: `${RELEASES_BASE}/latest/download/DevBench-arm64.dmg`,
    x64: `${RELEASES_BASE}/latest/download/DevBench-x64.dmg`,
  },
  dmgVersioned: (version: string = APP_VERSION) => ({
    arm64: `${RELEASES_BASE}/download/v${version}/DevBench-${version}-arm64.dmg`,
    x64: `${RELEASES_BASE}/download/v${version}/DevBench-${version}-x64.dmg`,
  }),
  brew: {
    tap: `brew tap ${HOMEBREW_TAP}`,
    installCli: "brew install devbench",
    installDesktop: "brew install --cask devbench",
    oneLinerCli: `brew tap ${HOMEBREW_TAP} && brew install devbench`,
    oneLinerDesktop: `brew tap ${HOMEBREW_TAP} && brew install --cask devbench`,
  },
} as const;
