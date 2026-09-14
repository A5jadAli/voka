import { describe, expect, it } from '@jest/globals';

import { getScenario, getScenarios, listeningScenarios } from '@/features/listening/scenarios';

describe('listening scenario catalogue', () => {
  it.each(['EN', 'DE'] as const)('has a complete %s MVP track', (track) => {
    const scenarios = getScenarios(track);

    expect(scenarios).toHaveLength(3);
    expect(scenarios.every((scenario) => scenario.lines.length >= 2)).toBe(true);
    expect(scenarios.every((scenario) => scenario.phrases.length >= 3)).toBe(true);
  });

  it('uses unique ids and valid answer indexes', () => {
    const ids = listeningScenarios.map((scenario) => scenario.id);

    expect(new Set(ids).size).toBe(ids.length);
    listeningScenarios.forEach((scenario) => {
      expect(scenario.question.correctIndex).toBeGreaterThanOrEqual(0);
      expect(scenario.question.correctIndex).toBeLessThan(scenario.question.options.length);
      expect(scenario.lines.every((line) => line.text && line.translation)).toBe(true);
    });
  });

  it('falls back safely for missing or invalid lesson ids', () => {
    expect(getScenario()).toBe(listeningScenarios[0]);
    expect(getScenario('not-real')).toBe(listeningScenarios[0]);
  });
});
