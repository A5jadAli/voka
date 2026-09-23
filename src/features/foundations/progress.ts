import { foundationLessons } from './catalog';

export type FoundationAttempt = { at: string; correctFirstTry: number; spoken: boolean };
export type FoundationEntry = {
  step: number;
  answers: number[];
  firstTry: boolean[];
  draft: string;
  writingMistakes: number;
  attempts: FoundationAttempt[];
  updatedAt: string;
};
export type FoundationProgress = Record<string, FoundationEntry>;

export function freshFoundationEntry(): FoundationEntry {
  return {
    step: 0,
    answers: [],
    firstTry: [],
    draft: '',
    writingMistakes: 0,
    attempts: [],
    updatedAt: new Date().toISOString(),
  };
}

export function parseFoundationProgress(value: unknown): FoundationProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: FoundationProgress = {};
  for (const lesson of foundationLessons) {
    const raw = (value as Record<string, unknown>)[lesson.id];
    if (!raw || typeof raw !== 'object') continue;
    const entry = raw as FoundationEntry;
    if (
      !Number.isInteger(entry.step) ||
      entry.step < 0 ||
      entry.step > 4 ||
      !Array.isArray(entry.answers) ||
      !entry.answers.every((v) => Number.isInteger(v) && v >= -1 && v < 3) ||
      !Array.isArray(entry.firstTry) ||
      !entry.firstTry.every((v) => typeof v === 'boolean') ||
      typeof entry.draft !== 'string' ||
      !Number.isInteger(entry.writingMistakes) ||
      entry.writingMistakes < 0 ||
      typeof entry.updatedAt !== 'string' ||
      !Number.isFinite(Date.parse(entry.updatedAt))
    )
      continue;
    const attempts = Array.isArray(entry.attempts)
      ? entry.attempts
          .filter(
            (a) =>
              a &&
              typeof a.at === 'string' &&
              Number.isFinite(Date.parse(a.at)) &&
              Number.isInteger(a.correctFirstTry) &&
              a.correctFirstTry >= 0 &&
              a.correctFirstTry <= 3 &&
              typeof a.spoken === 'boolean',
          )
          .slice(-10)
      : [];
    result[lesson.id] = {
      step: entry.step === 4 && !attempts.length ? 0 : entry.step,
      answers: entry.answers.slice(0, 2),
      firstTry: entry.firstTry.slice(0, 2),
      draft: entry.draft.slice(0, 256),
      writingMistakes: Math.min(entry.writingMistakes, 1000),
      updatedAt: entry.updatedAt,
      attempts,
    };
  }
  return result;
}

export function mergeFoundationProgress(local: FoundationProgress, remote: FoundationProgress) {
  const result = { ...local };
  for (const [id, incoming] of Object.entries(parseFoundationProgress(remote))) {
    const current = result[id];
    if (!current) {
      result[id] = incoming;
      continue;
    }
    const latest =
      Date.parse(incoming.updatedAt) > Date.parse(current.updatedAt) ? incoming : current;
    const attempts = [
      ...new Map(
        [...current.attempts, ...incoming.attempts].map((attempt) => [attempt.at, attempt]),
      ).values(),
    ]
      .sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
      .slice(-10);
    result[id] = { ...latest, attempts };
  }
  return result;
}

export function foundationReviewDue(entry: FoundationEntry | undefined, now = Date.now()) {
  const last = entry?.attempts.at(-1);
  return Boolean(last && now - Date.parse(last.at) >= 24 * 60 * 60 * 1000);
}
