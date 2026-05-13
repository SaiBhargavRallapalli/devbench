# Contributing to DevBench

Thanks for improving DevBench. This guide helps you get productive quickly and align with how the project is structured.

## First steps

1. Read **[`docs/DOCUMENTATION.md`](docs/DOCUMENTATION.md)** — map of all engineering guides in this repo.
2. Skim **[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)** (routing, workspaces, layout conventions) and **[`docs/DEVBENCH-THREAT-MODEL.md`](docs/DEVBENCH-THREAT-MODEL.md)** sections 1–4 (trust boundaries and the API proxy).
3. Fork / clone, run `npm install`, then `npm run dev`, and open `/` and a workspace such as `/json`.

## Before you open a pull request

- `npm run build` passes locally.
- `npm run lint` where applicable.
- If your change affects navigation or flagship pages (`/`, `/json`, `/pdf`, `/graph-calculator`, …): install browsers once with `npx playwright install chromium`, then run `npm run test:e2e` while the dev server is running (see **[`docs/RUNBOOK.md`](docs/RUNBOOK.md)**).

Use the **[pull request template](.github/PULL_REQUEST_TEMPLATE.md)** so reviewers see what you already checked.

## Where to look things up

| Topic | Document |
|-------|----------|
| Threat model & CSP | [`docs/DEVBENCH-THREAT-MODEL.md`](docs/DEVBENCH-THREAT-MODEL.md) |
| Tool × network × storage | [`docs/SECURITY-DATA-FLOW-MATRIX.md`](docs/SECURITY-DATA-FLOW-MATRIX.md) |
| Layout & shared modules | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Performance targets | [`docs/PERFORMANCE-BUDGET.md`](docs/PERFORMANCE-BUDGET.md) |
| Debt / prioritisation | [`docs/TECH-DEBT.md`](docs/TECH-DEBT.md) |
| Deploy, smoke tests, rollback | [`docs/RUNBOOK.md`](docs/RUNBOOK.md) |
| Vulnerability reports | [`SECURITY.md`](SECURITY.md) |

## When something goes wrong in production

- **Outage or bad deploy** — follow rollback steps in [`docs/RUNBOOK.md`](docs/RUNBOOK.md). After recovery, consider updating the runbook or threat model if the root cause was configuration.
- **Security issue** — follow [`SECURITY.md`](SECURITY.md); do not use public issues for undisclosed vulnerabilities.
- **Third-party or corporate firewall blocking the site** — that is usually a policy or categorisation issue on the visitor’s side; document what you learn in an issue (without sensitive corporate data) so we can improve docs or UX.

## Next.js in this repository

Follow **[`AGENTS.md`](AGENTS.md)**. This project may use Next.js APIs that differ from older tutorials; when in doubt, check the guides under `node_modules/next/dist/docs/` for your installed version.

## Licensing

By contributing, you agree your contributions are licensed under the same **MIT** terms as the rest of the project (see [`LICENSE`](LICENSE)).
