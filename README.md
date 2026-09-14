# Voka

Voka trains learners to understand how people actually speak—not only the careful language used in courses. The investor MVP supports English and German and is structured so more languages can use the same lesson engine.

## MVP experience

- Six English and German real-world listening scenarios
- Normal and slow device speech playback
- Target-language, plain-meaning, and no-subtitle modes
- Explanations of blended, shortened, and context-dependent phrases
- Comprehension checks with retry feedback
- Progress stored locally on the device
- Responsive investor-review screens based on the supplied Claude design
- OpenAI Realtime voice conversations with natural interruption
- Live English/German captions and conservative struggle signals
- Optional Supabase accounts and a protected server-side provider key
- A skippable first-run tour with an account-optional guest path
- Non-blocking Android update notices with Update and Later choices

Offline listening lessons need no API key. Live voice uses a protected Supabase Edge Function; the OpenAI key is never bundled in the APK.

## Stack and compatibility

- Expo SDK 57 and React Native 0.86
- TypeScript 6 in strict mode
- Expo Router
- Zustand and AsyncStorage
- OpenAI Realtime over WebRTC and a Supabase Edge Function
- Jest and Playwright

Expo SDK 57 targets Android 7+ and iOS 16.4+. A Mac is not required for development or cloud builds, but final iOS App Store release work requires an Apple Developer account.

The current WebRTC package is excluded from Expo Doctor's directory-metadata check because its
own maintained project documents Android, iOS, and Expo support while the directory only marks
New Architecture testing as unknown. Native compilation remains a required release check.

## Setup

```bash
npm ci
npm start
```

Copy `.env.example` to `.env.local` and add the public URL and publishable key from your Supabase
project. Enable anonymous sign-ins in Supabase Auth, then deploy the protected function:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase secrets set OPENAI_API_KEY=YOUR_KEY
npx supabase functions deploy realtime-session
```

Enter the provider key only in the hidden terminal prompt or Supabase dashboard—not in this
repository, the APK, a screenshot, or chat. A custom development build is required because live
voice includes native WebRTC code; Expo Go cannot run that module.

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

### Publishing an optional APK update

The app reads [`app-version.json`](./app-version.json) at launch. It shows nothing unless that file
contains a version newer than the installed app and a valid HTTPS APK URL. To publish an update:

1. Upload the signed APK to a stable HTTPS address such as a GitHub Release asset.
2. Set `latestVersion`, `apkUrl`, and short release notes in `app-version.json`.
3. Commit and push the manifest. Existing users will see **Update** and **Later**; Later hides the
   notice for 24 hours and the app remains fully usable.

Keep `apkUrl` empty while no public APK is ready. Store-distributed builds can later use the same
UI with their Play Store or App Store listing URL.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch workflow.
