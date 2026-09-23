import { describe, expect, it } from '@jest/globals';
import {
  mergeWritingProgress,
  parseWritingProgress,
  writingChecklist,
  writingTasks,
} from '@/features/writing/progress';
import { learningRecommendation } from '@/features/coaching/recommendation';
import { foundationLessons } from '@/features/foundations/catalog';
import { readingLessons } from '@/features/reading/catalog';
describe('learning plans, writing drafts and reading content', () => {
  it('uses ability and goal in actual destinations that exist', () => {
    for (const ability of ['new', 'basics', 'conversational'] as const)
      for (const goal of ['everyday', 'work-study'] as const) {
        const next = learningRecommendation('DE', ability, goal);
        expect(foundationLessons.some((lesson) => next.href === `/foundation/${lesson.id}`)).toBe(
          true,
        );
      }
    expect(learningRecommendation('EN', 'basics', 'ielts-academic').href).toContain('task=chart');
    expect(learningRecommendation('EN', 'basics', 'ielts-general').href).toContain('task=letter');
    expect(learningRecommendation('EN', 'conversational', 'ielts-academic').href).toContain(
      'task=opinion',
    );
    expect(learningRecommendation('EN', 'new', 'ielts-academic').href).toBe('/activity/listen');
  });
  it('bounds and validates drafts without conflating a draft and submitted response', () => {
    const row = { text: 'new draft', submitted: 'old response', updatedAt: '2026-09-23T10:00:00Z' };
    expect(parseWritingProgress({ chart: row, unknown: row })).toEqual({ chart: row });
    expect(parseWritingProgress({ chart: { ...row, updatedAt: 'not a date' } })).toEqual({});
    expect(
      parseWritingProgress({ chart: { ...row, text: 'a'.repeat(9000) } }).chart.text,
    ).toHaveLength(8000);
    expect(
      mergeWritingProgress(
        { chart: row },
        { chart: { ...row, text: 'stale', updatedAt: '2026-09-22T10:00:00Z' } },
      ).chart.text,
    ).toBe('new draft');
  });
  it('has original reading checks and honest writing feedback, never fabricated scores', () => {
    for (const lesson of readingLessons) {
      expect(lesson.text.length).toBeGreaterThan(200);
      for (const question of lesson.questions) {
        expect(question.options[question.answer]).toBeTruthy();
        expect(question.explanation.length).toBeGreaterThan(20);
      }
    }
    for (const id of Object.keys(writingTasks) as (keyof typeof writingTasks)[]) {
      const tips = writingChecklist(writingTasks[id].example, id);
      expect(tips.join(' ')).toContain('not a grammar assessment or an IELTS band score');
      expect(tips[0]).toContain('Enough for this short practice');
    }
  });
});
