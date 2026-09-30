import { describe, expect, it } from '@jest/globals';

import { readAuthRedirect } from '@/features/auth/oauth-redirect';

describe('OAuth redirect parsing', () => {
  it('reads tokens from the URL fragment', () => {
    expect(
      readAuthRedirect(
        'voka://oauth-callback#access_token=aaa&refresh_token=rrr&token_type=bearer',
      ),
    ).toEqual({ kind: 'tokens', accessToken: 'aaa', refreshToken: 'rrr' });
  });

  it('reads a PKCE code from the query', () => {
    expect(readAuthRedirect('https://app.example/oauth-callback?code=abc123')).toEqual({
      kind: 'code',
      code: 'abc123',
    });
  });

  it('recognises a Google account that already belongs to another user', () => {
    expect(
      readAuthRedirect(
        'voka://oauth-callback?error=server_error&error_code=identity_already_exists&error_description=Identity+is+already+linked+to+another+user',
      ),
    ).toEqual({ kind: 'existing-account' });
  });

  it('treats a declined consent screen as a cancel, not an error', () => {
    expect(
      readAuthRedirect('voka://oauth-callback#error=access_denied&error_description=User+denied'),
    ).toEqual({ kind: 'cancelled' });
  });

  it('surfaces other provider errors with a readable message', () => {
    expect(
      readAuthRedirect(
        'voka://oauth-callback?error=server_error&error_description=Provider+is+down',
      ),
    ).toEqual({ kind: 'error', message: 'Provider is down' });
  });

  it('reports an empty redirect and an unreadable link', () => {
    expect(readAuthRedirect('voka://oauth-callback')).toEqual({ kind: 'empty' });
    expect(readAuthRedirect('not a url').kind).toBe('error');
  });

  it('never accepts an access token without its refresh token', () => {
    expect(readAuthRedirect('voka://oauth-callback#access_token=aaa')).toEqual({ kind: 'empty' });
  });
});
