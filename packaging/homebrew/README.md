# Homebrew packaging

| Artifact | Template | Installs |
|----------|----------|----------|
| **CLI** (formula) | [`devbench.rb.template`](./devbench.rb.template) | `devbench` / `devbench-cli` terminal commands |
| **Desktop** (cask) | [`Casks/devbench.rb.template`](./Casks/devbench.rb.template) | `DevBench.app` from release `.dmg` files |

Tap setup, secrets, and automation: [`TAP.md`](./TAP.md).

Releases are automated by [`.github/workflows/release.yml`](../../.github/workflows/release.yml) on `v*` tags (DMGs + tap update when `HOMEBREW_TAP_GITHUB_TOKEN` is set).

```bash
brew tap SaiBhargavRallapalli/devbench
brew install devbench              # CLI
brew install --cask devbench       # GUI
```
