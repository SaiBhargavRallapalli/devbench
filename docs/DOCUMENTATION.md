# Documentation map

This file lists **maintainer and contributor** documentation in this repository. Update it when you add new guides or change how we ship.

| Area | Document | What you’ll find |
|------|----------|------------------|
| **Getting involved** | [`CONTRIBUTING.md`](../CONTRIBUTING.md) | How to set up, PR expectations, licensing. |
| **Conduct** | [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) | Community standards (Contributor Covenant). |
| **Security reports** | [`SECURITY.md`](../SECURITY.md) | How to report vulnerabilities responsibly. |
| **Architecture** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Stack, routes, workspaces vs `/tools`, shared modules, layout conventions. |
| **Security** | [`DEVBENCH-THREAT-MODEL.md`](./DEVBENCH-THREAT-MODEL.md) | Threat model, `/api/proxy`, CSP, third parties. |
| **Data flow** | [`SECURITY-DATA-FLOW-MATRIX.md`](./SECURITY-DATA-FLOW-MATRIX.md) | Which tools use the network or `localStorage`. |
| **Operations** | [`RUNBOOK.md`](./RUNBOOK.md) | Build, deploy, rollback, E2E smoke, CSP checklist. |
| **Packaging** | [`PACKAGING.md`](./PACKAGING.md) | Homebrew formula template and macOS `.dmg` release options. |
| **Performance** | [`PERFORMANCE-BUDGET.md`](./PERFORMANCE-BUDGET.md) | Lab / RUM targets for flagship routes. |
| **Debt triage** | [`TECH-DEBT.md`](./TECH-DEBT.md) | How we prioritise refactors vs fixes. |
| **E2E smoke** | [`e2e/smoke.spec.ts`](../e2e/smoke.spec.ts), [`playwright.config.ts`](../playwright.config.ts) | Playwright smoke; run with `npm run test:e2e`. |
| **PR checklist** | [`.github/PULL_REQUEST_TEMPLATE.md`](../.github/PULL_REQUEST_TEMPLATE.md) | Definition of done for reviewers and authors. |

**Suggested reading order for a new contributor:** `CONTRIBUTING.md` → `ARCHITECTURE.md` → `DEVBENCH-THREAT-MODEL.md` (sections 1–4) → run `npm run build` (and `npm run test:e2e` if you touch navigation or flagship pages).
