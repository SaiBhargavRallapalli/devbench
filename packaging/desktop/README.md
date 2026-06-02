# DevBench macOS desktop app

Packages DevBench as a local `.dmg` installer. The app runs a bundled Next.js production server on `127.0.0.1` and opens it in an Electron window (privacy-first: no dependency on the public website).

## Prerequisites

- macOS (Apple Silicon or Intel)
- Node.js 20+
- Repo dependencies installed at the root: `npm ci`

## Build a `.dmg`

From the repository root:

```bash
npm run dist:mac
```

Output: `packaging/desktop/dist/DevBench-<version>.dmg` (and `DevBench.app` inside the build directory).

### Step by step

```bash
# 1. Production Next.js standalone bundle
DESKTOP_BUILD=1 npm run build

# 2. Copy standalone + static + public into resources/
node packaging/desktop/scripts/prepare-standalone.mjs

# 3. Electron + DMG
npm --prefix packaging/desktop ci
npm --prefix packaging/desktop run dist
```

## Run unpackaged (development)

After `npm run build:desktop`:

```bash
cd packaging/desktop
npm install
npx electron .
```

## “App is damaged and can’t be opened”

macOS often shows this for **unsigned** DMGs (quarantine), not a broken build. After installing to `/Applications`:

```bash
xattr -cr /Applications/DevBench.app
```

Then open DevBench again, or right-click → **Open** once.

## Code signing and notarization

Ad-hoc signing (`identity: "-"`) is used when no Developer ID certificate is configured. Full notarization removes Gatekeeper prompts for everyone.

For distribution outside your machine:

1. Enroll in the [Apple Developer Program](https://developer.apple.com/programs/).
2. Create a **Developer ID Application** certificate.
3. Set environment variables before `npm run dist:mac`:

   ```bash
   export CSC_LINK=/path/to/certificate.p12
   export CSC_KEY_PASSWORD=your-cert-password
   export APPLE_ID=you@example.com
   export APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
   export APPLE_TEAM_ID=XXXXXXXXXX
   ```

4. electron-builder will sign and notarize when these are present (see [electron-builder code signing](https://www.electron.build/code-signing)).

## Custom app icon

Add `build/icon.icns` (512×512 source) and set `"icon": "build/icon.icns"` under `build.mac` in `package.json`.

## Size note

The `.dmg` includes the Next.js standalone server and Electron runtime. Expect a large download (hundreds of MB). Homebrew CLI remains the lighter install path; see [`docs/PACKAGING.md`](../../docs/PACKAGING.md).
