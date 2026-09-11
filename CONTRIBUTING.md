# Contributing

## Branches

- `main` is always release-ready and protected.
- `dev` contains completed, reviewed features awaiting a release.
- `feature/<short-name>` contains unfinished feature work.
- `fix/<short-name>` contains unfinished bug fixes.

Start work from `dev`. Keep incomplete work on its feature or fix branch. When it is complete and `npm run validate` passes, open a pull request into `dev`. Promote a tested release from `dev` to `main` with a pull request.

Do not push unfinished work directly to `main` or `dev`.

## Before opening a pull request

```bash
npm run validate
```

Use a focused commit message such as `feat: add onboarding` or `fix: preserve login session`.
