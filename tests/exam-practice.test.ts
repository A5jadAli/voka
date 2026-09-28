import { describe, expect, it } from '@jest/globals';
import {
  parseWritingFeedback,
  parseWritingProgress,
  tasksForTrack,
  writingChecklist,
  writingTasks,
} from '@/features/writing/progress';
import { writingTaskSpecs } from '../supabase/functions/_shared/writing-tasks';
import {
  examinerBrief,
  getSpeakingCard,
  speakingCards,
} from '../supabase/functions/_shared/speaking-cards';

const feedback = {
  createdAt: '2026-09-28T10:00:00.000Z',
  summary: 'Clear message with a friendly tone.',
  criteria: [
    { name: 'Task', rating: 'strong', comment: 'All three points are covered.' },
    { name: 'Grammar', rating: 'developing', comment: 'Check verb position after weil.' },
  ],
  corrections: [
    { original: 'weil ich habe Zeit', corrected: 'weil ich Zeit habe', why: 'Verb last.' },
  ],
  improvedVersion: 'Hallo Lena, …',
  nextStep: 'Practise weil clauses.',
  forText: 'Hallo Lena',
};

describe('writing tasks and AI feedback', () => {
  it('keeps client tasks and server task specs in step for both languages', () => {
    expect(Object.keys(writingTasks).sort()).toEqual(Object.keys(writingTaskSpecs).sort());
    for (const [id, task] of Object.entries(writingTasks))
      expect(writingTaskSpecs[id].track).toBe(task.track);
    expect(tasksForTrack('DE')).toEqual(['de-message', 'de-email', 'de-forum']);
    expect(tasksForTrack('EN')).toEqual(['chart', 'letter', 'opinion']);
  });

  it('accepts valid feedback, drops invalid ratings and never stores scores', () => {
    const parsed = parseWritingFeedback(feedback)!;
    expect(parsed.criteria).toHaveLength(2);
    expect(parsed.corrections[0].corrected).toBe('weil ich Zeit habe');
    const withBadRow = parseWritingFeedback({
      ...feedback,
      criteria: [...feedback.criteria, { name: 'Vocabulary', rating: 'band 7', comment: 'x' }],
    })!;
    expect(withBadRow.criteria).toHaveLength(2);
    expect(parseWritingFeedback({ ...feedback, summary: '' })).toBeUndefined();
    expect(JSON.stringify(parsed)).not.toMatch(/band|score/i);
  });

  it('persists feedback through cloud parsing', () => {
    const progress = parseWritingProgress({
      'de-message': {
        text: 'Hallo Lena',
        submitted: 'Hallo Lena',
        updatedAt: feedback.createdAt,
        feedback,
      },
    });
    expect(progress['de-message'].feedback?.nextStep).toBe('Practise weil clauses.');
  });

  it('adds register and exam-length checks', () => {
    expect(
      writingChecklist('Hallo Frau Becker, kannst du die Heizung reparieren?', 'de-email').join(
        ' ',
      ),
    ).toContain('use Sie');
    expect(writingChecklist('Short text.', 'opinion', true)[0]).toContain('at least 250');
    const essay = 'I agree. Moreover, it helps. Furthermore, it is cheap. Moreover, it is fast.';
    expect(writingChecklist(essay, 'opinion').join(' ')).toContain('Vary your linking');
  });
});

describe('speaking mock cards', () => {
  it('has unique cards for both exams with timings and examiner briefs', () => {
    expect(new Set(speakingCards.map((card) => card.id)).size).toBe(speakingCards.length);
    expect(speakingCards.filter((card) => card.part === 'ielts-2').length).toBeGreaterThanOrEqual(
      6,
    );
    expect(speakingCards.filter((card) => card.track === 'DE').length).toBeGreaterThanOrEqual(6);
    for (const card of speakingCards) {
      expect(card.bullets.length).toBeGreaterThanOrEqual(4);
      expect(card.prepSeconds).toBeGreaterThanOrEqual(60);
      const brief = examinerBrief(card);
      expect(brief).toContain(card.title);
      expect(brief).toMatch(/Never give a (band )?score/);
    }
    expect(getSpeakingCard('not-a-card')).toBeUndefined();
  });
});
