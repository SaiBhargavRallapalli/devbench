# Packaging DevBench

DevBench can be distributed in two useful ways:

- Homebrew formula for the existing `devbench-cli` command.
- macOS `.dmg` app for users who want DevBench as a desktop application.

The Homebrew path is ready to wire into a release. The `.dmg` path needs a desktop wrapper because this repository is currently a Next.js web app, not a native macOS app.

## Homebrew formula

The formula template lives at [`packaging/homebrew/devbench.rb.template`](../packaging/homebrew/devbench.rb.template). It installs the existing Node CLI as both `devbench` and `devbench-cli`.

Release flow:

1. Tag and push a release:

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

2. Download the generated source archive and calculate its checksum:

   ```bash
   curl -L -o devbench-v0.1.0.tar.gz \
     https://github.com/SaiBhargavRallapalli/devbench/archive/refs/tags/v0.1.0.tar.gz
   shasum -a 256 devbench-v0.1.0.tar.gz
   ```

3. Copy the template into the separate Homebrew tap repository as `Formula/devbench.rb`, then replace:

   - `vVERSION` with the release tag, for example `v0.1.0`.
   - `REPLACE_WITH_RELEASE_TARBALL_SHA256` with the checksum from step 2.

4. Test the formula locally from the tap:

   ```bash
   brew install --build-from-source ./Formula/devbench.rb
   echo '{"ok":true}' | devbench json-format
   brew test devbench
   ```

Recommended tap layout:

```text
homebrew-devbench/
  Formula/
    devbench.rb
```

Users can install the stable release with:

```bash
brew tap SaiBhargavRallapalli/devbench
brew install devbench
```

## `.dmg` desktop app

A `.dmg` requires a macOS desktop shell. There are two viable approaches:

| Approach | Best for | Tradeoff |
|----------|----------|----------|
| Electron wrapper | Fastest `.dmg` path, mature signing/notarization tooling | Larger download size |
| Tauri wrapper | Smaller app and native WebView | More Rust/macOS setup |

Recommended implementation for DevBench:

1. Add a desktop wrapper that opens a bundled local Next.js server.
2. Build the Next app for production.
3. Package the wrapper into a signed `.app`.
4. Create a signed and notarized `.dmg`.

Bundling the local server preserves the privacy-first positioning better than a wrapper that only opens `https://www.devbench.co.in`.

Notes for the Next.js side:

- The app has Route Handlers under `src/app/api`, so a pure static export is not enough for every feature.
- Next.js 16 supports production builds with `next build` and serving them with `next start`; use that as the baseline behavior when wrapping a local server.
- If a smaller server bundle is needed later, evaluate Next's standalone/build-adapter support against the current Next.js 16 docs before changing `next.config.ts`.

## Recommendation

Ship Homebrew first because it is low-risk and already maps to `scripts/devbench-cli.mjs`. The formula vendors the small CLI runtime dependencies through fixed resource checksums, so Homebrew does not need to run `npm install` during installation. Add a `.dmg` once the desired desktop behavior is clear:

- Online wrapper: smaller engineering effort, depends on the public site.
- Offline/local wrapper: more useful for privacy-minded users, requires packaging the Next runtime.
