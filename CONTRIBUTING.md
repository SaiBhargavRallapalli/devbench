# Contributing to DevBench

## First day

1. Read **`docs/CTO-DELIVERABLES.md`** — maps engineering expectations to repo files.
2. Skim **`docs/ARCHITECTURE.md`** (routing, workspaces, layout contracts) and **`docs/DEVBENCH-THREAT-MODEL.md`** §1–4 (trust boundaries, proxy).
3. Clone, `npm install`, `npm run dev`, open `/` and `/json`.

## Before you open a PR

- `npm run build`
- `npm run lint` (if configured in your branch)
- For navigation / flagship pages: **`npx playwright install chromium`** once, then `npm run test:e2e` with the dev server running (see **`docs/RUNBOOK.md`**).

Use the **PR template** checkboxes (`.github/PULL_REQUEST_TEMPLATE.md`).

## Where truth lives

| Topic | Doc |
|-------|-----|
| Threats & proxy | `docs/DEVBENCH-THREAT-MODEL.md` |
| Tool × network × storage | `docs/SECURITY-DATA-FLOW-MATRIX.md` |
| Layout & shared modules | `docs/ARCHITECTURE.md` |
| Performance targets | `docs/PERFORMANCE-BUDGET.md` |
| Debt triage | `docs/TECH-DEBT.md` |
| Deploy / E2E / rollback | `docs/RUNBOOK.md` |

## Escalation (bus factor)

1. **Production down / incident** — Vercel rollback (`docs/RUNBOOK.md`); capture timeline and update threat model or runbook if root cause was config.
2. **Security concern** (proxy abuse, XSS, data leak report) — treat as urgent; document in `docs/DEVBENCH-THREAT-MODEL.md` §8 after resolution.
3. **Enterprise block** (Zscaler, etc.) — product + IT; document category for sales/support.

## Next.js in this repo

Follow **`AGENTS.md`** — this project’s Next.js may differ from generic training data; check `node_modules/next/dist/docs/` when unsure.
