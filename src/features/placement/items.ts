import { getTrackLessons, type LessonTrack } from '@/features/foundations/catalog';

export type PlacementLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export type PlacementSkill = 'grammar' | 'vocabulary' | 'listening' | 'reading' | 'pragmatics';

export type PlacementItem = {
  id: string;
  level: PlacementLevel;
  skill: PlacementSkill;
  prompt: string;
  /** Heard, not shown, before answering. */
  audio?: string;
  options: string[];
  answer: number;
  explanation: string;
};

export const STAGE_SIZE = 5;
export const STAGE_PASS_MARK = 4;

const item = (
  id: string,
  level: PlacementLevel,
  skill: PlacementSkill,
  prompt: string,
  options: string[],
  answer: number,
  explanation: string,
  audio?: string,
): PlacementItem => ({ id, level, skill, prompt, options, answer, explanation, audio });

// Original items. Each stage mixes grammar, vocabulary, listening and real-world pragmatics
// so a learner cannot pass on textbook grammar alone.
export const placementItems: Record<LessonTrack, PlacementItem[]> = {
  DE: [
    item(
      'de-a1-verb',
      'A1',
      'grammar',
      'Ich ___ aus Spanien.',
      ['komme', 'kommst', 'kommt'],
      0,
      'With ich, the verb ends in -e.',
    ),
    item(
      'de-a1-bill',
      'A1',
      'vocabulary',
      'What is „die Rechnung“ in a café?',
      ['The bill', 'The calculator', 'The right side'],
      0,
      'Die Rechnung, bitte = the bill, please.',
    ),
    item(
      'de-a1-price',
      'A1',
      'listening',
      'Listen. How much do you pay?',
      ['€4.50', '€5.40', '€45.00'],
      0,
      'You heard “vier Euro fünfzig”.',
      'Das macht vier Euro fünfzig.',
    ),
    item(
      'de-a1-kein',
      'A1',
      'grammar',
      'Ich habe ___ Auto.',
      ['nicht', 'kein', 'keine'],
      1,
      'Kein negates a noun; das Auto takes kein.',
    ),
    item(
      'de-a1-bye',
      'A1',
      'pragmatics',
      'You are leaving a bakery. What do you say?',
      ['Tschüss!', 'Guten Morgen!', 'Wie bitte?'],
      0,
      'Tschüss is the everyday goodbye.',
    ),
    item(
      'de-a2-perfekt',
      'A2',
      'grammar',
      'Gestern ___ ich ins Kino gegangen.',
      ['habe', 'bin', 'war'],
      1,
      'Gehen uses sein in the Perfekt.',
    ),
    item(
      'de-a2-wohin',
      'A2',
      'grammar',
      'Ich lege das Buch auf ___ Tisch.',
      ['dem', 'den', 'der'],
      1,
      'Movement (wohin?) takes the accusative.',
    ),
    item(
      'de-a2-reason',
      'A2',
      'listening',
      'Listen. Why can’t the speaker come?',
      ['They are ill', 'They are working', 'They missed the bus'],
      0,
      'You heard “weil ich krank bin”.',
      'Ich kann heute leider nicht kommen, weil ich krank bin.',
    ),
    item(
      'de-a2-heating',
      'A2',
      'vocabulary',
      'Die Heizung funktioniert nicht. What is broken?',
      ['The heating', 'The lights', 'The door'],
      0,
      'Die Heizung is the heating.',
    ),
    item(
      'de-a2-mal',
      'A2',
      'pragmatics',
      'A friend asks: Kannst du mal kurz helfen? What does mal do?',
      ['Makes the request casual and friendly', 'Means one time only', 'Makes it very formal'],
      0,
      'Mal softens requests.',
    ),
    item(
      'de-b1-konj',
      'B1',
      'grammar',
      'Wenn ich mehr Zeit ___, würde ich öfter reisen.',
      ['habe', 'hätte', 'hatte'],
      1,
      'Unreal condition: hätte.',
    ),
    item(
      'de-b1-relative',
      'B1',
      'grammar',
      'Das ist der Kollege, ___ ich gestern geholfen habe.',
      ['den', 'dem', 'der'],
      1,
      'Helfen takes the dative: dem.',
    ),
    item(
      'de-b1-postponed',
      'B1',
      'listening',
      'Listen. What happened to the event?',
      [
        'It was postponed to next week because of the weather',
        'It was cancelled for good',
        'It moved indoors',
      ],
      0,
      'You heard “wegen des Wetters auf nächste Woche verschoben”.',
      'Die Veranstaltung wurde wegen des Wetters auf nächste Woche verschoben.',
    ),
    item(
      'de-b1-umzu',
      'B1',
      'grammar',
      'Ich lerne Deutsch, ___ in Berlin zu studieren.',
      ['damit', 'um', 'weil'],
      1,
      'Same subject + zu-infinitive: um … zu.',
    ),
    item(
      'de-b1-letter',
      'B1',
      'reading',
      'A letter says: „Ihr Antrag wird derzeit bearbeitet.“ What is the status?',
      ['It is being processed', 'It was rejected', 'It is finished'],
      0,
      'Wird bearbeitet is the present passive.',
    ),
    item(
      'de-b2-trotz',
      'B2',
      'grammar',
      'Trotz ___ Regens gingen wir spazieren.',
      ['dem', 'des', 'den'],
      1,
      'In writing, trotz takes the genitive.',
    ),
    item(
      'de-b2-strich',
      'B2',
      'vocabulary',
      'Unterm Strich lohnt sich das. What does unterm Strich mean?',
      ['All things considered', 'Below the line on a form', 'Unfortunately'],
      0,
      'Unterm Strich = when everything is added up.',
    ),
    item(
      'de-b2-past-unreal',
      'B2',
      'listening',
      'Listen. What does the speaker mean?',
      [
        'They did not know in time, so they did not come',
        'They came early',
        'They will come next time',
      ],
      0,
      'You heard an unreal past: Hätte ich das gewusst, wäre ich gekommen.',
      'Hätte ich das früher gewusst, wäre ich natürlich gekommen.',
    ),
    item(
      'de-b2-passive',
      'B2',
      'grammar',
      'Der Bericht ___ bis Freitag fertiggestellt werden.',
      ['muss', 'wird', 'hat'],
      0,
      'Modal passive: muss … werden.',
    ),
    item(
      'de-b2-hedge',
      'B2',
      'pragmatics',
      'In a meeting someone says: Da bin ich mir nicht ganz sicher. What are they doing?',
      ['Disagreeing softly', 'Agreeing strongly', 'Changing the subject'],
      0,
      'It is a polite, hedged disagreement.',
    ),
  ],
  EN: [
    item(
      'en-a2-goes',
      'A2',
      'grammar',
      'She ___ to work by bike every day.',
      ['go', 'goes', 'going'],
      1,
      'Third person singular present: goes.',
    ),
    item(
      'en-a2-lost',
      'A2',
      'grammar',
      'I ___ my keys yesterday.',
      ['lose', 'lost', 'have lost'],
      1,
      'A finished past time (yesterday) takes the past simple.',
    ),
    item(
      'en-a2-order',
      'A2',
      'listening',
      'Listen. What does the customer want?',
      ['A coffee to take away', 'A table for two', 'The bill'],
      0,
      'You heard “a flat white to take away”.',
      'Could I get a flat white to take away, please?',
    ),
    item(
      'en-a2-cheers',
      'A2',
      'vocabulary',
      'You hold a door and someone says “Cheers!”. They mean:',
      ['Thanks', 'Goodbye forever', 'Let’s have a drink'],
      0,
      'In British English, cheers often means thanks.',
    ),
    item(
      'en-a2-howareyou',
      'A2',
      'pragmatics',
      'A colleague says “How are you?” in passing. The most natural reply is:',
      ['Good, thanks. You?', 'I am in good health, thank you very much indeed.', 'Yes.'],
      0,
      'A short answer and a question back.',
    ),
    item(
      'en-b1-since',
      'B1',
      'grammar',
      'I’ve lived here ___ 2019.',
      ['for', 'since', 'from'],
      1,
      'Since + a starting point.',
    ),
    item(
      'en-b1-first-cond',
      'B1',
      'grammar',
      'If it rains tomorrow, we ___ inside.',
      ['stay', 'will stay', 'would stay'],
      1,
      'A real future condition: will.',
    ),
    item(
      'en-b1-correction',
      'B1',
      'listening',
      'Listen. When is the meeting?',
      ['Tuesday', 'Wednesday', 'Thursday'],
      1,
      'Tuesday is corrected to Wednesday.',
      'Let’s meet on Tuesday. Oh, sorry, no, Wednesday. The room’s booked on Tuesday.',
    ),
    item(
      'en-b1-runout',
      'B1',
      'vocabulary',
      '“We’ve run out of milk” means:',
      ['There is no milk left', 'The milk has gone off', 'We have just bought milk'],
      0,
      'Run out of = have none left.',
    ),
    item(
      'en-b1-mind',
      'B1',
      'pragmatics',
      '“Would you mind opening the window?” You are happy to. You say:',
      ['No, not at all.', 'Yes, I mind.', 'Yes, of course I do.'],
      0,
      '“Not at all” means you don’t mind.',
    ),
    item(
      'en-b2-third-cond',
      'B2',
      'grammar',
      'If I ___ about the traffic, I would have left earlier.',
      ['knew', 'had known', 'have known'],
      1,
      'Unreal past: had + past participle.',
    ),
    item(
      'en-b2-prove',
      'B2',
      'vocabulary',
      'The results were promising, but they didn’t ___ the theory.',
      ['prove', 'proof', 'approve'],
      0,
      'Prove is the verb; proof is the noun.',
    ),
    item(
      'en-b2-coming-from',
      'B2',
      'listening',
      'Listen. What is the speaker’s position?',
      ['They understand but disagree', 'They fully agree', 'They are asking for details'],
      0,
      '“I see where you’re coming from, but …” introduces disagreement.',
      'I see where you’re coming from, but I’m not convinced it’s worth the cost.',
    ),
    item(
      'en-b2-tfng',
      'B2',
      'reading',
      'Text: “Some researchers warn that more hives may harm wild bees.” Statement: All researchers support adding hives.',
      ['True', 'False', 'Not Given'],
      1,
      'Some researchers warn against it, which contradicts “all support”.',
    ),
    item(
      'en-b2-bear',
      'B2',
      'pragmatics',
      'Your manager replies “I’ll bear it in mind.” This usually means:',
      ['Probably not', 'Definitely yes', 'They didn’t hear you'],
      0,
      'A polite non-commitment.',
    ),
    item(
      'en-c1-inversion',
      'C1',
      'grammar',
      'Not only ___ late, but he also forgot the documents.',
      ['he was', 'was he', 'he is'],
      1,
      'After a negative opener, invert: not only was he …',
    ),
    item(
      'en-c1-compelling',
      'C1',
      'vocabulary',
      'Her argument was ___: clear, logical and hard to dispute.',
      ['compelling', 'compulsive', 'complacent'],
      0,
      'Compelling = convincing.',
    ),
    item(
      'en-c1-far',
      'C1',
      'listening',
      'Listen. What does the speaker think?',
      ['It was not entirely a failure', 'It was a complete failure', 'It was a great success'],
      0,
      '“I wouldn’t go so far as to …” limits an extreme claim.',
      'Having said that, I wouldn’t go so far as to call it a failure.',
    ),
    item(
      'en-c1-hightime',
      'C1',
      'grammar',
      'It’s high time we ___ a decision.',
      ['make', 'made', 'will make'],
      1,
      'It’s (high) time + past simple.',
    ),
    item(
      'en-c1-respect',
      'C1',
      'pragmatics',
      '“With all due respect, …” usually introduces:',
      ['Strong disagreement', 'A compliment', 'An apology'],
      0,
      'Polite words, strong disagreement.',
    ),
  ],
};

