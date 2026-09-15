import type { LanguageTrack } from '@/features/listening/scenarios';

export const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;

export type CefrLevel = (typeof cefrLevels)[number];

export type CurriculumPhrase = {
  meaning: string;
  phrase: string;
  usage: string;
};

export type CurriculumUnit = {
  coachBrief: string;
  context: string;
  id: string;
  level: CefrLevel;
  outcome: string;
  phrases: CurriculumPhrase[];
  pronunciationFocus: string;
  title: string;
  track: LanguageTrack;
};

export const curriculumUnits: CurriculumUnit[] = [
  {
    coachBrief:
      'Run a short first-meeting conversation. Model one phrase, let the learner answer, then vary the question. Focus on clear word stress and unstressed function words.',
    context: 'Greetings, introductions and simple requests',
    id: 'en-a1-first-contact',
    level: 'A1',
    outcome: 'Introduce yourself and manage a short friendly exchange.',
    phrases: [
      {
        meaning: 'An informal British greeting.',
        phrase: 'Hiya, how’s it going?',
        usage: 'Friends and relaxed everyday situations',
      },
      {
        meaning: 'A natural short response to “How are you?”',
        phrase: 'I’m good, thanks.',
        usage: 'Neutral everyday conversation',
      },
      {
        meaning: 'A polite way to order or request something.',
        phrase: 'Could I get …, please?',
        usage: 'Cafés, shops and service situations',
      },
    ],
    pronunciationFocus: 'Clear word stress and weak forms such as “to” and “a”',
    title: 'First contact',
    track: 'EN',
  },
  {
    coachBrief:
      'Arrange a casual plan in contemporary British English. Encourage short natural replies and practise linking across word boundaries without forcing slang.',
    context: 'Making plans and responding naturally',
    id: 'en-a2-making-plans',
    level: 'A2',
    outcome: 'Suggest, accept and adjust a simple social plan.',
    phrases: [
      {
        meaning: 'Would you like to do something?',
        phrase: 'Do you fancy grabbing a coffee?',
        usage: 'Informal British English',
      },
      {
        meaning: 'I agree with that suggestion.',
        phrase: 'Sounds good to me.',
        usage: 'Friendly and neutral situations',
      },
      {
        meaning: 'A gentle way to change a plan.',
        phrase: 'Could we make it a bit later?',
        usage: 'Informal arrangements',
      },
    ],
    pronunciationFocus: 'Linking, contractions and the rhythm of short replies',
    title: 'Make a plan',
    track: 'EN',
  },
  {
    coachBrief:
      'Run a lively but respectful interview-style conversation. Elicit an opinion and a short story. Recycle modern high-frequency discourse phrases in context, never as a celebrity imitation.',
    context: 'Modern interviews and confident everyday opinions',
    id: 'en-b1-interview-flow',
    level: 'B1',
    outcome: 'Give an opinion and keep an unscripted interview moving.',
    phrases: [
      {
        meaning: 'Introduces a balanced or honest point.',
        phrase: 'To be fair, …',
        usage: 'Conversational opinions',
      },
      {
        meaning: 'A natural British way to say “I think”.',
        phrase: 'I reckon …',
        usage: 'Informal British conversation',
      },
      {
        meaning: 'Nearly or essentially.',
        phrase: 'Pretty much.',
        usage: 'Short informal responses',
      },
    ],
    pronunciationFocus: 'Sentence stress, reductions and confident turn-taking',
    title: 'Interview flow',
    track: 'EN',
  },
  {
    coachBrief:
      'Invite the learner to tell a surprising story. Help them foreground key events with stress, chunk longer sentences and use natural narrative transitions.',
    context: 'Storytelling with nuance and reaction',
    id: 'en-b2-storytelling',
    level: 'B2',
    outcome: 'Tell a clear, engaging story with natural emphasis.',
    phrases: [
      {
        meaning: 'The eventual result was unexpected.',
        phrase: 'It turned out that …',
        usage: 'Narratives and explanations',
      },
      {
        meaning: 'This was the result, often unexpectedly.',
        phrase: 'I ended up …',
        usage: 'Informal storytelling',
      },
      {
        meaning: 'I was moderately surprised or unsettled.',
        phrase: 'I was a bit taken aback.',
        usage: 'Measured British reaction',
      },
    ],
    pronunciationFocus: 'Thought groups, contrastive stress and expressive intonation',
    title: 'Tell the story',
    track: 'EN',
  },
  {
    coachBrief:
      'Run a thoughtful professional interview. Challenge the learner to qualify a claim, contrast two positions and land a concise conclusion. Prioritise clarity over accent erasure.',
    context: 'Precise professional and interview communication',
    id: 'en-c1-presence',
    level: 'C1',
    outcome: 'Express a nuanced position with calm, credible delivery.',
    phrases: [
      {
        meaning: 'Introduces the most noticeable insight.',
        phrase: 'What struck me was …',
        usage: 'Reflective answers and presentations',
      },
      {
        meaning: 'Adds a contrasting qualification.',
        phrase: 'Having said that, …',
        usage: 'Balanced formal or professional speech',
      },
      {
        meaning: 'Politely limits or rejects an extreme claim.',
        phrase: 'I wouldn’t go so far as to say …',
        usage: 'Nuanced disagreement',
      },
    ],
    pronunciationFocus: 'Prosodic control, emphasis and deliberate pacing',
    title: 'Interview presence',
    track: 'EN',
  },
  {
    coachBrief:
      'Run a first meeting and a simple café order in standard German from Germany. Model vowel length and primary word stress, then accept short complete learner turns.',
    context: 'Greetings, introductions and essential requests',
    id: 'de-a1-first-contact',
    level: 'A1',
    outcome: 'Greet someone, introduce yourself and order politely.',
    phrases: [
      {
        meaning: 'Morning! A shortened everyday greeting.',
        phrase: 'Morgen!',
        usage: 'Informal daytime greetings',
      },
      {
        meaning: 'I would like …',
        phrase: 'Ich hätte gern …',
        usage: 'Polite orders and requests',
      },
      {
        meaning: 'That is all, thank you.',
        phrase: 'Das war’s, danke.',
        usage: 'Finishing an order',
      },
    ],
    pronunciationFocus: 'German vowel length, word stress and clear final consonants',
    title: 'Erster Kontakt',
    track: 'DE',
  },
  {
    coachBrief:
      'Run a busy bakery or shop interaction. Use natural but widely understood colloquial German, contrasting the complete form with what learners actually hear.',
    context: 'Fast everyday transactions',
    id: 'de-a2-einkaufen',
    level: 'A2',
    outcome: 'Understand and complete a quick shop interaction.',
    phrases: [
      {
        meaning: 'Anything else?',
        phrase: 'Sonst noch was?',
        usage: 'Everyday service encounters',
      },
      {
        meaning: 'I’ll take …',
        phrase: 'Ich nehm …',
        usage: 'Common spoken reduction of “ich nehme”',
      },
      {
        meaning: 'Keep the change / that amount is fine.',
        phrase: 'Passt so.',
        usage: 'Paying in cafés, taxis and shops',
      },
    ],
    pronunciationFocus: 'Schwa reduction and recognising shortened verb endings',
    title: 'Schnell einkaufen',
    track: 'DE',
  },
  {
    coachBrief:
      'Simulate a real phone call about an appointment or flat. Help the learner manage uncertainty and repair misunderstandings without switching immediately to English.',
    context: 'Phone calls, appointments and clarification',
    id: 'de-b1-phone',
    level: 'B1',
    outcome: 'Handle a practical call and ask for clarification.',
    phrases: [
      {
        meaning: 'I’m getting in touch about …',
        phrase: 'Ich meld mich wegen …',
        usage: 'Natural spoken form of “ich melde mich”',
      },
      {
        meaning: 'It depends.',
        phrase: 'Kommt drauf an.',
        usage: 'Everyday spoken German',
      },
      {
        meaning: 'Could you explain that again?',
        phrase: 'Könnten Sie das noch mal erklären?',
        usage: 'Polite communication repair',
      },
    ],
    pronunciationFocus: 'Consonant clusters, reductions and question intonation',
    title: 'Am Telefon',
    track: 'DE',
  },
  {
    coachBrief:
      'Lead a workplace discussion where the learner agrees, hedges and disagrees politely. Focus on sentence-level prominence and keeping the verb frame clear.',
    context: 'Workplace opinions and polite disagreement',
    id: 'de-b2-discussion',
    level: 'B2',
    outcome: 'Contribute a nuanced opinion in a German discussion.',
    phrases: [
      {
        meaning: 'Honestly speaking …',
        phrase: 'Ehrlich gesagt, …',
        usage: 'Candid but neutral opinions',
      },
      {
        meaning: 'I am not sure about that.',
        phrase: 'Da bin ich mir nicht sicher.',
        usage: 'Soft disagreement',
      },
      {
        meaning: 'I see that somewhat differently.',
        phrase: 'Ich sehe das etwas anders.',
        usage: 'Polite professional disagreement',
      },
    ],
    pronunciationFocus: 'Sentence stress, rhythm and long-clause chunking',
    title: 'Im Gespräch',
    track: 'DE',
  },
  {
    coachBrief:
      'Run a high-level professional discussion. Ask the learner to distinguish evidence, judgement and conclusion while maintaining calm, intelligible prosody.',
    context: 'Professional precision and persuasive speaking',
    id: 'de-c1-praezision',
    level: 'C1',
    outcome: 'State and defend a precise position with natural structure.',
    phrases: [
      {
        meaning: 'As far as I can judge …',
        phrase: 'Soweit ich das beurteilen kann, …',
        usage: 'Careful professional assessment',
      },
      {
        meaning: 'The decisive factor is …',
        phrase: 'Ausschlaggebend ist …',
        usage: 'Highlighting a central argument',
      },
      {
        meaning: 'All things considered …',
        phrase: 'Unterm Strich …',
        usage: 'A concise spoken conclusion',
      },
    ],
    pronunciationFocus: 'Flexible prominence, intonation and controlled speech rate',
    title: 'Präzise auftreten',
    track: 'DE',
  },
];

export function getCurriculumUnits(track: LanguageTrack) {
  return curriculumUnits.filter((unit) => unit.track === track);
}

export function getCurriculumUnit(id?: string) {
  return curriculumUnits.find((unit) => unit.id === id);
}
