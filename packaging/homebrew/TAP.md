# Homebrew tap (`homebrew-devbench`)

Users install from a separate tap repository:

```bash
brew tap SaiBhargavRallapalli/devbench
brew install devbench              # CLI (formula)
brew install --cask devbench       # Desktop app (cask)
```

## Tap repository layout

Create **`SaiBhargavRallapalli/homebrew-devbench`** on GitHub with:

```text
homebrew-devbench/
  Formula/
    devbench.rb      # from devbench.rb.template (CLI)
  Casks/
    devbench.rb      # from Casks/devbench.rb.template (GUI)
  README.md
```

Example tap `README.md`:

```markdown
# homebrew-devbench

```bash
brew tap SaiBhargavRallapalli/devbench
brew install devbench              # terminal CLI
brew install --cask devbench       # macOS desktop app
```
```

## Automated updates (GitHub Actions)

On every **`v*`** tag push, the [Release workflow](../../.github/workflows/release.yml):

1. Builds **arm64** and **x64** `.dmg` files.
2. Publishes them on the GitHub Release for that tag.
3. Regenerates `Formula/devbench.rb` and `Casks/devbench.rb` with correct versions and SHA-256 checksums.
4. Pushes to `homebrew-devbench` when **`HOMEBREW_TAP_GITHUB_TOKEN`** is configured.

### Secrets and tag rules (GH013)

Full checklist: [`.github/RELEASE_SETUP.md`](../../.github/RELEASE_SETUP.md).

| Secret | Purpose |
|--------|---------|
| `HOMEBREW_TAP_GITHUB_TOKEN` | Push Formula + Cask to `homebrew-devbench` |
| `CSC_LINK` | Base64 `.p12` Developer ID Application certificate |
| `CSC_KEY_PASSWORD` | Certificate password |
| `APPLE_ID` | Notarization Apple ID |
| `APPLE_APP_SPECIFIC_PASSWORD` | App-specific password |
| `APPLE_TEAM_ID` | Team ID |

When all Apple secrets are set, CI passes `-c.mac.notarize=true` and produces signed, notarized DMGs. Without `CSC_LINK`, unsigned DMGs are still published (Gatekeeper may warn).

If `git push origin v*` is blocked, run **Actions → Release → Run workflow** instead of pushing tags locally.

## Manual release (no Actions)

```bash
git tag v0.1.0 && git push origin v0.1.0
# After DMGs are on the release page:
export RELEASE_VERSION=0.1.0
export GITHUB_REPOSITORY=SaiBhargavRallapalli/devbench
export SHA256_SOURCE="$(shasum -a 256 devbench-v0.1.0.tar.gz | awk '{print $1}')"
export SHA256_DMG_ARM64="$(shasum -a 256 DevBench-0.1.0-arm64.dmg | awk '{print $1}')"
export SHA256_DMG_X64="$(shasum -a 256 DevBench-0.1.0-x64.dmg | awk '{print $1}')"
node scripts/release-homebrew.mjs
# Copy dist/homebrew/* into the tap repo and push
```
