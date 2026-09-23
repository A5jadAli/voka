# Voka 1.4 implementation and release requirements

Status: internal preview 1.4.0 (11) built, installed and smoke-tested on Android, with backend migrations/functions deployed. Public-release gates remain below. Billing is unchanged and out of scope. See `release-verification-1.4.md` for the observed results and limitations.

## Deployment order

1. Review and apply all five `20260923*` migrations after the existing learning-state migrations. The last migration adds an explicit singleton filter for hosted database safe-update rules. The new client needs the `foundations` and `writing` columns; without them cloud sync reports failure and retries, while scoped local progress remains available.
2. Deploy `voice-cleanup`, then run `node scripts/configure-voice-cleanup.mjs feemunsltbbkkqyvorjn`. The script generates a private credential in memory, stores it in Supabase secrets and Vault, schedules a minute-by-minute job, and checks worker health. It never writes the credential to disk or logs. Then deploy the matching `realtime-session` Edge Function. It fails closed if quotas or worker health are absent or broken.
3. Build and test a new Android binary. `expo-secure-store` is a new native dependency. Version 1.4.0 has an app-version runtime boundary and must not be published as a compatible OTA for 1.3.0.
4. Validate auth-token migration, account switching, app backgrounding, microphone permission races, audio interruption and keyboard behavior on the actual device before distribution.

Do not deploy the Edge Function before its quota migration. Do not distribute the client before its learning-state migrations. Deployment changes additive schemas and service configuration, not users' existing learning records.

## Storage and migration behavior

- Native auth tokens are stored in SecureStore in bounded Unicode-safe chunks, with a manifest committed last. Plaintext legacy tokens are removed only after successful secure persistence. Logout writes a tombstone to prevent stale legacy credentials reappearing. Web auth storage is unchanged.
- Learning state is scoped to the authenticated user ID or a separate guest profile. Pending writes retain the scope that created them. Offline sign-out does not assign the departing account’s progress to the next account.
- Learning screen contents unmount during account-scope transitions, clearing private transcripts and form state held in navigation history. The root navigator stays mounted, and auth recovery can finish across session changes.
- Guest practice is separate and is not automatically imported into an account. A deliberate, user-confirmed guest-import flow is still future work.
- Known legacy state migrates to its recorded owner. Unowned legacy state encountered while signed in is preserved under `legacy-unassigned`, not uploaded to that account. Original legacy copies are retained for recovery. A user-facing recovery/import tool remains to be built.
- Successful account deletion removes that account’s local learning data on this device. Ordinary sign-out retains scoped offline data. It does not erase another account or the guest profile.
- Cloud sync requires a successful initial read before uploading. Retries preserve local dirty preferences and merge additive progress. This is not conflict-free real-time editing: preferences are coarse-grained and foundation drafts use timestamps. Review offline/double-device conflict UX before claiming seamless multi-device editing.

## AI request limits are not spending caps

The database allocates requests atomically under a per-kind/day lock. Clients cannot write quota configuration or usage, or execute the allocation function. The backend obtains anonymous status from `auth.users`, not a client flag.

| Request                | Guest/day | Account/day | Global/day | User cooldown |
| ---------------------- | --------: | ----------: | ---------: | ------------: |
| Voice session creation |         2 |          10 |         50 |    10 seconds |
| Spoken assessment      |         2 |          20 |        200 |     5 seconds |

Days reset at midnight UTC. Upstream failures still consume an allocated request. An assessment may try the configured provider and one fallback, so request counts are not identical to provider-call counts.

Assessment output is bounded to 2,000 generated tokens. xAI uses `grok-4.6` with documented low reasoning effort for this short, latency-sensitive task; the existing Tough Coach prompt is retained. A live synthetic transcript test succeeded through xAI after this setting change. The OpenAI fallback also passed a separate live test. Neither is evidence of rubric calibration or teaching effectiveness.

