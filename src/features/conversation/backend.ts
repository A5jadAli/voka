import {
  getOrCreateSession,
  getSupabaseAnonKey,
  getSupabaseFunctionUrl,
} from '@/features/auth/supabase';
import { parseSpokenAssessment } from '@/features/assessment/types';
import type { TranscriptTurn } from './events';

export const conversationApiUrl =
  process.env.EXPO_PUBLIC_VOKA_API_URL?.trim() || getSupabaseFunctionUrl();

export const isConversationBackendConfigured = Boolean(conversationApiUrl);

export async function createConversationRequest(
  sdp: string,
  track: 'DE' | 'EN',
  options: { coachTone: 'supportive' | 'tough'; goal: string; practice: string; unitId?: string },
) {
  if (!conversationApiUrl) {
    throw new Error('The secure voice service has not been connected yet.');
  }

  const session = await getOrCreateSession();
  const anonKey = getSupabaseAnonKey();
  const response = await fetch(conversationApiUrl, {
    body: JSON.stringify({ sdp, track, ...options }),
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

export async function createAssessmentRequest(
  track: 'DE' | 'EN',
  turns: TranscriptTurn[],
  coachTone: 'supportive' | 'tough',
) {
  if (!conversationApiUrl) throw new Error('The assessment service has not been connected yet.');
  const session = await getOrCreateSession();
  const anonKey = getSupabaseAnonKey();
  const response = await fetch(conversationApiUrl, {
    body: JSON.stringify({
      action: 'assess',
      coachTone,
      track,
      turns: turns.map(({ role, text }) => ({ role, text })),
    }),
    headers: {
      'Content-Type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    method: 'POST',
  });
  const body = (await response.json()) as { assessment?: unknown; error?: string };
  if (!response.ok)
    throw new Error(body.error ?? `Assessment service returned ${response.status}.`);
  const assessment = parseSpokenAssessment(body.assessment);
  if (!assessment) throw new Error('The assessment service returned an invalid result.');
  return assessment;
}
