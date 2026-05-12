## Summary

<!-- What changed and why (1–3 sentences). -->

## Definition of done (check what applies)

- [ ] `npm run build` passes locally.
- [ ] **Layout:** flagship or full-height pages use `shrink-0` on chrome + `flex-1 min-h-0` / `overflow-hidden` where needed (see `docs/ARCHITECTURE.md`).
- [ ] **Network:** new `fetch` / WebSocket / `app/api` route documented in `docs/SECURITY-DATA-FLOW-MATRIX.md` (and threat model if security-relevant).
- [ ] **CSP / headers:** if `next.config.ts` or `vercel.json` changed, followed `docs/RUNBOOK.md` CSP checklist.
- [ ] **A11y:** primary actions reachable by keyboard where applicable.
- [ ] **E2E:** `npm run test:e2e` run against dev or `PLAYWRIGHT_BASE_URL` if this PR touches navigation or flagship routes.

## Risk / rollout

<!-- Any feature flags, migrations, or manual verification steps. -->
