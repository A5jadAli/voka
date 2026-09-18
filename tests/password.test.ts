import { describe, expect, it } from '@jest/globals';

import { getPasswordChecks, isStrongPassword } from '@/features/auth/password';

describe('password validation', () => {
  it('requires length, upper and lowercase letters, a number and a symbol', () => {
    expect(isStrongPassword('Short1!')).toBe(false);
    expect(isStrongPassword('longbutnosymbol1A')).toBe(false);
    expect(isStrongPassword('Good1!Aa')).toBe(true);
  });

  it('reports each unmet requirement for inline feedback', () => {
    expect(getPasswordChecks('lower')).toEqual({
      length: false,
      lowercase: true,
      number: false,
      symbol: false,
      uppercase: false,
    });
  });
});
