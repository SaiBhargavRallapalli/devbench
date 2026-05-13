# DevBench

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI](https://github.com/SaiBhargavRallapalli/all-in-one/actions/workflows/ci.yml/badge.svg)](https://github.com/SaiBhargavRallapalli/all-in-one/actions)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**DevBench** is an open-source collection of **browser-based developer tools** — formatters, encoders, PDF utilities, calculators, and more — built so as much work as possible runs **on your device** (no account required for the public app).

Live site: **[devbench.co.in](https://www.devbench.co.in)**

---

## Why this repo exists

- **Privacy-first by design** — most tools never send your pasted data to our servers.
- **One codebase** — Next.js App Router, shared UI, and a single tool registry.
- **Open to contributions** — fixes, docs, translations, and new tools are welcome under the [MIT License](LICENSE).

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | [Next.js](https://nextjs.org/) 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Hosting (official deployment) | [Vercel](https://vercel.com/) |

This repo follows project-specific Next.js guidance in [`AGENTS.md`](AGENTS.md).

---

## Quick start

**Requirements:** Node.js **20+** (LTS recommended), npm.

```bash
git clone <your-fork-or-upstream-url>
cd all-in-one
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Useful commands:**

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build + TypeScript check |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright smoke tests (see [`docs/RUNBOOK.md`](docs/RUNBOOK.md)) |
| `npm run changelog` | Regenerate `CHANGELOG.md` from git (see script) |

---

## Repository layout (short)

| Path | Role |
|------|------|
| `src/app/` | Routes, layouts, metadata |
| `src/components/` | Shared UI, tool components |
| `src/lib/` | Tool registry, analytics helpers, workspace utilities |
| `docs/` | Architecture, security, runbook, performance notes |
| `e2e/` | Playwright smoke tests |

---

## Contributing

We’re glad you’re here.

1. Read **[`CONTRIBUTING.md`](CONTRIBUTING.md)** and **[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)**.
2. Skim **[`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)** for the full list of engineering guides.
3. Open a PR against the default branch; use the [pull request template](.github/PULL_REQUEST_TEMPLATE.md) when applicable.

**Ideas for first contributions:** documentation, a11y, tests, bug fixes in a single tool, or small UX improvements. Large features are easier to review when discussed first (issue or draft PR).

---

## Security

Please read **[`SECURITY.md`](SECURITY.md)** before reporting vulnerabilities. Operational security notes live in [`docs/DEVBENCH-THREAT-MODEL.md`](docs/DEVBENCH-THREAT-MODEL.md) and [`docs/SECURITY-DATA-FLOW-MATRIX.md`](docs/SECURITY-DATA-FLOW-MATRIX.md).

---

## License

This project is licensed under the **MIT License** — see [`LICENSE`](LICENSE).

---

## Acknowledgments

Built with [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide](https://lucide.dev/), and many excellent open-source libraries listed in `package.json`. Thank you to everyone who reports issues, suggests improvements, and sends pull requests.
