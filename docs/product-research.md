# Voka speaking curriculum research

Last reviewed: 2026-09-15

## Product principle

Voka uses a learner-chosen reference variety, but does not equate accent with correctness or ask
learners to erase their identity. The product prioritises intelligibility, comprehensibility and
confident participation. Pronunciation work covers both articulation and prosody: sounds, word and
sentence stress, rhythm, intonation, speech rate and chunking.

This follows the Council of Europe's revised CEFR phonological-control model, which explicitly moved
away from native-speaker imitation and separates overall phonological control, sound articulation and
prosody:

- https://www.coe.int/en/web/common-european-framework-reference-languages/phonological-competence
- https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4

The distinction is supported by a 2025 meta-analysis: accentedness, comprehensibility,
intelligibility and fluency are related but distinct, and a noticeable accent does not necessarily
make speech unintelligible:

- https://doi.org/10.1017/S0272263125000014

Goethe-Institut guidance likewise treats pronunciation as both segmental and prosodic, recognises
multiple standard and regional German varieties, and recommends responding to individual strengths
and weaknesses:

- https://www.goethe.de/prj/dlp/en/magazin-sprache/21555935.html

## Contemporary language sources

English content uses contemporary, broadly useful British conversational patterns rather than
quoting or imitating a living actor. Phrase selection is designed to be checked against corpus and
dictionary evidence before expansion. The Spoken British National Corpus 2014 contains 11.5 million
words of informal conversations from 1,251 conversations:

- https://corpora.lancs.ac.uk/bnc2014/

German content uses standard German from Germany as the initial reference while teaching learners to
expect variation. The continuously maintained FOLK corpus covers private, institutional and public
interactions across German-speaking regions. Goethe's CEFR-aligned phrase inventories inform
functional outcomes:

- https://agd.ids-mannheim.de/FOLK_extern.shtml
- https://www.goethe.de/resources/files/pdf357/course-schedule_2026.pdf
- https://lernplattform.goethe.de/pluginfile.php/1528797/mod_folder/content/0/DeutschOnline_Redemittel_Grammatik_1-18%20.pdf

## Competitive review and inferred opportunity

The following gaps are Voka's product inference from competitors' own descriptions, not claims that
the competitors never provide these capabilities.

| Product    | Documented strength                                                              | Voka opportunity                                                                                                                               |
| ---------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Duolingo   | CEFR-aware paths, personalised mistake review, guided and open-ended video calls | Connect live conversation directly to persistent pronunciation/prosody targets and transparent evidence rather than a character-led call alone |
| ELSA       | Detailed feedback on sounds, stress and intonation                               | Carry feedback into spontaneous two-way conversation and support German alongside English                                                      |
| Babbel     | Practical dialogues, repeat-after-model speech recognition and slow playback     | Move beyond exact phrase matching to interruption-friendly unscripted repair                                                                   |
| Speechling | Coach-supported pronunciation practice                                           | Give immediate conversation-level adaptation while retaining honest limitations                                                                |

Primary product pages reviewed:

- https://blog.duolingo.com/ai-and-video-call/
- https://blog.duolingo.com/guide-to-duolingo-practice-hub/
- https://elsaspeak.com/en/faqs/how-does-elsas-pronunciation-feedback-work
- https://support.babbel.com/hc/en-us/articles/19211305815570-Speech-recognition

## MVP curriculum rules

1. Every unit has a real-world outcome, CEFR band, phrase pack and pronunciation/prosody focus.
2. Beginner calls are guided; higher-level calls are progressively open-ended.
3. The coach corrects at most one high-impact issue at a time and keeps the conversation moving.
4. A difficult feature is recycled later rather than scored once and forgotten.
5. Feedback describes observable evidence and never invents a percentage pronunciation score.
6. “Modern” means current, broadly understood and register-labelled, not novelty slang.
7. Named living speakers may inspire a use case such as “contemporary interview English”, but Voka
   never clones or impersonates them.

## Current technical boundary

OpenAI Realtime can process audio directly, follow audio-behaviour instructions and handle
interruptions. Transcription confidence alone is not a validated phoneme-level pronunciation score.
Voka therefore provides qualitative coaching and persistent practice targets in this milestone. A
future calibrated acoustic assessment must be validated across devices, first-language backgrounds,
genders and noise conditions before scores are shown.

- https://developers.openai.com/api/docs/models/gpt-realtime-2.1
- https://developers.openai.com/api/reference/cli/resources/realtime/subresources/calls/methods/accept
