# Practice interaction update, 2026-09-24

## Changes

- German phrase playback no longer inserts a stop control above the phrase list. The original button keeps its position, highlights immediately, shows a preparation spinner, then switches to a stop icon when the device reports playback starting. The same target cancels preparation or stops playback.
- Voice lookup warms on lesson focus without playing audio and is reused while focused. Missing voices and errors remain retryable. An eight-second startup deadline prevents an indefinite loading state; leaving or backgrounding cancels pending playback. Device speech-engine latency is not guaranteed to disappear.
- Reading, German meaning checks, dialogue questions and the listening warm-up share selected/correct/incorrect styling with icons and accessible checked states. Correct answers remain readable when locked; feedback resets on the next question.
- Dialogue replay actually restarts playback, slow mode takes effect on active audio, and listening again does not erase a checked answer. Audio controls have larger tap targets and can wrap on narrow screens.
- Vocabulary audio is separate from the flip target. Vocabulary and spoken-check sample audio use the same preparation/stop feedback as German phrases.
- Reading identifies the active lesson, avoids resetting an unfinished question when its lesson is tapped again, uses the app's typography, and highlights the next action. The final reading action now describes returning to the first text accurately.

## Verification

- Expo doctor: 21/21. TypeScript, full-repository lint, formatting and whitespace checks passed.
- Jest: 78 tests in 22 suites passed. Audio tests cover delayed stop/voice lookup, cancellation, stale callbacks, missing-voice retry, caching, startup timeout and dialogue completion.
- Playwright: all 60 cases passed across compact and modern Android-sized browser profiles. Added checks measure unchanged audio-button bounds, exercise controlled preparation/start/stop/replay events, and verify answer colors and accessible states.
- Compact browser screenshots were visually reviewed for audio preparation, incorrect/correct reading answers, consistent typography and the next action.
- Browser tests use intercepted synthetic services and controlled speech events. No microphone audio or real assessment request was sent during this work.
- The phone was not connected. Actual device speech timing, native accessibility and applying this OTA on the phone remain to be checked when it is available.

## Published Android OTA

- Channel/branch: `preview`. Runtime: `1.4.0`, compatible with the installed 1.4.0 (11) preview APK.
- No dependency, native plugin, app configuration, database or backend deployment changes were made. No APK rebuild is required; the displayed app version remains 1.4.0.
- Update group: `e33d5bc3-2ed9-403e-8c30-eb207ca500a1`.
- Android update ID: `01a0d283-88a3-7f4a-b937-284aca4194fa`.
- [Expo update record](https://expo.dev/accounts/aliasjads-team/projects/voka/updates/e33d5bc3-2ed9-403e-8c30-eb207ca500a1).
- The export used the EAS preview environment with dotenv disabled. The compiled Android bundle contains the real Voka Supabase host, not the browser-test endpoint. A scan found no OpenAI/xAI secret-key literals.
- The live Expo v1 manifest selects this update for Android runtime 1.4.0. Downloading its launch asset with Expo's supplied asset request headers produced SHA-256 `84d31eeab6f1c2cc72511863d4de21a673d13d2506c5ff5102e482eb3323bc63`, exactly matching the reviewed local export. Runtime 1.3.0 still selects its separate compatible update.
- Published from the reviewed working tree based on `d5e86199dc209e467f93db49bf4aa00c36869f66`. This request did not push source changes to GitHub. SHA-256 of the sorted changed client paths, each followed by a NUL and its file contents: `61a0a814f6a460b8d44fac64317c32355ac5e12220c4c351fb24ec2ad643d583`.

Install from **Profile > Settings > Check for updates > Restart**, or use the ready-update banner. Existing lesson progress and drafts are unchanged.

If a confirmed regression requires rollback, the reviewed recovery command is `npx eas-cli update:rollback e33d5bc3-2ed9-403e-8c30-eb207ca500a1 --platform android --message "Revert practice feedback update" --non-interactive`. It is recorded here, not executed. At publication this is the first remote update for runtime 1.4.0, so rollback returns that runtime to its embedded APK update, not to 1.3.0.
