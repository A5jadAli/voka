import {
  getOrCreateSession,
  getSupabaseAnonKey,
  getSupabaseFunctionUrl,
} from '@/features/auth/supabase';

export const conversationApiUrl =
  process.env.EXPO_PUBLIC_VOKA_API_URL?.trim() || getSupabaseFunctionUrl();

export const isConversationBackendConfigured = Boolean(conversationApiUrl);

export async function createConversationRequest(sdp: string, track: 'DE' | 'EN') {
  if (!conversationApiUrl) {
    throw new Error('The secure voice service has not been connected yet.');
  }

  const session = await getOrCreateSession();
  const anonKey = getSupabaseAnonKey();
  const response = await fetch(conversationApiUrl, {
    body: JSON.stringify({ sdp, track }),
    headers: {
      'Content-Type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    method: 'POST',
  });

  const body = (await response.json()) as {
    error?: string;
    session?: { id?: string };
    transport?: { sdp?: string };
  };

  if (!response.ok) {
    throw new Error(body.error ?? `Voice service returned ${response.status}.`);
  }
  if (!body.transport?.sdp) throw new Error('Voice service returned an invalid connection.');

  return { answerSdp: body.transport.sdp, sessionId: body.session?.id };
}
