# Voka gap-closure plan

This is a staged implementation plan, not a claim that the course or release is complete.

## 1. Release safety (core implementation, release gates remain)

- [x] Separate persisted learning data by account, including offline sign-out and account switching.
- [x] Clear private in-memory screens and form state at account boundaries without resetting the root navigator.
- [x] Make cloud-sync failures visible and retry safely without overwriting offline preferences.
- [x] Implement microphone/audio cleanup on screen departure, backgrounding, failure and cancellation.
- [x] Make voice retry start a fresh session and retain assessment evidence on failure.
- [x] Move native authentication tokens to secure storage with a safe migration.
- [x] Add service-role-only, atomic per-user/global request quotas; fail closed when quota checks fail.
- [x] Review dependency advisories and record unresolved compatibility-sensitive fixes.
- [x] Add automated account, sync, voice, audio, storage and SQL failure-case coverage.
- [x] Implement durable session cleanup, worker-health gating and account/global concurrency controls; deploy quotas and storage migrations.
- [ ] Verify provider spending controls and operational alerting with the project owner.
- [x] Resolve both dependency advisory chains with scoped overrides and Router export compatibility, without downgrading Expo.
- [x] Verify native microphone permission/cleanup, writing/signup keyboard behavior and cold-start Home navigation on the connected Android device.
- [ ] Verify a real signed-in account's legacy secure-token migration and comprehensive screen-reader accessibility on physical devices.

## 2. Navigation and first use

- [x] Persist the selected language and use it in primary navigation destinations.
- [x] Keep accessible names on icon-only navigation (visible captions removed at the owner's request) and a discoverable listening library for both languages.
- [x] Replace fixed German path items with real destinations and distinguish practice from level attainment.
- [x] Ask language in onboarding and recommend an English-supported first German lesson on Home.
- [x] Add starting-ability and goal selection with recommendations that genuinely use both.
- [ ] Review all remaining screens with large text, a screen reader and actual first-time users.

## 3. A complete beginner learning loop

- [x] Implement three original introductory German lessons: greetings, names, and asking for help.
- [x] Include English meanings, normal/slow device audio, meaning checks, short writing checks and optional self-reported speaking.
- [x] Persist account-scoped drafts, attempts and first-try results; merge bounded progress into cloud state.
- [x] Suggest review in Learn after 24 hours, with no claim of scheduled notifications.
- [x] Provide correction, retry and a next lesson in this introductory sequence.
- [x] Test completion, draft recovery, incorrect answers and continuation without audio or microphone access.
- [ ] Obtain educator/native-speaker review and actual beginner usability evidence before claiming teaching effectiveness.
- [ ] Add varied unseen checks, due-item retrieval practice, guided reading and meaningful pronunciation feedback.
- [x] Extend English writing with account-scoped/cloud-synced drafts, submitted responses, model examples and honest rule-based revision guidance.
- [x] Run physical-device keyboard, 130% text-size smoke checks and offline German text loading on the final signed APK; see the bounded results in the release verification record.

## 4. German A1, A2 and B1 coverage

- [x] Document the current 13-lesson, four-skill practice coverage and limitations in `curriculum-coverage.md`.
- [x] Add practical life-in-Germany lessons and progressive grammar from first words to selected B1 tasks.
- [ ] Expand to a complete CEFR outcome map with varied, unseen assessments and adaptive review.
- [ ] Obtain German-language educator/native-speaker review and test with actual beginners.
- [ ] Do not claim level attainment from activity counts or a short AI transcript estimate.

## 5. English and optional IELTS preparation

- [x] Add original general-English reading and writing with saved drafts and revision; retain the existing listening library.
- [x] Add optional Academic/General Training goals and a four-skill preparatory practice guide.
- [ ] Add broader listening coverage and full-length exam simulations.
- [ ] Validate assessment rubrics; never imply certified CEFR or IELTS scores.

## Release gates

- Native dependency changes require a new compatible runtime and APK, not an OTA update to an older binary.
- SQL migrations and Edge Function changes require review and coordinated deployment before release.
- Passing navigation tests is not evidence of teaching effectiveness or CEFR course completeness.

See [release notes and verification requirements](release-safety.md) and the observed release record in `release-verification-1.4.md`. External teaching validation is not replaced by automated app testing.
