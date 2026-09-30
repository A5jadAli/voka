// Pure parsing of the URL Supabase redirects to after an OAuth attempt. Tokens arrive in the
// URL fragment (implicit flow) or as a `code` query parameter (PKCE); errors arrive in either.
export type AuthRedirect =
  | { kind: 'tokens'; accessToken: string; refreshToken: string }
  | { kind: 'code'; code: string }
  | { kind: 'existing-account' }
  | { kind: 'cancelled' }
  | { kind: 'error'; message: string }
  | { kind: 'empty' };

export function readAuthRedirect(url: string): AuthRedirect {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: 'error', message: 'Google sign-in returned an unreadable link.' };
  }
  const fragment = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const get = (key: string) => fragment.get(key) ?? parsed.searchParams.get(key);

  const errorCode = get('error_code');
  const error = get('error');
  if (errorCode === 'identity_already_exists') return { kind: 'existing-account' };
  if (error === 'access_denied') return { kind: 'cancelled' };
  if (error || errorCode) {
    return {
      kind: 'error',
      message: get('error_description')?.replace(/\+/g, ' ') || 'Google sign-in did not complete.',
    };
  }

  const accessToken = get('access_token');
  const refreshToken = get('refresh_token');
  if (accessToken && refreshToken) return { kind: 'tokens', accessToken, refreshToken };
  const code = get('code');
  if (code) return { kind: 'code', code };
  return { kind: 'empty' };
}
