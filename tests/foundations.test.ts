import { describe, expect, it } from '@jest/globals';
import { checkFoundationWriting, foundationLessons } from '@/features/foundations/catalog';
import {
  foundationReviewDue,
  freshFoundationEntry,
  mergeFoundationProgress,
  parseFoundationProgress,
} from '@/features/foundations/progress';

describe('German foundation content and evidence', () => {
  it('has unique lessons, translated phrases, valid checks and model writing answers', () => {
    expect(new Set(foundationLessons.map((lesson) => lesson.id)).size).toBe(
      foundationLessons.length,
    );
    for (const lesson of foundationLessons) {
      expect(lesson.checks).toHaveLength(2);
      for (const phrase of lesson.phrases) {
        expect(phrase.english).toBeTruthy();
        expect(phrase.german).toBeTruthy();
      }
      for (const question of lesson.checks) {
        expect(question.options).toHaveLength(3);
        expect(question.options[question.answer]).toBeTruthy();
        expect(question.explanation).toBeTruthy();
      }
      for (const answer of lesson.writing.accepted)
        expect(checkFoundationWriting(lesson, answer)).toBe(true);
      expect(checkFoundationWriting(lesson, 'random unrelated words')).toBe(false);
      expect(checkFoundationWriting(lesson, '')).toBe(false);
    }
  });
  it('allows beginner punctuation, case and keyboard ss without accepting the wrong meaning', () => {
    const lesson = foundationLessons[1];
    expect(checkFoundationWriting(lesson, '  ich heisse   Sara! ')).toBe(true);
    expect(checkFoundationWriting(lesson, 'Ich heiße nicht Sara.')).toBe(false);
    expect(checkFoundationWriting(lesson, 'Ich heißen Sara')).toBe(false);
  });
  it('bounds cloud drafts and history and rejects malformed or unknown lessons', () => {
    const entry = freshFoundationEntry();
    const parsed = parseFoundationProgress({
      greetings: {
        ...entry,
        draft: 'a'.repeat(400),
        attempts: Array(20).fill({ at: entry.updatedAt, correctFirstTry: 2, spoken: false }),
      },
      unknown: entry,
      introductions: { ...entry, step: 900 },
    });
    expect(Object.keys(parsed)).toEqual(['greetings']);
    expect(parsed.greetings.draft).toHaveLength(256);
    expect(parsed.greetings.attempts).toHaveLength(10);
    expect(parseFoundationProgress(null)).toEqual({});
  });
  it('keeps the latest draft while combining recorded attempts from two devices', () => {
    const older = '2026-09-22T10:00:00.000Z';
    const newer = '2026-09-23T10:00:00.000Z';
    const merged = mergeFoundationProgress(
      {
        greetings: {
          ...freshFoundationEntry(),
          draft: 'new local draft',
          updatedAt: newer,
          attempts: [{ at: newer, correctFirstTry: 3, spoken: true }],
        },
      },
      {
        greetings: {
          ...freshFoundationEntry(),
          draft: 'old remote draft',
          updatedAt: older,
          attempts: [{ at: older, correctFirstTry: 1, spoken: false }],
        },
      },
    );
    expect(merged.greetings.draft).toBe('new local draft');
    expect(merged.greetings.attempts).toHaveLength(2);
    expect(foundationReviewDue(merged.greetings, Date.parse(newer) + 23 * 3600000)).toBe(false);
    expect(foundationReviewDue(merged.greetings, Date.parse(newer) + 24 * 3600000)).toBe(true);
    expect(foundationReviewDue(undefined)).toBe(false);
  });
});