These defaults are conservative starting values, not a capacity forecast. Voice now reserves one active call per user and at most four globally under a database lock. The server stores the provider call ID privately and sets a five-minute expiry. The client stops locally at that deadline and requests authenticated, ownership-checked hangup when leaving. A durable worker also hangs up expired calls every minute, including calls whose client disappeared. Failed hangups retain their lease for retry. A stale worker heartbeat blocks new calls after three minutes. Scheduler/provider outages can delay termination; this is not a hard currency budget. CAPTCHA/anonymous-signup abuse controls, provider spending settings, retention policy and alerting still require owner review before public release.

Official [server-control documentation](https://developers.openai.com/api/docs/guides/voice-server-controls) and the [hangup API](https://developers.openai.com/api/reference/resources/realtime/subresources/calls/methods/hangup) informed this implementation. Provider call IDs come from the creation response's Location header, not its request ID. Server keys never reach the app.

## Dependency audit: patched, with compatibility coverage

`npm audit` on 2026-09-23 reports zero vulnerabilities after two narrowly scoped overrides:

- Expo Router uses `query-string@9.5.1` and patched `decode-uri-component@0.5.0`. Its postinstall compatibility patch exposes the existing named exports required by Router 57, without replacing the parser. Browser tests caught the unpatched default-export incompatibility. The patch is version-guarded and must be reviewed when upgrading Router/query-string.
- Xcode project tooling uses `uuid@11.1.1`, retaining CommonJS support. Its actual `generateUuid()` consumer and Expo prebuild configuration have been checked.

Do not run `npm audit fix --force`: its suggested Expo/Router downgrades are incompatible with this SDK 57 project.

## Learning scope and content validation

The German guided sequence has 13 lessons: six A1-targeted, four A2-targeted and three B1-targeted. It includes 54 translated phrases, 26 meaning/reading checks, 13 constrained writing prompts and optional self-reported speaking. It is not a complete CEFR syllabus. Audio is device text-to-speech, not a native-speaker recording or a pronunciation score. Missing language voices show a text fallback; installed voice support determines offline audio availability.

German writing checks authored accepted responses, not arbitrary grammar. Results preserve first-try errors instead of converting corrected guesses into a perfect initial score. Review suggestions appear after 24 hours; no notification is sent. Repeats use the same checks, not unseen level assessments. English now has three original reading texts, nine evidence-based questions, and chart/letter/opinion writing with saved drafts, submitted responses, model examples and clearly labelled rule-based revision prompts. The optional IELTS guide links all four skills and distinguishes Academic and General Training writing; it is not a full timed mock exam or band-scoring service.

The [Goethe A1 practice scope](https://www.goethe.de/ins/de/de/prf/prf/gzsd1/ueb.html) covers listening, reading, writing and speaking. It informs the coverage review, but Voka’s original exercises are not Goethe-approved. Educator review, unseen assessments and actual learner testing remain required. See `curriculum-coverage.md` for specific coverage and limitations.

## Verification

- `npm run validate`: Expo doctor, formatting, TypeScript, lint and unit tests.
- `npm run test:e2e`: compact and modern Android-sized browser layouts, including mocked voice failure/permission races, language persistence, lesson discovery, beginner completion and draft recovery. Browser profiles are not physical Android testing.
- `npx deno check --config supabase/functions/realtime-session/deno.json --frozen supabase/functions/realtime-session/index.ts`.
- SQL tests in `supabase/tests/` run only against a disposable database. Local PostgreSQL tests cover quotas, cooldowns, client privilege restrictions, foundation row isolation and size bounds. A 32-request concurrent allocation experiment with a global limit of 7 allowed exactly 7 and rejected 25.

The synthetic live and physical-device checks do not establish provider quality, teaching effectiveness, every real user's migration outcome or comprehensive native accessibility compliance.

## Owner-controlled public-release gates

- Supabase's security advisor reports leaked-password protection disabled. No paid-plan change was made. Enable it in Auth settings if supported by the project's plan; keep the existing 15-character minimum and no composition rules.
- Provider spending alerts/limits, CAPTCHA or equivalent anonymous-signup abuse controls, business privacy/retention details and operational alerting require owner review before public distribution.
- The two scheduler-policy warnings concern Supabase-owned `cron` tables. Direct checks confirm neither `anon` nor `authenticated` has schema usage, so clients cannot access those tables. The provider-owned public table grants cannot be fully revoked by the project's `postgres` role; do not describe the advisor as entirely clean.
