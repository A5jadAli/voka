# Subscription preparation preview release

Date: 24 September 2026. Internal Android preview only. Payments are not live.

## Deployed backend

- Project: `feemunsltbbkkqyvorjn`. Only the reviewed
  `20260924000000_subscriptions.sql` migration was pending and applied. No seed,
  role or Vault changes were requested.
- `subscription-status` version 1, `revenuecat-webhook` version 1 and
  `realtime-session` version 17 are active. Existing `voice-cleanup` and
  `delete-account` functions were not redeployed.
- Live configuration confirms `enabled = false`, `sales_enabled = false`, empty
  store product IDs and zero paid allowances. No RevenueCat keys were added.
- Free account allowances remain 10 voice starts and 20 assessments per UTC day;
  guest allowances remain two of each. Global caps remain 50 and 200 respectively.
- Client roles cannot update subscription configuration or execute the private
  subscription access RPC. Unauthenticated status/practice requests return 401.
  The unconfigured webhook returns 503 and cannot grant access.
- The existing voice-cleanup heartbeat was healthy and no active voice leases
  were present during verification. No microphone or paid provider test was run.

## Published OTA

- Android preview channel and branch, runtime `1.4.0`; compatible with the existing
  installed preview APK 1.4.0 (11). No native dependency or app configuration change.
- Update group: `c269d450-9fe5-41ab-ae7f-8c1be5e46823`.
- Android update: `01a0d2d0-9579-7c85-8a24-5d3cc8fda4e4`.
- [Expo update record](https://expo.dev/accounts/aliasjads-team/projects/voka/updates/c269d450-9fe5-41ab-ae7f-8c1be5e46823).
- Exported with the EAS preview environment and local dotenv disabled, then
  published with `--skip-bundler` to use the reviewed artifact unchanged.
- The live manifest selects the new update. Its downloaded launch-asset SHA-256
  matches the local export:
  `03deec9de0c933da103c1cc373d07c9781eb0d7031ee1444cd45c1c8cba0984d`.
- The bundle uses the real Voka backend. Inspection of 15,598 Hermes string
  literals found no provider secret-key literals; only the two Supabase public
  variables were present in the EAS preview environment.
- Published from the reviewed working tree based on `d5e8619`, before committing
  the source. The SHA-256 of sorted changed client paths followed by a NUL and
  their file contents is
  `eb4c1b3a68dbf219f1c906cf000346820a8b93f53972195de08c21006acea385`.

## Verification

- Full validation passed: Expo Doctor 21/21, formatting, TypeScript, zero-warning
  lint and 113 unit tests in 26 suites.
- All 68 mobile-sized browser checks passed. Subscription cases cover guests,
  disabled checkout, active subscriber details and failure/retry states.
- Frozen Deno checks passed for all five Edge Functions.
- Isolated PostgreSQL permission, expiry, environment, replay and concurrent quota
  tests passed. Twelve concurrent requests against an allowance of three admitted
  exactly three. These tests did not use the live database.
- Production dependency audit: zero known vulnerabilities. Source secret-pattern
  checks found no matches. Local env files, exports and screenshots remain ignored.
- On the attached Vivo V2061, the in-app update check downloaded the OTA and the
  new UI was verified after restart. The existing signed-in session remained.
- The real signed-in Plus screen and its refresh both show Coming soon, with
  checkout disabled and no configuration/error message. Terms navigation works.
- German phrase playback shows preparation highlighting in the original button
  position and returns to idle without an audio failure. Native before/after
  screenshots were visually reviewed.
- English reading shows distinct incorrect/correct styling, checked states and
  correct-answer locking. No reading completion was saved.
- With the real Android keyboard open, the empty writing field and writing action
  remain visible above it. No draft text was entered or submitted.
- A normal cold MAIN/LAUNCHER start opens Home, retaining the German preference.
- A second in-app update check reports that version 1.4.0 is up to date. Both
  tested app processes had no AndroidRuntime, ReactNativeJS or ExpoUpdates error
  log entries during the test interval, and the Android crash buffer contained no
  Voka crash. The phone was left on Home and the temporary device UI dump removed.

## Remaining launch gates

Google Play developer/payment setup, store product/base plan, RevenueCat store
credentials and webhooks, approved price/allowances, real store purchase testing
and public-release approvals remain outstanding. The Test Store is not enabled
for paid AI access. Keep billing off until the setup and testing in
`subscriptions.md` are complete. These checks do not guarantee an absence of bugs
on every device or network.
