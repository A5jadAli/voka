// Server-side task definitions. Clients send only a task id, so learners cannot inject a prompt.
export type WritingTaskSpec = {
  track: 'EN' | 'DE';
  level: string;
  exam: string;
  prompt: string;
  minimumWords: number;
};

export const writingTaskSpecs: Record<string, WritingTaskSpec> = {
  chart: {
    track: 'EN',
    level: 'B1–B2',
    exam: 'IELTS Academic Writing Task 1 (shortened practice)',
    prompt:
      'Describe a bar chart of coffee sold each day (Mon 33, Tue 49, Wed 43, Thu 63, Fri 76, Sat 34, Sun 27). Give an overview, identify the busiest day and compare figures.',
    minimumWords: 12,
  },
  letter: {
    track: 'EN',
    level: 'B1',
    exam: 'IELTS General Training Writing Task 1 / everyday email',
    prompt:
      'You booked an English course, but your work schedule has changed. Write to the course organiser: explain the problem, request a different class time, and ask how to change your booking.',
    minimumWords: 40,
  },
  opinion: {
    track: 'EN',
    level: 'B1–B2',
    exam: 'IELTS Writing Task 2 (discuss both views and give your opinion)',
    prompt:
      'Some people prefer learning online; others prefer a classroom. Discuss both views and give your own opinion, with reasons and examples.',
    minimumWords: 60,
  },
  'de-message': {
    track: 'DE',
    level: 'A2',
    exam: 'Informal message (Goethe A2 Schreiben style)',
    prompt:
      'Write a message to your friend Lena: you cannot come to her party on Saturday. Apologise, give a reason and suggest another time to meet.',
    minimumWords: 25,
  },
  'de-email': {
    track: 'DE',
    level: 'B1',
    exam: 'Formal email (Goethe B1 Schreiben Teil 3 style)',
    prompt:
      'Write a formal email to your landlady, Frau Becker: the heating in your flat has not worked for three days. Describe the problem, ask for a quick repair and suggest times when you are at home.',
    minimumWords: 40,
  },
  'de-forum': {
    track: 'DE',
    level: 'B1',
    exam: 'Opinion post (Goethe B1 Schreiben Teil 2 style)',
    prompt:
      'In an online forum, readers discuss working from home. Write your opinion with reasons and an example from your experience (about 80 words).',
    minimumWords: 50,
  },
};