export function placementStages(track: LessonTrack) {
  const stages: PlacementItem[][] = [];
  for (const entry of placementItems[track]) {
    const current = stages.at(-1);
    if (current && current[0].level === entry.level) current.push(entry);
    else stages.push([entry]);
  }
  return stages;
}

export type PlacementResult = {
  /** Highest stage passed, or null when the first stage was not passed. */
  secure: PlacementLevel | null;
  answered: number;
  correct: number;
  recommendation: { title: string; why: string; href: string };
};

/** Scores stages in order and stops at the first stage below the pass mark. */
export function evaluatePlacement(
  track: LessonTrack,
  answers: Record<string, number>,
): PlacementResult {
  const stages = placementStages(track);
  let secure: PlacementLevel | null = null;
  let answered = 0;
  let correct = 0;
  let failedLevel: PlacementLevel | null = null;
  for (const stage of stages) {
    const score = stage.filter((entry) => answers[entry.id] === entry.answer).length;
    answered += stage.filter((entry) => answers[entry.id] !== undefined).length;
    correct += score;
    if (score >= STAGE_PASS_MARK) secure = stage[0].level;
    else {
      failedLevel = stage[0].level;
      break;
    }
  }
  return { secure, answered, correct, recommendation: recommend(track, failedLevel) };
}

