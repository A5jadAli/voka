import { countWritingWords } from './validation';

export type WritingRating = 'strong' | 'developing' | 'needs work';
export type WritingFeedback = {
  createdAt: string;
  summary: string;
  criteria: { name: string; rating: WritingRating; comment: string }[];
  corrections: { original: string; corrected: string; why: string }[];
  improvedVersion: string;
  nextStep: string;
  /** The submitted text this feedback describes. */
  forText: string;
};
export type WritingDraft = {
  text: string;
  submitted: string;
  updatedAt: string;
  feedback?: WritingFeedback;
};
export type WritingProgress = Record<string, WritingDraft>;

type WritingTask = {
  track: 'EN' | 'DE';
  label: string;
  title: string;
  prompt: string;
  /** An English gloss for prompts written in the target language. */
  promptHelp?: string;
  minimum: number;
  target: string;
  example: string;
  checklist: string;
  /** Full exam length and time, used by timed exam mode. */
  exam?: { minimum: number; minutes: number };
};

export const writingTasks = {
  chart: {
    track: 'EN',
    label: 'Chart',
    title: 'Describe a weekly trend',
    prompt:
      'Describe the coffee sales chart. Give an overview, identify the busiest day, and compare two figures.',
    minimum: 12,
    target:
      'Short chart practice. A full IELTS Academic Task 1 response needs at least 150 words in about 20 minutes.',
    example:
      'Coffee sales fluctuated during the week, reaching a peak of 76 cups on Friday. Sales then fell to 34 on Saturday and 27 on Sunday. Friday sold more than twice as many cups as Monday, when 33 were sold.',
    checklist:
      'Check your facts against the chart: Friday is highest (76), Sunday lowest (27). Include an overview and a comparison.',
    exam: { minimum: 150, minutes: 20 },
  },
  letter: {
    track: 'EN',
    label: 'Letter',
    title: 'Write a useful request',
    prompt:
      'You booked an English course, but your work schedule has changed. Write to the course organiser. Explain the problem, request a different class time, and ask how to change your booking.',
    minimum: 40,
    target:
      'Everyday email and IELTS General Training letter practice. A full exam letter needs at least 150 words in about 20 minutes.',
    example:
      'Dear Course Organiser, I am writing about my evening English class. My work schedule has changed, so I can no longer attend on Tuesdays. Could I move to a Thursday class instead? Please let me know whether a place is available and how I should change my booking. Thank you for your help. Kind regards, Alex',
    checklist:
      'Check all three points: explain the problem, request another time, and ask how to change the booking. Use an appropriate greeting and ending.',
    exam: { minimum: 150, minutes: 20 },
  },
  opinion: {
    track: 'EN',
    label: 'Opinion',
    title: 'Explain and support an opinion',
    prompt:
      'Some people prefer learning online; others prefer a classroom. Discuss both views and give your own opinion. Support your ideas with reasons and examples.',
    minimum: 60,
    target:
      'General English and IELTS Task 2 practice. A full exam essay needs at least 250 words in about 40 minutes.',
    example:
      'Online learning offers flexibility, which helps people who work irregular hours. For example, a nurse can study after a late shift. Classroom learning, however, provides immediate interaction and a regular routine. I prefer a combination: online lessons for independent study and classroom meetings for discussion. The most useful choice depends on the learner’s weekly schedule and their access to reliable internet.',
    checklist:
      'Check that you discuss both views, state your opinion, and support it with a specific example.',
    exam: { minimum: 250, minutes: 40 },
  },
  'de-message': {
    track: 'DE',
    label: 'Nachricht',
    title: 'Eine Nachricht an Lena',
    prompt:
      'Du kannst am Samstag nicht zu Lenas Party kommen. Schreib ihr eine Nachricht: Entschuldige dich, nenne einen Grund und mach einen Vorschlag für ein anderes Treffen.',
    promptHelp:
      'You can’t go to Lena’s party on Saturday. Apologise, give a reason and suggest another time to meet.',
    minimum: 25,
    target: 'A2 informal message, similar to Goethe A2 Schreiben. Use du and a friendly tone.',
    example:
      'Hallo Lena, vielen Dank für die Einladung! Leider kann ich am Samstag nicht kommen, weil meine Eltern zu Besuch sind. Das tut mir echt leid. Hast du nächste Woche Zeit? Wir könnten am Mittwoch zusammen Kaffee trinken. Viel Spaß auf der Party! Liebe Grüße, Sam',
    checklist:
      'Check all three points: an apology, a reason (weil … verb at the end) and a suggestion. Start with Hallo/Liebe Lena and end with Liebe Grüße or LG.',
  },
  'de-email': {
    track: 'DE',
    label: 'E-Mail',
    title: 'Eine E-Mail an die Vermieterin',
    prompt:
      'Die Heizung in Ihrer Wohnung funktioniert seit drei Tagen nicht. Schreiben Sie Ihrer Vermieterin, Frau Becker: Beschreiben Sie das Problem, bitten Sie um eine schnelle Reparatur und nennen Sie Zeiten, wann Sie zu Hause sind.',
    promptHelp:
      'Your heating hasn’t worked for three days. Write to your landlady: describe the problem, ask for a quick repair and say when you are at home.',
    minimum: 40,
    target: 'B1 formal email, similar to Goethe B1 Schreiben Teil 3. Use Sie and a polite tone.',
    example:
      'Sehr geehrte Frau Becker, leider funktioniert die Heizung in meiner Wohnung seit drei Tagen nicht mehr. Die Wohnung ist sehr kalt, besonders am Abend. Könnten Sie bitte so schnell wie möglich einen Handwerker schicken? Ich bin am Montag und Dienstag ab 16 Uhr zu Hause. Vielen Dank im Voraus. Mit freundlichen Grüßen, Amir Rahimi',
    checklist:
      'Check the three points: the problem and since when (seit), a polite request (Könnten Sie …?) and times. Start with Sehr geehrte Frau Becker, and end with Mit freundlichen Grüßen.',
  },
  'de-forum': {
    track: 'DE',
    label: 'Forum',
    title: 'Ihre Meinung im Forum',
    prompt:
      'Im Online-Forum einer Zeitschrift diskutieren Leserinnen und Leser über das Thema „Homeoffice“. Schreiben Sie Ihre Meinung mit Gründen und einem Beispiel (ca. 80 Wörter).',
    promptHelp:
      'Readers are discussing working from home in an online forum. Give your opinion with reasons and an example (about 80 words).',
    minimum: 50,
    target: 'B1 opinion post, similar to Goethe B1 Schreiben Teil 2.',
    example:
      'Ich finde Homeoffice grundsätzlich sehr praktisch. Ein großer Vorteil ist, dass man keine Zeit im Stau verliert. Ich arbeite zum Beispiel zweimal pro Woche zu Hause und kann dadurch morgens länger schlafen. Andererseits sieht man die Kollegen seltener, und manchmal fühle ich mich allein. Deshalb ist eine Mischung meiner Meinung nach die beste Lösung: zwei oder drei Tage zu Hause und den Rest im Büro.',
    checklist:
      'Check that you give your opinion, at least one reason (weil/denn), an example and a conclusion. Linking words such as andererseits and deshalb help.',
  },
} as const satisfies Record<string, WritingTask>;
export type WritingTaskId = keyof typeof writingTasks;

