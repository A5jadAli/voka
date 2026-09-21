import { describe, expect, it } from '@jest/globals';

import {
  countWritingWords,
  hasEnoughWriting,
  MINIMUM_WRITING_WORDS,
} from '@/features/writing/validation';

describe('writing response validation', () => {
  it('requires several words instead of accepting one long random string', () => {
    expect(MINIMUM_WRITING_WORDS).toBe(5);
    expect(hasEnoughWriting('jkhajkhjhjhjh')).toBe(false);
    expect(hasEnoughWriting('Sales rose and Friday was busiest.')).toBe(true);
  });

  it('counts words separated by repeated whitespace', () => {
    expect(countWritingWords('  Coffee   sales\nrose on Friday. ')).toBe(5);
  });
});
