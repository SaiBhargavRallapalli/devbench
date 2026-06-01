# Packaging DevBench

DevBench ships through three channels:

| Channel | What users get |
|---------|----------------|
| **Web** | Full app at [devbench.co.in](https://www.devbench.co.in) |
| **Homebrew formula** | Terminal CLI (`devbench`, `devbench-cli`) |
| **Homebrew cask** | macOS desktop app (`DevBench.app`) |
| **GitHub Release `.dmg`** | Direct download (same binaries as the cask) |

## GitHub Actions release

Pushing a version tag runs [`.github/workflows/release.yml`](../.github/workflows/release.yml):

```bash
git tag v0.1.0
git push origin v0.1.0
```

That workflow:

1. Builds **arm64** and **x64** `.dmg` files on `macos-latest`.
2. Creates a **GitHub Release** with both DMGs attached.
3. Generates updated **Formula** and **Cask** files and pushes them to [`SaiBhargavRallapalli/homebrew-devbench`](https://github.com/SaiBhargavRallapalli/homebrew-devbench) when the `HOMEBREW_TAP_GITHUB_TOKEN` secret is set.

Tap setup and secrets: [`packaging/homebrew/TAP.md`](../packaging/homebrew/TAP.md).

Manual workflow run: **Actions → Release → Run workflow** (build DMGs; optionally publish release and update tap).

## Homebrew (CLI + GUI)

Templates:

- CLI: [`packaging/homebrew/devbench.rb.template`](../packaging/homebrew/devbench.rb.template)
- GUI: [`packaging/homebrew/Casks/devbench.rb.template`](../packaging/homebrew/Casks/devbench.rb.template)

Users install from the tap:

```bash
brew tap SaiBhargavRallapalli/devbench
brew install devbench              # CLI only
brew install --cask devbench       # desktop app (from release DMGs)
```

Generate tap files locally (after you have checksums):

```bash
export RELEASE_VERSION=0.1.0
export GITHUB_REPOSITORY=SaiBhargavRallapalli/devbench
export SHA256_SOURCE=...
export SHA256_DMG_ARM64=...
export SHA256_DMG_X64=...
npm run release:homebrew
# → dist/homebrew/Formula/devbench.rb and dist/homebrew/Casks/devbench.rb
```

Test the formula before publishing:

```bash
brew install --build-from-source ./dist/homebrew/Formula/devbench.rb
echo '{"ok":true}' | devbench json-format
```

## `.dmg` desktop app

The repository includes an **Electron** desktop shell under [`packaging/desktop/`](../packaging/desktop/). It bundles a local Next.js **standalone** server (started on `127.0.0.1`) so API routes and server features work offline without loading the public website.

### Build (macOS)

From the repo root on a Mac:

```bash
npm run dist:mac
```

The installer is written to `packaging/desktop/dist/` (for example `DevBench-0.1.0.dmg`). Details, signing, and icons: [`packaging/desktop/README.md`](../packaging/desktop/README.md).

Manual steps (same as the script):

1. `DESKTOP_BUILD=1 npm run build` — enables `output: "standalone"` in `next.config.ts`.
2. `node packaging/desktop/scripts/prepare-standalone.mjs` — copies `.next/standalone`, static assets, and `public/` into `packaging/desktop/resources/server`.
3. `npm --prefix packaging/desktop ci && npm --prefix packaging/desktop run dist` — produces `DevBench.app` and the `.dmg`.

### Signing and notarization

Local unsigned builds are fine for testing. For public download, sign with a **Developer ID Application** certificate and notarize via electron-builder (see the desktop README).

### Alternatives

| Approach | Status in repo |
|----------|----------------|
| Electron + local Next server | **Implemented** (`packaging/desktop/`) |
| Tauri wrapper | Not implemented; smaller binary, more setup |
| Online-only wrapper (opens devbench.co.in) | Not recommended for privacy positioning |

### Next.js notes

- Route Handlers under `src/app/api` require a running server; standalone + `server.js` covers that.
- `DESKTOP_BUILD=1` is only set for desktop builds so Vercel deployments keep the default output mode.

## Recommendation

- **CLI:** `brew install devbench` — small footprint.
- **Desktop:** `brew install --cask devbench` or download the `.dmg` from GitHub Releases.
- Document the large desktop download size (Next + Electron) in release notes.
