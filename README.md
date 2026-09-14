# Voka

Voka trains learners to understand how people actually speak—not only the careful language used in courses. The investor MVP supports English and German and is structured so more languages can use the same lesson engine.

## MVP experience

- Six English and German real-world listening scenarios
- Normal and slow device speech playback
- Target-language, plain-meaning, and no-subtitle modes
- Explanations of blended, shortened, and context-dependent phrases
- Comprehension checks with retry feedback
- Progress stored locally on the device
- Responsive investor-demo screens based on the supplied Claude design

No API key is required for the MVP. Production AI audio and live subtitles must later use a secure server or short-lived tokens; never put provider secrets in the mobile app.

## Stack and compatibility

- Expo SDK 57 and React Native 0.86
- TypeScript 6 in strict mode
- Expo Router
- Zustand and AsyncStorage
- Jest and Playwright

Expo SDK 57 targets Android 7+ and iOS 16.4+. A Mac is not required for development or cloud builds, but final iOS App Store release work requires an Apple Developer account.

## Setup

```bash
npm ci
npm start
```

For the lightest workflow on a modest laptop, use the web preview for routine UI work:

```bash
npm run web
```

For device-specific feedback, connect a physical Android phone with USB debugging rather than keeping the emulator open. Android Studio is useful for SDK management and native debugging; normal app code can be written and tested from this repository.

## Quality gates

```bash
npm run validate
npm run test:e2e
npm run validate:release
```

`validate` runs Expo Doctor, formatting, strict TypeScript, zero-warning ESLint, and Jest. `test:e2e` exports the production web bundle and tests key flows at compact and modern Android phone sizes. CI runs both gates independently.

## Installable Android build

The `preview` EAS profile produces a directly installable APK:

```bash
npm run build:android:preview
```

EAS prints a private build link that can be opened on an Android phone. A production Play Store build uses `npm run build:android:production` and produces the store format instead.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch workflow.
