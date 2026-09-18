import { describe, expect, it } from '@jest/globals';

import { parseSpokenAssessment } from '@/features/assessment/types';

describe('spoken assessment parsing', () => {
  it('accepts a bounded valid assessment', () => {
    expect(
      parseSpokenAssessment({
        confidence: 'medium',
        createdAt: '2026-09-18T00:00:00.000Z',
        estimatedLevel: 'B1',
        evidenceTurnCount: 4.9,
        id: 'assessment-1',
        priorities: ['Use clearer past tense'],
        strengths: ['Answers follow-up questions'],
        summary: 'A practical intermediate range.',
        track: 'EN',
      }),
    ).toMatchObject({ estimatedLevel: 'B1', evidenceTurnCount: 4, track: 'EN' });
  });

  it('rejects invented levels and empty evidence', () => {
    expect(parseSpokenAssessment({ estimatedLevel: 'C2' })).toBeNull();
    expect(
      parseSpokenAssessment({
        confidence: 'low',
        createdAt: '2026-09-18T00:00:00.000Z',
        estimatedLevel: 'A1',
        evidenceTurnCount: 0,
        id: 'bad',
        priorities: [],
        strengths: [],
        summary: 'No evidence.',
        track: 'DE',
      }),
    ).toBeNull();
  });
});
