import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { readAuthRedirect } from './oauth-redirect';
import { getSupabaseAnonKey, getSupabaseUrl, supabase } from './supabase';

const CALLBACK_PATH = 'oauth-callback';

export function oauthRedirectUrl() {
  return Platform.OS === 'web'
    ? `${window.location.origin}/${CALLBACK_PATH}`
    : `voka://${CALLBACK_PATH}`;
}

let enabledCheck: Promise<boolean> | undefined;

/** Whether the Google provider is switched on for this Supabase project. */
export function isGoogleSignInEnabled() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) return Promise.resolve(false);
  enabledCheck ??= fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
    .then((response) => (response.ok ? response.json() : undefined))
    .then((settings: { external?: { google?: boolean } } | undefined) =>
      Boolean(settings?.external?.google),
    )
    .catch(() => {
      // Do not cache a network failure: the next screen visit retries.
      enabledCheck = undefined;
      return false;
    });
  return enabledCheck;
}

export type GoogleStart =
  { type: 'returned'; url: string } | { type: 'redirecting' } | { type: 'cancelled' };

/**
 * Opens Google's account chooser. Guests are linked to Google so their progress is kept;
 * `link: false` signs in to an existing account instead.
 */
export async function startGoogleSignIn({ link }: { link?: boolean } = {}): Promise<GoogleStart> {
  if (!supabase) throw new Error('Sign-in is temporarily unavailable.');
  const redirectTo = oauthRedirectUrl();
  const options = {
    redirectTo,
    skipBrowserRedirect: Platform.OS !== 'web',
    queryParams: { prompt: 'select_account' },
  };
  const current = await supabase.auth.getSession();
  const shouldLink = link ?? Boolean(current.data.session?.user.is_anonymous);

  let result = shouldLink
    ? await supabase.auth.linkIdentity({ provider: 'google', options })
    : await supabase.auth.signInWithOAuth({ provider: 'google', options });
  // If linking is unavailable, a normal sign-in still works.
  if (result.error && shouldLink) {
    result = await supabase.auth.signInWithOAuth({ provider: 'google', options });
  }
  if (result.error) throw result.error;
  if (Platform.OS === 'web') return { type: 'redirecting' };
  if (!result.data.url) throw new Error('Google sign-in could not start.');

  const session = await WebBrowser.openAuthSessionAsync(result.data.url, redirectTo);
  return session.type === 'success'
    ? { type: 'returned', url: session.url }
    : { type: 'cancelled' };
}

export type GoogleOutcome =
  | { status: 'signed-in' }
  | { status: 'existing-account' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

const completions = new Map<string, Promise<GoogleOutcome>>();

/** Whether this redirect URL has already been picked up (by the callback screen). */
export function isOAuthRedirectHandled(url: string) {
  return completions.has(url);
}

/** Finishes sign-in from the redirect URL. Safe to call more than once for the same URL. */
export function completeGoogleSignIn(url: string): Promise<GoogleOutcome> {
  let completion = completions.get(url);
  if (!completion) {
    completion = finish(url).catch((error: unknown): GoogleOutcome => ({
      status: 'error',
      message: error instanceof Error ? error.message : 'Google sign-in did not complete.',
    }));
    completions.set(url, completion);
  }
  return completion;
}

async function finish(url: string): Promise<GoogleOutcome> {
  if (!supabase) return { status: 'error', message: 'Sign-in is temporarily unavailable.' };
  const redirect = readAuthRedirect(url);
  if (redirect.kind === 'existing-account') return { status: 'existing-account' };
  if (redirect.kind === 'cancelled') return { status: 'cancelled' };
  if (redirect.kind === 'error') return { status: 'error', message: redirect.message };

  if (redirect.kind === 'tokens') {
    const { error } = await supabase.auth.setSession({
      access_token: redirect.accessToken,
      refresh_token: redirect.refreshToken,
    });
    if (error) throw error;
  } else if (redirect.kind === 'code') {
    const { error } = await supabase.auth.exchangeCodeForSession(redirect.code);
    if (error) throw error;
  } else {
    // Linking can return without tokens: the existing session just gains the identity.
    await supabase.auth.refreshSession();
  }

  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user || data.user.is_anonymous) {
    return { status: 'error', message: 'Google sign-in did not complete. Please try again.' };
  }
  // A guest linked to Google has no name yet; take it from the Google identity.
  const metadata = data.user.user_metadata ?? {};
  if (!metadata.display_name && !metadata.full_name) {
    const identity = data.user.identities?.find((item) => item.provider === 'google');
    const name = identity?.identity_data?.full_name ?? identity?.identity_data?.name;
    if (typeof name === 'string' && name.trim()) {
      await supabase.auth.updateUser({ data: { display_name: name.trim() } });
    }
  }
  return { status: 'signed-in' };
}
