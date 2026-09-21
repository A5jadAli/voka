# Voka

Voka trains learners to understand how people actually speak, not only the careful language used in courses. The investor MVP supports English and German and is structured so more languages can use the same lesson engine.

## MVP experience

- Six English and German real-world listening scenarios
- Normal and slow device speech playback
- Target-language, plain-meaning, and no-subtitle modes
- Explanations of blended, shortened, and context-dependent phrases
- Comprehension checks with retry feedback
- Account progress and preferences synced through Supabase; guest progress remains on-device
- Responsive investor-review screens based on the supplied Claude design
- OpenAI Realtime voice conversations with natural interruption
- Live English/German captions and conservative struggle signals
- Optional Supabase accounts and a protected server-side provider key
- A skippable first-run tour with an account-optional guest path
- Non-blocking EAS Update notices with Restart and Later choices

Offline listening lessons need no API key. Live voice uses OpenAI Realtime through a protected
Supabase Edge Function. Structured assessment uses xAI when configured and falls back to OpenAI;
provider keys are never bundled in the APK.

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
npx supabase secrets set XAI_API_KEY=YOUR_XAI_KEY
npx supabase db push
npx supabase functions deploy realtime-session delete-account
```

Enter the provider key only in the hidden terminal prompt or Supabase dashboard, not in this
repository, the APK, a screenshot, or chat. A custom development build is required because live
voice includes native WebRTC code; Expo Go cannot run that module.

Voka Plus uses RevenueCat and remains hidden until a real store offering exists. Configure a
`voka_plus` entitlement, a current offering with a monthly package, and these EAS environment
variables before making a store build:

```text
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
```

These are RevenueCat public SDK keys, never secret REST keys. The paywall reads the localized price
from the store and includes purchase, restore, and subscription-management flows.

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

### Publishing app updates

JavaScript and asset updates are delivered through the configured EAS Update channel. Native
dependency or permission changes require a new preview APK or production store build. VOKA does
not download unsigned APKs from an app-maintained URL.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the branch workflow.
