import { describe, expect, it } from '@jest/globals';

import { getPasswordChecks, isStrongPassword } from '@/features/auth/password';

describe('password validation', () => {
  it('requires 8 characters with mixed-case letters, a number and a Supabase symbol', () => {
    expect(isStrongPassword('Voka2026!')).toBe(true);
    expect(isStrongPassword('Vo2026!')).toBe(false);
    expect(isStrongPassword('voka2026!')).toBe(false);
    expect(isStrongPassword('VokaVoka!')).toBe(false);
    expect(isStrongPassword('Voka20266')).toBe(false);
    expect(isStrongPassword('VOKA2026!')).toBe(false);
    expect(isStrongPassword('Voka2026€')).toBe(false);
    expect(isStrongPassword('Straße2026#')).toBe(true);
  });

  it('reports each unmet requirement for inline feedback', () => {
    expect(getPasswordChecks('lower')).toEqual({
      length: false,
      letters: false,
      number: false,
      special: false,
    });
    expect(getPasswordChecks('Lower 1 more!')).toEqual({
      length: true,
      letters: true,
      number: true,
      special: true,
    });
  });
});
