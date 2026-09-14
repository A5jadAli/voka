# Contributing

## Branches

- `main` is always release-ready and protected.
- `dev` is available for integration work that should not ship yet.
- `feature/<short-name>` contains unfinished feature work.
- `fix/<short-name>` contains unfinished bug fixes.

Keep incomplete work on its feature or fix branch. Merge a release-sized change to `main` only after `npm run validate:release` passes. Use `dev` when several unfinished features need to be tested together before promotion.

Do not push unfinished work directly to `main`.

## Before opening a pull request

```bash
npm run validate:release
```

Use a focused commit message such as `feat: add onboarding` or `fix: preserve login session`.
