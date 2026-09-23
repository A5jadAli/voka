# Voka 1.4 release verification

Date: 2026-09-23. Distribution: Expo internal preview APK, not a Play Store release.

## Automated verification

- Expo doctor: 21/21 checks passed.
- TypeScript, zero-warning ESLint and formatting checks passed.
- Jest: 71 tests in 22 suites passed, including keyboard scroll calculations and Android permission outcomes.
- Playwright: all 52 cases passed across compact and modern Android-sized browser profiles, including every guided German lesson, account boundaries, voice cancellation, reading completion, learning-goal persistence, writing revision and accessible icon-only navigation.
- The complete browser suite also passed with dotenv disabled and synthetic, intercepted backend configuration. It does not require local or CI service credentials.
- `npm audit --omit=dev`: zero vulnerabilities.
- All three Edge Functions type-check with frozen dependency locks.
- Disposable PostgreSQL checks passed for quota allocation, privilege restrictions, foundation row isolation and bounds, and voice reservation/ownership/global-cap/expiry behavior. The temporary database was stopped afterwards.

## Live services

- All five September 23 migrations are applied to the linked Voka Supabase project.
- `realtime-session`, `voice-cleanup` and `delete-account` are deployed.
- The private scheduled worker returns HTTP 200 and renews its heartbeat. The scheduler runs once per minute; new voice starts fail closed if its health becomes stale.
- Real synthetic-guest smoke tests passed for WebRTC connection, rejecting a concurrent call, server hangup, structured assessment and account deletion. Both the xAI path and OpenAI fallback were observed working. Test guests were deleted; no real user account was used.
- Provider keys and the generated worker credential remain server-side. No secret values or APK binaries are included in the commit.

## Native build and phone

- Target package: `com.asjadali.voka`; version 1.4.0; Android version code 11; runtime 1.4.0; preview channel.
- Replacement EAS build: `4d9af27a-1af3-4ede-a19d-2f6ec9ec673a`.
- Build 11 finished successfully and was installed in place on the Vivo V2061. Android reports version 1.4.0 (11), with the original first-install time retained. APK SHA-256: `27ad33bcf148c5c851d4c5bb0176afb8da7208daff290ae31db88eddb891010b`.
- The earlier build with version code 9 was cancelled to include test-discovered fixes.
- Build 10 was installed over the existing app on the connected Vivo V2061 without clearing data; its original installation date and guest preferences were retained.
- Check for updates returned "Version 1.4.0 is the latest available update." Guest profile routes to sign-in/create-account. Writing draft recovery passed after force-stop, and the temporary draft was removed without recording a completion.
- A normal cold launch using Android's MAIN/LAUNCHER intent opens Home. Earlier test deep links deliberately reopened Writing; foregrounding an existing task is distinct from a cold launch. Auth and lesson deep links remain supported.
- Physical testing and owner observation caught a writing field hidden by the keyboard, low-contrast writing instructions, and first-use microphone permission being treated as app departure. These were fixed and retested on installed build 11, with regression coverage.
- The owner requested icon-only bottom navigation; screen-reader labels and selected states remain. Home now uses a yellow primary practice button and a separate quieter goal-edit control.
- Build 11 screenshots confirm the normal-size writing field and action button stay above the keyboard, and the sign-up password field and visibility toggle remain visible. At 130% system text size, Home wraps without horizontal clipping and the writing caret/action remain usable with vertical scrolling. This is a limited smoke check, not full accessibility certification.
- A temporary writing draft survived force-stop and was recovered after a normal Home launch and reopening Write. Temporary writing/password text was removed; no sign-up or writing completion was submitted.
- German lesson text and its practice control loaded after a cold start with Wi-Fi and mobile data disabled. Networking and the original 1.0 font scale were restored.
- Native microphone denial displayed actionable guidance. Granting access displayed a clear start step without recording. With explicit owner approval, a brief real voice session connected. Android app-ops showed recording active, then a completed approximately 12-second recording immediately after backgrounding. The server had zero active leases afterwards and a fresh cleanup heartbeat. Microphone permission was restored to not granted.
- The final check left the app on Home, found no fatal errors in the current app process, and removed the temporary device UI dump. A real signed-in account's legacy-token migration and full screen-reader testing remain unverified on this phone.

## Not certified by these checks

Passing tests does not establish a complete CEFR course, an IELTS band-scoring service, teaching effectiveness, comprehensive accessibility compliance or a public-production security sign-off. Educator/real-learner review, broader and unseen curriculum assessments, owner-controlled provider spending/abuse controls, leaked-password protection and business privacy/retention decisions remain open. Billing is unchanged. See `curriculum-coverage.md` and `release-safety.md`.
