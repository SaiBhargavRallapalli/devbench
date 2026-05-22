# Git hooks (optional)

The **post-commit changelog hook was removed** — it regenerated `CHANGELOG.md` and amended every commit, which slowed down local workflows.

## Update the changelog instead

- **Locally:** `npm run changelog`
- **CI:** GitHub Actions → **Update changelog** (manual), or push a tag like `v1.0.0`

The public site changelog at `/changelog` is maintained separately in `src/app/changelog/page.tsx`.

## If you still have hooks enabled

If you previously ran `git config core.hooksPath .githooks`, unset it:

```bash
git config --unset core.hooksPath
```

Or point hooks elsewhere; this directory no longer runs anything on commit.
