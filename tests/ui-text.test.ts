import { describe, expect, it } from '@jest/globals';

import { normalizeUiText } from '@/utils/ui-text';

describe('UI text normalization', () => {
  it('replaces em dashes from dynamic provider text', () => {
    const emDash = String.fromCodePoint(0x2014);
    expect(normalizeUiText(`Clear feedback ${emDash} with a next step.`)).toBe(
      'Clear feedback, with a next step.',
    );
    expect(normalizeUiText(`Clear feedback${emDash}with a next step.`)).not.toContain(emDash);
  });
});
