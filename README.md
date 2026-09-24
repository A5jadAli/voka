# Voka

Voka combines guided German and English practice with a live speaking coach. German starts with English-supported first words and develops into selected practical A2/B1 tasks. It is not yet a complete or independently validated CEFR course.

## Current experience

- Six English and German real-world listening scenarios
- Thirteen guided German lessons with translated phrases, contextual reading, meaning checks, saved writing and optional speaking rehearsal
- English reading with evidence-based questions; chart, letter and opinion writing with persistent drafts and revision prompts
- Starting-ability and goal selection, including optional IELTS Academic/General Training preparatory guidance
- Normal and slow device speech playback
- Target-language, plain-meaning, and no-subtitle modes
- Explanations of blended, shortened, and context-dependent phrases
- Comprehension checks with retry feedback
- Account progress and preferences synced through Supabase; guest progress remains on-device
- Labelled primary navigation and a visible next practice recommendation
- OpenAI Realtime voice conversations with natural interruption
- Live English/German captions and conservative struggle signals
- Optional Supabase accounts and a protected server-side provider key
- A skippable first-run tour with an account-optional guest path
- Non-blocking EAS Update notices with Restart and Later choices
- Account-scoped offline learning data, SecureStore native auth tokens and visible cloud-sync retry status
- Server request quotas, voice concurrency limits and durable abandoned-call cleanup

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
npx supabase functions deploy voice-cleanup
# This script is intentionally restricted to the existing Voka project.
node scripts/configure-voice-cleanup.mjs feemunsltbbkkqyvorjn
npx supabase functions deploy realtime-session delete-account
```

Enter the provider key only in the hidden terminal prompt or Supabase dashboard, not in this
repository, the APK, a screenshot, or chat. A custom development build is required because live
voice includes native WebRTC code; Expo Go cannot run that module.

Voka Plus has purchase/restore UI, server-verified entitlements, signed RevenueCat
webhooks and atomic daily AI allowances. **Billing is disabled by default and is not
live.** The preview backend and Android OTA are deployed with sales disabled.
Store accounts, approved pricing/allowances, credentials and real store testing are
still required. Follow [subscription setup](docs/subscriptions.md) before enabling sales.

Only the platform-specific RevenueCat public SDK keys belong in EAS app environments:

```text
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
```

Secret REST keys and webhook credentials belong only in Supabase Edge Function
secrets. Store-localized monthly prices are displayed with the configured daily
allowance. Client subscription flags never grant paid AI access.

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

`validate` runs Expo Doctor, formatting, strict TypeScript, zero-warning ESLint, and Jest. `test:e2e` exports the production web bundle and tests key flows at compact and modern Android phone sizes. Its server uses synthetic credentials and a reserved `.test` hostname with intercepted requests, never the real local backend configuration. CI runs both gates independently.

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