export function tasksForTrack(track: 'EN' | 'DE') {
  return (Object.keys(writingTasks) as WritingTaskId[]).filter(
    (id) => writingTasks[id].track === track,
  );
}

export function parseWritingFeedback(value: unknown): WritingFeedback | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const item = value as Record<string, unknown>;
  const text = (entry: unknown, max: number) =>
    typeof entry === 'string' && entry.trim() ? entry.trim().slice(0, max) : null;
  const criteria = Array.isArray(item.criteria)
    ? item.criteria.flatMap((entry) => {
        const row = entry as Record<string, unknown>;
        const name = text(row?.name, 40);
        const comment = text(row?.comment, 300);
        return name &&
          comment &&
          (row.rating === 'strong' || row.rating === 'developing' || row.rating === 'needs work')
          ? [{ name, rating: row.rating as WritingRating, comment }]
          : [];
      })
    : [];
  const corrections = Array.isArray(item.corrections)
    ? item.corrections.flatMap((entry) => {
        const row = entry as Record<string, unknown>;
        const original = text(row?.original, 240);
        const corrected = text(row?.corrected, 280);
        const why = text(row?.why, 240);
        return original && corrected && why ? [{ original, corrected, why }] : [];
      })
    : [];
  const summary = text(item.summary, 500);
  const improvedVersion = text(item.improvedVersion, 3000);
  const nextStep = text(item.nextStep, 300);
  const createdAt = text(item.createdAt, 40);
  if (
    !summary ||
    !improvedVersion ||
    !nextStep ||
    !createdAt ||
    !Number.isFinite(Date.parse(createdAt)) ||
    criteria.length < 1
  )
    return undefined;
  return {
    createdAt,
    summary,
    criteria: criteria.slice(0, 4),
    corrections: corrections.slice(0, 5),
    improvedVersion,
    nextStep,
    forText: typeof item.forText === 'string' ? item.forText.slice(0, 8000) : '',
  };
}

