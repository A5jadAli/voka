import { describe, expect, it } from '@jest/globals';
import { foundationLessons, getTrackLessons } from '@/features/foundations/catalog';
import {
  freshFoundationEntry,
  parseFoundationProgress,
  type FoundationEntry,
  type FoundationProgress,
} from '@/features/foundations/progress';
import {
  buildReviewSession,
  dueCards,
  gradeCard,
  REVIEW_INTERVALS,
  reviewSummary,
  seedCards,
} from '@/features/review/schedule';

const today = 20_000;
const greetings = foundationLessons.find((lesson) => lesson.id === 'greetings')!;

function progressWith(cards: [number, number][], id = 'greetings'): FoundationProgress {
  return { [id]: { ...freshFoundationEntry(), cards } };
}

describe('spaced review', () => {
  it('seeds one card per phrase, due tomorrow, without resetting existing cards', () => {
    const cards = seedCards(greetings, freshFoundationEntry(), today);
    expect(cards).toHaveLength(greetings.phrases.length);
    expect(cards.every(([box, due]) => box === 0 && due === today + 1)).toBe(true);
    const kept = seedCards(
      greetings,
      { ...freshFoundationEntry(), cards: [[3, today + 9]] },
      today,
    );
    expect(kept[0]).toEqual([3, today + 9]);
    expect(kept).toHaveLength(greetings.phrases.length);
  });

  it('expands the interval after success and resets after a miss', () => {
    let entry: FoundationEntry = { ...freshFoundationEntry(), cards: [[0, today]] };
    entry = gradeCard(entry, 0, true, today);
    expect(entry.cards![0]).toEqual([1, today + REVIEW_INTERVALS[1]]);
    entry = gradeCard(entry, 0, true, today);
    expect(entry.cards![0]).toEqual([2, today + REVIEW_INTERVALS[2]]);
    entry = gradeCard(entry, 0, false, today);
    expect(entry.cards![0]).toEqual([0, today + 1]);
  });

  it('returns only due cards for the track and builds valid three-option items', () => {
    const progress = {
      ...progressWith([
        [0, today - 1],
        [1, today],
        [2, today],
        [3, today + 5],
      ]),
      ...progressWith([[0, today]], 'en-small-talk'),
    };
    expect(dueCards(progress, 'DE', today)).toHaveLength(3);
    expect(dueCards(progress, 'EN', today)).toHaveLength(1);
    const session = buildReviewSession(progress, 'DE', today);
    expect(session.map((item) => item.kind)).toEqual(['choose', 'listen', 'recall']);
    for (const item of session) {
      expect(item.options).toHaveLength(3);
      expect(new Set(item.options).size).toBe(3);
      const expected = item.kind === 'choose' ? item.target : item.meaning;
      expect(item.options[item.answer]).toBe(expected);
    }
    expect(reviewSummary(progress, 'DE', today)).toEqual({
      due: 3,
      learning: 4,
      strong: 1,
      nextInDays: 0,
    });
  });

  it('can build a review item for every phrase in every lesson', () => {
    for (const track of ['DE', 'EN'] as const) {
      const progress: FoundationProgress = Object.fromEntries(
        getTrackLessons(track).map((lesson) => [
          lesson.id,
          {
            ...freshFoundationEntry(),
            cards: lesson.phrases.map(() => [0, today] as [number, number]),
          },
        ]),
      );
      const session = buildReviewSession(progress, track, today, 10_000);
      expect(session.length).toBe(getTrackLessons(track).reduce((n, l) => n + l.phrases.length, 0));
      for (const item of session) expect(item.options[item.answer]).toBeTruthy();
    }
  });

  it('keeps valid cards through cloud parsing and drops a malformed set', () => {
    const parsed = parseFoundationProgress({
      greetings: { ...freshFoundationEntry(), cards: [[1, today]] },
      introductions: { ...freshFoundationEntry(), cards: [[9, today]] },
    });
    expect(parsed.greetings.cards).toEqual([[1, today]]);
    expect(parsed.introductions.cards).toBeUndefined();
  });
});
