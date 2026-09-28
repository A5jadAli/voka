import { describe, expect, it } from '@jest/globals';
import {
  checkFoundationWriting,
  foundationLessons,
  getTrackLessons,
  isNearMiss,
  optionOrder,
} from '@/features/foundations/catalog';
import {
  foundationReviewDue,
  freshFoundationEntry,
  MAX_DRAFT_LENGTH,
  MAX_FOUNDATION_ATTEMPTS,
  mergeFoundationProgress,
  parseFoundationProgress,
} from '@/features/foundations/progress';
import { MAX_LESSON_CHECKS } from '@/features/foundations/types';

const levelRank = { A1: 0, A2: 1, B1: 2, B2: 3 } as const;

describe('guided lesson content', () => {
  it('has unique ids, translated phrases, valid checks and model writing answers', () => {
    expect(new Set(foundationLessons.map((lesson) => lesson.id)).size).toBe(
      foundationLessons.length,
    );
    for (const lesson of foundationLessons) {
      expect(lesson.checks.length).toBeGreaterThanOrEqual(2);
      expect(lesson.checks.length).toBeLessThanOrEqual(MAX_LESSON_CHECKS);
      expect(lesson.phrases.length).toBeGreaterThanOrEqual(4);
      for (const phrase of lesson.phrases) {
        expect(phrase.target).toBeTruthy();
        expect(phrase.meaning).toBeTruthy();
        expect(phrase.use).toBeTruthy();
      }
      for (const question of lesson.checks) {
        expect(question.options).toHaveLength(3);
        expect(new Set(question.options).size).toBe(3);
        expect(question.options[question.answer]).toBeTruthy();
        expect(question.explanation).toBeTruthy();
        if (question.audio) expect(question.audio.trim().length).toBeGreaterThan(2);
      }
      for (const answer of lesson.writing.accepted) {
        expect(checkFoundationWriting(lesson, answer)).toBe(true);
        expect(answer.length).toBeLessThanOrEqual(MAX_DRAFT_LENGTH);
      }
      expect(checkFoundationWriting(lesson, 'random unrelated words')).toBe(false);
      expect(checkFoundationWriting(lesson, '')).toBe(false);
    }
  });

  it('builds German from A1 to B1 and English up to B2 in level order', () => {
    const german = getTrackLessons('DE');
    const english = getTrackLessons('EN');
    for (const level of ['A1', 'A2', 'B1'] as const)
      expect(german.filter((lesson) => lesson.level === level).length).toBeGreaterThanOrEqual(12);
    expect(english.length).toBeGreaterThanOrEqual(18);
    expect(english.filter((lesson) => lesson.id.includes('ielts')).length).toBeGreaterThanOrEqual(
      7,
    );
    // English groups B1/B2 lessons by topic; it must still start at A2 and never drop below it.
    expect(english[0].level).toBe('A2');
    expect(english.slice(3).every((lesson) => lesson.level !== 'A1' && lesson.level !== 'A2')).toBe(
      true,
    );
    expect(german[0].id).toBe('greetings');
    expect(german.map((lesson) => lesson.level)).toEqual(
      [...german.map((lesson) => lesson.level)].sort((a, b) => levelRank[a] - levelRank[b]),
    );
  });

  it('trains listening in most lessons and gives pronunciation guidance for speech', () => {
    for (const track of ['DE', 'EN'] as const) {
      const lessons = getTrackLessons(track);
      const withAudio = lessons.filter((lesson) => lesson.checks.some((check) => check.audio));
      expect(withAudio.length / lessons.length).toBeGreaterThanOrEqual(0.75);
    }
    for (const lesson of getTrackLessons('DE')) expect(lesson.pronunciation).toBeTruthy();
  });

  it('shuffles displayed options stably so answers are not predictable by position', () => {
    const shown = foundationLessons.flatMap((lesson) =>
      lesson.checks.map((check, index) =>
        optionOrder(`${lesson.id}:${index}`, check.options.length).indexOf(check.answer),
      ),
    );
    for (const position of [0, 1, 2])
      expect(shown.filter((value) => value === position).length / shown.length).toBeGreaterThan(
        0.2,
      );
    expect(optionOrder('greetings:0', 3)).toEqual(optionOrder('greetings:0', 3));
    expect([...optionOrder('x', 3)].sort()).toEqual([0, 1, 2]);
  });
});

describe('writing checks', () => {
  const introductions = foundationLessons.find((lesson) => lesson.id === 'introductions')!;

  it('allows punctuation, case, keyboard ss and umlaut spellings without accepting wrong meaning', () => {
    expect(checkFoundationWriting(introductions, '  ich heisse   Sara! ')).toBe(true);
    expect(checkFoundationWriting(introductions, 'Ich bin Sara.')).toBe(true);
    expect(checkFoundationWriting(introductions, 'Ich heiße nicht Sara.')).toBe(false);
    expect(checkFoundationWriting(introductions, 'Ich heißen Sara')).toBe(false);
    const sounds = foundationLessons.find((lesson) => lesson.id === 'de-sounds')!;
    expect(checkFoundationWriting(sounds, 'schoen')).toBe(true);
    expect(checkFoundationWriting(sounds, 'schon')).toBe(false);
    const repair = foundationLessons.find((lesson) => lesson.id === 'en-repair')!;
    expect(checkFoundationWriting(repair, "Sorry, I didn't catch that")).toBe(true);
  });

  it('flags near misses as close but still incorrect', () => {
    expect(isNearMiss(introductions, 'Ich heißen Sara')).toBe(true);
    expect(isNearMiss(introductions, 'Ich heiße Sara')).toBe(false);
    expect(isNearMiss(introductions, 'Guten Morgen, alle zusammen')).toBe(false);
  });
});

describe('lesson progress', () => {
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
    expect(parsed.greetings.draft).toHaveLength(MAX_DRAFT_LENGTH);
    expect(parsed.greetings.attempts).toHaveLength(MAX_FOUNDATION_ATTEMPTS);
    expect(parseFoundationProgress(null)).toEqual({});
  });

  it('keeps worst-case progress for every lesson under the 64 KB cloud limit', () => {
    const at = '2026-09-23T10:00:00.000Z';
    const full = Object.fromEntries(
      foundationLessons.map((lesson) => [
        lesson.id,
        {
          ...freshFoundationEntry(),
          step: 2,
          answers: lesson.checks.map((check) => check.answer),
          firstTry: lesson.checks.map(() => true),
          draft: 'ü'.repeat(256),
          cards: lesson.phrases.map(() => [5, 99999] as [number, number]),
          writingMistakes: 999,
          attempts: Array.from({ length: 20 }, (_, day) => ({
            at: new Date(Date.parse(at) + day * 86400000).toISOString(),
            correctFirstTry: lesson.checks.length + 1,
            spoken: true,
          })),
        },
      ]),
    );
    const parsed = parseFoundationProgress(full);
    expect(Object.keys(parsed)).toHaveLength(foundationLessons.length);
    // Postgres measures jsonb::text, which adds a space after every comma and colon.
    const postgresText = JSON.stringify(parsed).replace(/,/g, ', ').replace(/:/g, ': ');
    expect(new TextEncoder().encode(postgresText).length).toBeLessThan(65536);
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
          attempts: [{ at: newer, correctFirstTry: 4, spoken: true }],
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