/** Whether the learner should continue to the next stage after finishing this one. */
export function stagePassed(stage: PlacementItem[], answers: Record<string, number>) {
  return stage.filter((entry) => answers[entry.id] === entry.answer).length >= STAGE_PASS_MARK;
}

function recommend(track: LessonTrack, failedLevel: PlacementLevel | null) {
  const lessons = getTrackLessons(track);
  const language = track === 'DE' ? 'German' : 'English';
  const start = failedLevel ? lessons.find((lesson) => lesson.level === failedLevel) : undefined;
  if (start)
    return {
      title: `Start with ${start.level}: ${start.title}`,
      why: `Your answers were secure below ${start.level}. This is the first ${start.level} lesson in the ${language} path.`,
      href: `/foundation/${start.id}`,
    };
  if (
    failedLevel &&
    !lessons.some((lesson) => placementRank(lesson.level) > placementRank(failedLevel))
  )
    return {
      title: `Practise with the live ${language} coach`,
      why: `You were secure below ${failedLevel}, which is beyond the guided path. Use open conversation and review any guided lessons you have not practised.`,
      href: `/conversation?track=${track}`,
    };
  if (failedLevel)
    return {
      title: `Start at the beginning of the ${language} path`,
      why: 'Work through the path in order; earlier lessons build the patterns later ones need.',
      href: `/foundation/${lessons[0].id}`,
    };
  return {
    title: `Practise with the live ${language} coach`,
    why: 'You answered every stage securely. Open-ended conversation will stretch you more than guided lessons.',
    href: `/conversation?track=${track}`,
  };
}

function placementRank(level: string) {
  return ['A1', 'A2', 'B1', 'B2', 'C1'].indexOf(level);
}
