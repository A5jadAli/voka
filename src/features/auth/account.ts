import { getSupabaseAnonKey, getSupabaseFunctionUrl, supabase } from './supabase';
import { scopedLearningStorage } from '@/features/sync/scoped-storage';

export async function deleteCurrentAccount() {
  if (!supabase) throw new Error('Account services are not configured.');
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) throw new Error('Sign in again before deleting your account.');
  const baseUrl = getSupabaseFunctionUrl();
  if (!baseUrl) throw new Error('Account services are not configured.');
  const response = await fetch(baseUrl.replace(/\/realtime-session$/, '/delete-account'), {
    headers: {
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
      ...(getSupabaseAnonKey() ? { apikey: getSupabaseAnonKey()! } : {}),
    },
    method: 'POST',
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? 'Your account could not be deleted.');
  try {
    await scopedLearningStorage.clearScope(data.session.user.id);
  } finally {
    // The server account is already gone. A disk error must not leave it signed in.
    await supabase.auth.signOut({ scope: 'local' });
  }
}
