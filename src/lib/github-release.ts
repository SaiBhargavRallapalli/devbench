import { GITHUB_REPOSITORY } from "@/lib/distribution";

export type GitHubReleaseSummary = {
  tagName: string;
  version: string;
  publishedAt: string;
  htmlUrl: string;
  dmgArm64Url: string | null;
  dmgX64Url: string | null;
};

type GhRelease = {
  tag_name: string;
  published_at: string;
  html_url: string;
  assets: { name: string; browser_download_url: string }[];
};

/** Latest published GitHub release (for /download page). Cached 1 hour. */
export async function fetchLatestGitHubRelease(): Promise<GitHubReleaseSummary | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_REPOSITORY}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return null;

    const data = (await res.json()) as GhRelease;
    const version = data.tag_name.replace(/^v/, "");
    const find = (pattern: RegExp) =>
      data.assets.find((a) => pattern.test(a.name))?.browser_download_url ?? null;

    return {
      tagName: data.tag_name,
      version,
      publishedAt: data.published_at,
      htmlUrl: data.html_url,
      dmgArm64Url: find(/arm64\.dmg$/i),
      dmgX64Url: find(/x64\.dmg$/i),
    };
  } catch {
    return null;
  }
}
