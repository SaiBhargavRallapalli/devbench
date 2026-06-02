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
- Settings → **Rules** → **protect-releases** → add **GitHub Actions** as a bypass actor (Integration), or
- Run **Actions → Release** after an admin has created tag `v0.1.0` once.

`GITHUB_TOKEN` in Actions **cannot** create tags while the ruleset blocks it unless Actions is in the bypass list. Uploading release assets still works once the tag exists.

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

```bash
# After rules are fixed (optional):
git tag v0.1.0
git push origin v0.1.0
```

Or use **Actions → Release → Run workflow** as above.

Verify:

- [GitHub Releases](https://github.com/SaiBhargavRallapalli/devbench/releases) lists `DevBench-arm64.dmg` and `DevBench-x64.dmg`
- [devbench.co.in/download](https://www.devbench.co.in/download) shows install options
- `brew tap SaiBhargavRallapalli/devbench && brew install --cask devbench`
