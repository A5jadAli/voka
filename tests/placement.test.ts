import { describe, expect, it } from '@jest/globals';
import { foundationLessons } from '@/features/foundations/catalog';
import {
  evaluatePlacement,
  placementItems,
  placementStages,
  STAGE_SIZE,
} from '@/features/placement/items';

const answerAll = (track: 'DE' | 'EN', upTo: number, wrongFrom?: number) =>
  Object.fromEntries(
    placementStages(track)
      .slice(0, upTo)
      .flatMap((stage, stageIndex) =>
        stage.map((item) => [
          item.id,
          wrongFrom !== undefined && stageIndex >= wrongFrom
            ? (item.answer + 1) % item.options.length
            : item.answer,
        ]),
      ),
  );

describe('placement check', () => {
  it.each(['DE', 'EN'] as const)(
    '%s has balanced stages with listening and pragmatics',
    (track) => {
      const items = placementItems[track];
      expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
      for (const stage of placementStages(track)) {
        expect(stage).toHaveLength(STAGE_SIZE);
        const skills = new Set(stage.map((item) => item.skill));
        expect(skills.has('listening')).toBe(true);
        expect(skills.has('pragmatics') || skills.has('reading')).toBe(true);
        for (const item of stage) {
          expect(new Set(item.options).size).toBe(item.options.length);
          expect(item.options[item.answer]).toBeTruthy();
          if (item.skill === 'listening') expect(item.audio).toBeTruthy();
        }
      }
    },
  );

  it('sends a complete beginner to the first German lesson', () => {
    const result = evaluatePlacement('DE', answerAll('DE', 1, 0));
    expect(result.secure).toBeNull();
    expect(result.recommendation.href).toBe('/foundation/greetings');
  });

  it('starts a learner at the first lesson of the level they did not secure', () => {
    const result = evaluatePlacement('DE', answerAll('DE', 3, 2));
    expect(result.secure).toBe('A2');
    const id = result.recommendation.href.replace('/foundation/', '');
    expect(foundationLessons.find((lesson) => lesson.id === id)?.level).toBe('B1');
  });

  it('points learners beyond the guided path to live conversation', () => {
    expect(evaluatePlacement('DE', answerAll('DE', 4, 3)).recommendation.href).toBe(
      '/conversation?track=DE',
    );
    const all = evaluatePlacement('EN', answerAll('EN', 4));
    expect(all.secure).toBe('C1');
    expect(all.recommendation.href).toBe('/conversation?track=EN');
  });

  it('stops scoring at the first stage below the pass mark', () => {
    const answers = { ...answerAll('EN', 1, 0), ...answerAll('EN', 3) };
    for (const item of placementStages('EN')[0]) answers[item.id] = (item.answer + 1) % 3;
    const result = evaluatePlacement('EN', answers);
    expect(result.secure).toBeNull();
    expect(result.recommendation.href).toBe('/foundation/en-sounds');
  });
});
