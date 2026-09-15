import { describe, expect, it } from '@jest/globals';

import { mergeCoachingSignal } from '@/features/coaching/signals';
import { cefrLevels, curriculumUnits, getCurriculumUnits } from '@/features/curriculum/catalog';

describe('speaking curriculum', () => {
  it.each(['EN', 'DE'] as const)('covers A1–C1 for %s with usable lesson data', (track) => {
    const units = getCurriculumUnits(track);

    expect(units).toHaveLength(5);
    expect(units.map((unit) => unit.level)).toEqual(cefrLevels);
    units.forEach((unit) => {
      expect(unit.track).toBe(track);
      expect(unit.phrases.length).toBeGreaterThanOrEqual(3);
      expect(unit.pronunciationFocus.length).toBeGreaterThan(10);
      expect(unit.coachBrief.length).toBeGreaterThan(20);
    });
  });

  it('uses unique stable ids', () => {
    expect(new Set(curriculumUnits.map((unit) => unit.id)).size).toBe(curriculumUnits.length);
  });
});

describe('coaching memory', () => {
  it('increments an observed signal without duplicating it', () => {
    const incoming = {
      focus: 'Sentence stress',
      label: 'Hesitation',
      reason: 'Several fillers were heard.',
      track: 'EN' as const,
    };
    const first = mergeCoachingSignal([], incoming, '2026-01-01T00:00:00.000Z');
    const second = mergeCoachingSignal(first, incoming, '2026-01-02T00:00:00.000Z');

    expect(second).toHaveLength(1);
    expect(second[0]).toMatchObject({ count: 2, lastSeenAt: '2026-01-02T00:00:00.000Z' });
  });
});
