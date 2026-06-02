#!/usr/bin/env bash
# Create or update SaiBhargavRallapalli/homebrew-devbench from a published devbench release.
# Usage: ./scripts/bootstrap-homebrew-tap.sh 0.1.0
set -euo pipefail

VERSION="${1:?Usage: $0 <version without v, e.g. 0.1.0>}"
TAG="v${VERSION}"
REPO="SaiBhargavRallapalli/devbench"
TAP="SaiBhargavRallapalli/homebrew-devbench"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

curl -fsSL -o "$TMP/source.tar.gz" \
  "https://github.com/${REPO}/archive/refs/tags/${TAG}.tar.gz"

if [ -z "${SHA256_DMG_ARM64:-}" ] || [ -z "${SHA256_DMG_X64:-}" ]; then
  echo "Downloading release DMGs for checksums (one at a time)..."
  gh release download "$TAG" --repo "$REPO" --dir "$TMP" \
    --pattern "DevBench-${VERSION}-arm64.dmg"
  gh release download "$TAG" --repo "$REPO" --dir "$TMP" \
    --pattern "DevBench-${VERSION}-x64.dmg"
fi

export RELEASE_VERSION="$VERSION"
export GITHUB_REPOSITORY="$REPO"
export SHA256_SOURCE="${SHA256_SOURCE:-$(shasum -a 256 "$TMP/source.tar.gz" | awk '{print $1}')}"
export SHA256_DMG_ARM64="${SHA256_DMG_ARM64:-$(shasum -a 256 "$TMP/DevBench-${VERSION}-arm64.dmg" | awk '{print $1}')}"
export SHA256_DMG_X64="${SHA256_DMG_X64:-$(shasum -a 256 "$TMP/DevBench-${VERSION}-x64.dmg" | awk '{print $1}')}"

node "$ROOT/scripts/release-homebrew.mjs"

if ! gh repo view "$TAP" &>/dev/null; then
  echo "Creating ${TAP}..."
  gh repo create "$TAP" --public --description "Homebrew tap for DevBench (CLI + macOS app)"
fi

TAP_DIR="$(mktemp -d)"
git clone "https://github.com/${TAP}.git" "$TAP_DIR"
mkdir -p "$TAP_DIR/Formula" "$TAP_DIR/Casks"
cp "$ROOT/dist/homebrew/Formula/devbench.rb" "$TAP_DIR/Formula/devbench.rb"
cp "$ROOT/dist/homebrew/Casks/devbench.rb" "$TAP_DIR/Casks/devbench.rb"

if [ ! -f "$TAP_DIR/README.md" ]; then
  cp "$ROOT/packaging/homebrew/tap-README.example.md" "$TAP_DIR/README.md"
fi

cd "$TAP_DIR"
git add Formula/devbench.rb Casks/devbench.rb README.md
git diff --staged --quiet && echo "Tap already up to date" && exit 0
git commit -m "devbench ${VERSION}"
git push origin HEAD

echo "Done. Test with: brew tap SaiBhargavRallapalli/devbench && brew install --cask devbench"
