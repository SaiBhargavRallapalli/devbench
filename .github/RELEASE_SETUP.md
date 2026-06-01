# Production release setup

## 1. Tag push blocked (GH013)?

If `git push origin v0.1.0` fails with **“Cannot create ref due to creations being restricted”**:

**Option A — Run the Release workflow (recommended)**

1. Merge packaging + workflow changes to `main`.
2. GitHub → **Actions** → **Release** → **Run workflow**.
3. Version: `0.1.0`, enable **Publish release** and **Update Homebrew tap**.
4. The workflow creates the tag and release using `GITHUB_TOKEN` (often allowed when local pushes are not).

**Option B — Relax repository rules**

Settings → **Rules** → rulesets affecting tags → allow **Repository admin** and/or **GitHub Actions** to create tags.

**Option C — Create release in the UI**

Releases → **Draft a new release** → choose tag `v0.1.0` → **Publish**. That triggers the workflow via `release: published`.

Delete the local tag if the remote push failed:

```bash
git tag -d v0.1.0
```

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