export function parseWritingProgress(value: unknown): WritingProgress {
  if (!value || typeof value !== 'object') return {};
  const result: WritingProgress = {};
  for (const id of Object.keys(writingTasks)) {
    const row = (value as WritingProgress)[id];
    if (
      row &&
      typeof row.text === 'string' &&
      typeof row.submitted === 'string' &&
      typeof row.updatedAt === 'string' &&
      Number.isFinite(Date.parse(row.updatedAt))
    ) {
      const feedback = parseWritingFeedback(row.feedback);
      result[id] = {
        text: row.text.slice(0, 8000),
        submitted: row.submitted.slice(0, 8000),
        updatedAt: row.updatedAt,
        ...(feedback ? { feedback } : {}),
      };
    }
  }
  return result;
}
export function mergeWritingProgress(local: WritingProgress, remote: WritingProgress) {
  const result = parseWritingProgress(local);
  for (const [id, entry] of Object.entries(parseWritingProgress(remote))) {
    if (!result[id] || Date.parse(entry.updatedAt) > Date.parse(result[id].updatedAt))
      result[id] = entry;
  }
  return result;
}
export function writingChecklist(text: string, id: WritingTaskId, examMode = false) {
  const task: WritingTask = writingTasks[id];
  const words = countWritingWords(text);
  const minimum = examMode && task.exam ? task.exam.minimum : task.minimum;
  const tips = [
    `${words} words. ${words >= minimum ? (examMode ? 'Meets the exam minimum.' : 'Enough for this short practice.') : `Aim for at least ${minimum}.`}`,
    /[.!?](?:\s|$)/.test(text)
      ? 'Sentence-ending punctuation found. Check that each sentence expresses a complete idea.'
      : 'Add sentence-ending punctuation so your ideas are easier to follow.',
    task.checklist,
  ];
  const openers = text.match(/(?:^|[.!?]\s+)(Moreover|Furthermore|Additionally|In addition)\b/g);
  if (task.track === 'EN' && (openers?.length ?? 0) >= 3)
    tips.push(
      'Several sentences start with Moreover/Furthermore. Vary your linking so it sounds natural.',
    );
  if (id === 'letter' && /\b(?:gonna|wanna|gotta)\b/i.test(text))
    tips.push('Avoid very informal forms such as gonna or wanna in a letter to an organiser.');
  if (task.track === 'DE' && id === 'de-email' && /\b(du|dich|dir|dein)\b/i.test(text))
    tips.push('This is a formal email: use Sie, Ihnen and Ihr instead of du forms.');
  tips.push('These are rule-based revision prompts, not a grammar assessment or an exam score.');
  return tips;
}
