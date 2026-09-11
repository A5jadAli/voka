# Voka

Cross-platform mobile application built with Expo SDK 57, React Native, and TypeScript.

## Requirements

- Node.js 22.13–24.x (Node 24 recommended)
- npm 11
- An Android device/emulator, or an Expo development build

## Setup

```bash
npm ci
npm start
```

Use `npm run android`, `npm run ios`, or `npm run web` for a specific platform. Local iOS simulation requires macOS; EAS builds can compile iOS in the cloud.

## Quality commands

```bash
npm run validate
npm run format
npm run lint:fix
npm run test
```

`npm run validate` is the same quality gate used before pushes and in CI. It runs Expo Doctor, formatting checks, TypeScript, ESLint, and tests.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch and contribution workflow.
