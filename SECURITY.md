# Security

Thank you for helping keep DevBench and its users safe.

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security reports.

1. **Preferred:** use [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories) for this repository (tab **Security → Report a vulnerability**), if enabled for the project.
2. **Otherwise:** contact the maintainers via the site’s [Contact](https://www.devbench.co.in/contact) page and include `Security: DevBench` in the subject line.

Include steps to reproduce, affected routes or tools, and impact if you can. We aim to acknowledge reasonable reports promptly.

## Scope notes

- Many tools run **entirely in the browser**; some use **network** features (see `docs/SECURITY-DATA-FLOW-MATRIX.md`).
- The **API tester** uses server-side `POST /api/proxy` — see `docs/DEVBENCH-THREAT-MODEL.md` for design and residual risks.

For defensive coding and CSP, see `docs/DEVBENCH-THREAT-MODEL.md` and `next.config.ts`.
