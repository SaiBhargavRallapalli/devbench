# CTO operating system — deliverable index

Maps the **eight CTO pillars** to concrete artifacts in this repo. Update this file when adding or retiring a deliverable.

| # | Pillar | Artifact | Purpose |
|---|--------|----------|---------|
| 1 | **Reliability as product** | [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts), [`playwright.config.ts`](../playwright.config.ts), `npm run test:e2e` | Smoke paths for flagship routes; run locally or in CI with `PLAYWRIGHT_BASE_URL`. |
| 2 | **Security & data-flow clarity** | [`DEVBENCH-THREAT-MODEL.md`](./DEVBENCH-THREAT-MODEL.md), [`SECURITY-DATA-FLOW-MATRIX.md`](./SECURITY-DATA-FLOW-MATRIX.md) | Threat model + tool/network/storage matrix for reviews. |
| 3 | **Architecture boundaries** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Stack, routing, workspaces, share fragments, layout contracts. |
| 4 | **Performance budget** | [`PERFORMANCE-BUDGET.md`](./PERFORMANCE-BUDGET.md) | Numeric targets and how to verify (Lighthouse / RUM). |
| 5 | **Platform & deploy hygiene** | [`RUNBOOK.md`](./RUNBOOK.md), [`vercel.json`](../vercel.json), [`next.config.ts`](../next.config.ts) | Deploy, rollback, headers, CSP change checklist. |
| 6 | **Engineering process** | [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) | Definition-of-done checkboxes per PR. |
| 7 | **Technical debt triage** | [`TECH-DEBT.md`](./TECH-DEBT.md) | Priorities and “defer unless…” rules. |
| 8 | **People & bus factor** | [`CONTRIBUTING.md`](../CONTRIBUTING.md), Runbook + Architecture + Threat model | Onboarding, escalation, where truth lives. |

**Quick start for a new engineer:** read `CONTRIBUTING.md` → `ARCHITECTURE.md` → `DEVBENCH-THREAT-MODEL.md` §1–4 → run `npm run build` and `npm run test:e2e` (with dev server or `PLAYWRIGHT_BASE_URL`).
