import { describe, expect, it } from '@jest/globals';

import { getProfileDisplayName, getProfileInitials } from '@/features/profile/name';

describe('profile identity', () => {
  it('uses the account display name and its first and last initials', () => {
    const displayName = getProfileDisplayName({
      email: 'fallback@example.com',
      isPermanent: true,
      metadata: { display_name: '  Asjad   Muhammad Ali  ' },
    });

    expect(displayName).toBe('Asjad Muhammad Ali');
    expect(getProfileInitials(displayName)).toBe('AA');
  });

  it('uses safe fallbacks for guests and accounts without names', () => {
    expect(getProfileDisplayName({ isPermanent: false })).toBe('Guest learner');
    expect(getProfileDisplayName({ email: 'learner@example.com', isPermanent: true })).toBe(
      'learner',
    );
    expect(getProfileInitials('Guest learner')).toBe('GL');
    expect(getProfileInitials('')).toBe('L');
  });
});
