# Production release setup

## 1. Tag push blocked (GH013)?

The repo has a **protect-releases** ruleset on `refs/tags/v*`. **Repository admins** can bypass it when pushing tags.

**Recommended (admin):**

```bash
git tag -f v0.1.0 origin/main   # or the release commit
git push origin v0.1.0
# remote should say: "Bypassed rule violations for refs/tags/v0.1.0"
```

That push triggers the **Release** workflow (`on: push: tags: v*`), which builds DMGs and publishes the GitHub Release.

**If you are not an admin:**

- Ask an admin to push the tag, or
- Run **Actions → Release → Run workflow** *after* the tag exists (see below).

**Verified 2026-11-02 — do not retry these dead ends:**

- Adding **GitHub Actions** (Integration, actor id `15368`) as a bypass actor is rejected on this personal-account repo: `422 Actor GitHub Actions integration must be part of the ruleset source or owner organization`.
- `GITHUB_TOKEN` therefore **cannot** create `v*` tags here (observed: GH013 `pre_receive Repository rule violations`, run 27461834178), so **`workflow_dispatch` fails whenever the tag doesn't exist yet** — the publish step dies creating it.
- What works: admin tag push (ruleset bypass, message above), or dispatch **with a pre-existing tag** (the publish step then skips tag creation). Uploading release assets works either way once the tag exists.

---

## 2. GitHub Actions secrets (this repo)

Add under **Settings → Secrets and variables → Actions**:

| Secret | Required | Purpose |
|--------|----------|---------|
| `HOMEBREW_TAP_GITHUB_TOKEN` | For tap auto-update | PAT with `contents: write` on `homebrew-devbench` |
| `CSC_LINK` | For signed DMGs | Base64-encoded `.p12` Developer ID Application cert |
| `CSC_KEY_PASSWORD` | With `CSC_LINK` | Certificate export password |
| `APPLE_ID` | For notarization | Apple ID email |
| `APPLE_APP_SPECIFIC_PASSWORD` | For notarization | [App-specific password](https://appleid.apple.com) |
| `APPLE_TEAM_ID` | For notarization | Team ID from Apple Developer |

**Status (2026-11-02): no secrets are configured yet** — `gh secret list` is empty and the `Preview`/`Production` environments have none either. Until `HOMEBREW_TAP_GITHUB_TOKEN` exists, the Homebrew job logs a warning and skips the tap push (the run stays green); without `CSC_LINK`, DMGs are ad-hoc signed.

**Never commit tokens or certificates to the repo.** If a PAT was pasted in chat or committed, **revoke it immediately** and create a new one.

### Encode certificate for `CSC_LINK`

```bash
base64 -i DeveloperID.p12 | pbcopy
# Paste into GitHub secret CSC_LINK
```

Without signing secrets, CI still builds **unsigned** DMGs (fine for testing; users see a Gatekeeper warning until you allow the app).

---

## 3. Homebrew tap repository

Create **`SaiBhargavRallapalli/homebrew-devbench`** with:

```text
Formula/devbench.rb
Casks/devbench.rb
README.md
```

Copy `README.md` from [`packaging/homebrew/tap-README.example.md`](../packaging/homebrew/tap-README.example.md).

---

## 4. Ship release

Primary (verified) — admin tag push triggers the pipeline:

```bash
git tag v0.1.1 origin/main   # or the release commit
git push origin v0.1.1       # expect: "Bypassed rule violations for refs/tags/v0.1.1"
```

Secondary — **Actions → Release → Run workflow** with the `version` input, but only when that tag already exists (§1).

Verify:

- [GitHub Releases](https://github.com/SaiBhargavRallapalli/devbench/releases) lists `DevBench-arm64.dmg` and `DevBench-x64.dmg`
- [devbench.co.in/download](https://www.devbench.co.in/download) shows install options
- `brew tap SaiBhargavRallapalli/devbench && brew install --cask devbench`
