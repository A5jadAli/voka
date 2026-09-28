import {
  getTrackLessons,
  optionOrder,
  type FoundationLesson,
  type LessonTrack,
} from '@/features/foundations/catalog';
import type { FoundationEntry, FoundationProgress } from '@/features/foundations/progress';

/** Days until the next review for each Leitner box. Expanding gaps favour long-term retention. */
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35, 90] as const;
export const REVIEW_SESSION_SIZE = 12;

export const dayNumber = (time = Date.now()) => Math.floor(time / 86_400_000);

export type ReviewKind = 'choose' | 'listen' | 'recall';
export type ReviewItem = {
  key: string;
  lessonId: string;
  phraseIndex: number;
  kind: ReviewKind;
  target: string;
  meaning: string;
  use: string;
  /** For choose/listen items: three options and the correct index. */
  options: string[];
  answer: number;
};

/** Adds a new card (due tomorrow) for every phrase that has none. Existing cards are kept. */
export function seedCards(lesson: FoundationLesson, entry: FoundationEntry, today = dayNumber()) {
  const cards = [...(entry.cards ?? [])];
  for (let index = cards.length; index < lesson.phrases.length; index++)
    cards.push([0, today + REVIEW_INTERVALS[0]]);
  return cards;
}

export function gradeCard(
  entry: FoundationEntry,
  phraseIndex: number,
  correct: boolean,
  today = dayNumber(),
): FoundationEntry {
  const cards = [...(entry.cards ?? [])];
  const [box] = cards[phraseIndex] ?? [0, today];
  const next = correct ? Math.min(box + 1, REVIEW_INTERVALS.length - 1) : 0;
  cards[phraseIndex] = [next, today + (correct ? REVIEW_INTERVALS[next] : 1)];
  return { ...entry, cards, updatedAt: new Date().toISOString() };
}

type DueCard = { lesson: FoundationLesson; phraseIndex: number; box: number; dueDay: number };

export function dueCards(
  progress: FoundationProgress,
  track: LessonTrack,
  today = dayNumber(),
): DueCard[] {
  return getTrackLessons(track)
    .flatMap((lesson) =>
      (progress[lesson.id]?.cards ?? []).map(([box, dueDay], phraseIndex) => ({
        lesson,
        phraseIndex,
        box,
        dueDay,
      })),
    )
    .filter((card) => card.dueDay <= today && card.lesson.phrases[card.phraseIndex])
    .sort((a, b) => a.dueDay - b.dueDay || a.box - b.box);
}

export function reviewSummary(
  progress: FoundationProgress,
  track: LessonTrack,
  today = dayNumber(),
) {
  const lessons = getTrackLessons(track);
  const all = lessons.flatMap((lesson) => progress[lesson.id]?.cards ?? []);
  return {
    due: dueCards(progress, track, today).length,
    learning: all.length,
    strong: all.filter(([box]) => box >= 3).length,
  };
}

export function buildReviewSession(
  progress: FoundationProgress,
  track: LessonTrack,
  today = dayNumber(),
  size = REVIEW_SESSION_SIZE,
): ReviewItem[] {
  const pool = getTrackLessons(track).flatMap((lesson) =>
    lesson.phrases.map((phrase) => ({ ...phrase, level: lesson.level })),
  );
  return dueCards(progress, track, today)
    .slice(0, size)
    .map(({ lesson, phraseIndex, box }) => {
      const phrase = lesson.phrases[phraseIndex];
      const key = `${lesson.id}#${phraseIndex}`;
      const kind: ReviewKind = box === 0 ? 'choose' : box === 1 ? 'listen' : 'recall';
      const field = kind === 'choose' ? 'target' : 'meaning';
      const correct = phrase[field];
      // Prefer distractors from the same level so options are plausible, not trivially different.
      const candidates = [
        ...pool.filter((item) => item.level === lesson.level),
        ...pool.filter((item) => item.level !== lesson.level),
      ]
        .map((item) => item[field])
        .filter((value, index, list) => value !== correct && list.indexOf(value) === index);
      const order = optionOrder(`${key}:${today}`, candidates.length);
      const distractors = order.slice(0, 2).map((index) => candidates[index]);
      const options = [correct, ...distractors];
      const display = optionOrder(`${key}:display:${today}`, options.length);
      const shuffled = display.map((index) => options[index]);
      return {
        key,
        lessonId: lesson.id,
        phraseIndex,
        kind,
        target: phrase.target,
        meaning: phrase.meaning,
        use: phrase.use,
        options: shuffled,
        answer: shuffled.indexOf(correct),
      };
    });
}
