# Curriculum review, September 2026

A linguistic and communication review of Voka's English (modern communication plus IELTS) and German (zero to B1, native-like interaction) content, with the changes made in response.

## Summary

Before this review, the app had good foundations (honest claims, a four-step lesson loop, sensible pronunciation principles) but far too little content for its goals:

| Goal                             | Before                                                                                          | After                                                                                                                     |
| -------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| German from zero to B1           | 13 short lessons, 2 checks each, B1 = 3 lessons                                                 | 44 lessons (14 A1, 14 A2, 16 B1), 3–4 checks each, including listen-first items                                           |
| Talk with native German speakers | Almost no spoken German: no particles, reductions, du/Sie switching or culture                  | Dedicated lessons on particles, fast speech, small-talk culture, texting and phone calls; coach prompt models real speech |
| Modern English communication     | 5 speaking units with 3 phrases each; no guided lessons                                         | 11 guided lessons on pragmatics, politeness, reactions, repair, connected speech and common errors                        |
| IELTS                            | 3 reading passages, 3 short writing tasks, a guide page                                         | 9 guided IELTS-skill lessons covering all four papers, plus a True/False/Not Given passage                                |
| Tests                            | 2 multiple-choice checks per lesson (answers mostly in slot 1); level check was an AI chat only | Shuffled options, listening checks, near-miss writing feedback, adaptive placement check                                  |
| Listening library                | 3 dialogues per language                                                                        | 6 per language                                                                                                            |

## Content errors fixed

| Where                | Issue                                                                                         | Fix                                                                      |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Introductions        | “Ich bin …”, the most common way to give your name, was missing and was rejected in writing   | Added as a phrase and accepted answer                                    |
| Asking for help      | “Wie bitte?”, the default repair phrase, was missing; “Bitte sprechen Sie langsam” is stiff   | Added “Wie bitte?”; now “Können Sie bitte langsamer sprechen?”           |
| Directions           | “Dann links, bitte” is not how directions are given                                           | “An der Ampel links”, “Die zweite Straße rechts”, “Wie komme ich zum …?” |
| Appointments reading | “Die Praxis bietet ihm Dienstag … an” is ungrammatical                                        | “bietet ihm einen Termin am Dienstag … an”                               |
| Past day             | “Der Bus ist zu spät gekommen” is textbook; natives say the bus “hatte Verspätung”            | Replaced; added a sein-vs-haben check                                    |
| Vocabulary deck      | “Der Kaffee, bitte” / “Das Wasser, bitte” are not how anyone orders; Kaffee IPA used /ˈkafeː/ | Natural example sentences; /ˈkafe/ (Germany standard); 3 more nouns      |
| Writing checks       | Only exact strings passed; umlaut spellings (oe/ae/ue) and curly apostrophes were rejected    | Normalised; one- or two-letter slips get a “very close” hint, not a pass |
| Checks               | The correct answer was the first option in about half of all checks                           | Stable per-question shuffle                                              |

## Gaps closed, compared with other products

Competitors' published features and common learner complaints (recognising but not producing language, textbook-only register, AI chats that feel scripted) point to these gaps. They are Voka's inference, not claims that a competitor never offers something.

| Gap in typical apps                            | What Voka now does                                                                                            |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Textbook German that natives don't speak       | Modal particles, reductions (haste, hab, ’ne), war/hatte in speech, weil with main-clause order explained     |
| No pragmatics                                  | “What British English really means”, understatement, “Would you mind … – Not at all”, German directness       |
| Learners freeze when they lack a word          | Paraphrase and circumlocution lessons in both languages; repair phrases                                       |
| Germans switch to English                      | “Ich lerne Deutsch. Bitte auf Deutsch.” taught in lesson 3; coach told not to switch languages                |
| Pronunciation as accent imitation              | Intelligibility-first sound tips in every German lesson; English lesson built on vowel length, stress and -ed |
| Exam prep disconnected from real communication | IELTS lessons reuse the same communication skills (repair, paraphrase, extension)                             |
| Goethe B1 speaking format rarely practised     | “Plan something together” (Teil 1) and “Present a topic” (Teil 2) lessons                                     |
| Placement by self-report                       | Adaptive placement across grammar, vocabulary, listening and pragmatics                                       |

## Coach behaviour (deployed 28 September 2026)

The realtime coach now prefers recasts over explicit correction, slows down and models answers at A1–A2, uses natural speed from B1, stays in the target language when the learner switches to English, models German particles, reductions and du/Sie choice, and labels strongly informal English items.

## Decisions taken

| Question                                      | Decision                                                                                                         | Reason                                                                                                                                                                               |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Ship the new coach behaviour?                 | Yes. `realtime-session` and the new `writing-feedback` function were deployed on 28 September 2026.              | Recasts, level-adapted speech rate and staying in the target language are well-supported teaching practice. The change is backward-compatible with older app versions.               |
| Keep 10 attempts per lesson?                  | No: keep the last 5, and drop the typed draft once the writing step is passed (drafts capped at 160 characters). | Review now uses per-phrase cards, so older attempts add no teaching value. A test checks that worst-case state stays under the 64 KB database limit, measured as Postgres stores it. |
| Show band scores or CEFR numbers for writing? | No. Qualitative ratings per criterion, concrete corrections and an improved version.                             | Unvalidated numbers mislead learners. Actionable, criterion-level feedback is what improves writing.                                                                                 |
| Where do exam prompts live?                   | On the server. The app sends only a task or card id.                                                             | Prevents prompt injection and keeps exam formats consistent.                                                                                                                         |
| Human review                                  | Still required before marketing any level outcome.                                                               | No automated check replaces native-teacher review and learner testing.                                                                                                               |

## Gaps closed after the first review

- **Spaced retrieval:** per-phrase review cards with expanding intervals, and recognition, listening and spoken-recall items.
- **Production feedback:** AI writing feedback for three English and three German tasks, verified live on the deployed function.
- **Exam simulation:** timed full-length writing mode, and task-card speaking mocks for IELTS Parts 2–3 and Goethe B1 Teil 1–2.
- **Input volume:** 8 more graded listening pieces, including the first German A1 stories.
- **UX:** a modern lesson player (progress bar, one task per screen, sticky Check button with a feedback panel), a level-tabbed learning path, a practice-tools grid and redesigned writing, placement and review screens.

## Still missing

1. **Natural audio.** Lessons use the device's speech engine. Pre-generated neural or human recordings would sound far more natural, but need a native audio module and therefore a new app binary, not an over-the-air update.
2. **Regional listening.** Austrian and Swiss German, and more English accents, need real recordings for the same reason.
3. **Full-length reading and listening papers** for IELTS.
4. **Native-teacher review and learner testing** of all content, and calibration of the placement check.
