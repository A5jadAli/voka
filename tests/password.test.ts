import { describe, expect, it } from '@jest/globals';

import { getPasswordChecks, isStrongPassword } from '@/features/auth/password';

describe('password validation', () => {
  it('requires 15 characters without composition rules', () => {
    expect(isStrongPassword('12345678901234')).toBe(false);
    expect(isStrongPassword('123456789012345')).toBe(true);
    expect(isStrongPassword('correct horse battery staple')).toBe(true);
  });

  it('reports each unmet requirement for inline feedback', () => {
    expect(getPasswordChecks('lower')).toEqual({
      length: false,
    });
  });
});
