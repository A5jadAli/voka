import { countWritingWords } from './validation';

export type WritingDraft = { text: string; submitted: string; updatedAt: string };
export type WritingProgress = Record<string, WritingDraft>;
export const writingTasks = {
  chart: {
    title: 'Describe a weekly trend',
    prompt:
      'Describe the coffee sales chart. Give an overview, identify the busiest day, and compare two figures.',
    minimum: 12,
    target:
      'Short chart practice. A full IELTS Academic Task 1 response normally needs at least 150 words.',
    example:
      'Coffee sales fluctuated during the week, reaching a peak of 76 cups on Friday. Sales then fell to 34 on Saturday and 27 on Sunday. Friday sold more than twice as many cups as Monday, when 33 were sold.',
  },
  letter: {
    title: 'Write a useful request',
    prompt:
      'You booked an English course, but your work schedule has changed. Write to the course organiser. Explain the problem, request a different class time, and ask how to change your booking.',
    minimum: 40,
    target:
      'Everyday email and IELTS General Training letter practice. Build towards at least 150 words for a full exam task.',
    example:
      'Dear Course Organiser, I am writing about my evening English class. My work schedule has changed, so I can no longer attend on Tuesdays. Could I move to a Thursday class instead? Please let me know whether a place is available and how I should change my booking. Thank you for your help. Kind regards, Alex',
  },
  opinion: {
    title: 'Explain and support an opinion',
    prompt:
      'Some people prefer learning online; others prefer a classroom. Discuss both views and give your own opinion. Support your ideas with reasons and examples.',
    minimum: 60,
    target:
      'General English and IELTS Task 2 planning practice. A full exam response normally needs at least 250 words.',
    example:
      'Online learning offers flexibility, which helps people who work irregular hours. For example, a nurse can study after a late shift. Classroom learning, however, provides immediate interaction and a regular routine. I prefer a combination: online lessons for independent study and classroom meetings for discussion. The most useful choice depends on the learner’s weekly schedule and their access to reliable internet.',
  },
} as const;
export type WritingTaskId = keyof typeof writingTasks;
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
      result[id] = {
        text: row.text.slice(0, 8000),
        submitted: row.submitted.slice(0, 8000),
        updatedAt: row.updatedAt,
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
export function writingChecklist(text: string, id: WritingTaskId) {
  const words = countWritingWords(text);
  return [
    `${words} words. ${words >= writingTasks[id].minimum ? 'Enough for this short practice.' : `Aim for at least ${writingTasks[id].minimum}.`}`,
    /[.!?](?:\s|$)/.test(text)
      ? 'Sentence-ending punctuation found. Check that each sentence expresses a complete idea.'
      : 'Add sentence-ending punctuation so your ideas are easier to follow.',
    id === 'chart'
      ? 'Check your facts against the chart: Friday is highest (76), Sunday lowest (27). Include an overview and a comparison.'
      : id === 'letter'
        ? 'Check all three points: explain the problem, request another time, and ask how to change the booking. Use an appropriate greeting and ending.'
        : 'Check that you discuss both views, state your opinion, and support it with a specific example.',
    'These are rule-based revision prompts, not a grammar assessment or an IELTS band score.',
  ];
}
