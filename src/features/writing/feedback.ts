import {
  getOrCreateSession,
  getSupabaseAnonKey,
  getSupabaseFunctionUrl,
} from '@/features/auth/supabase';
import { parseWritingFeedback, type WritingFeedback, type WritingTaskId } from './progress';

const writingFeedbackUrl = getSupabaseFunctionUrl('writing-feedback');
export const isWritingFeedbackConfigured = Boolean(writingFeedbackUrl);

export async function requestWritingFeedback(
  taskId: WritingTaskId,
  text: string,
  signal?: AbortSignal,
): Promise<WritingFeedback> {
  if (!writingFeedbackUrl) throw new Error('Writing feedback is not available in this build.');
  const session = await getOrCreateSession();
  const anonKey = getSupabaseAnonKey();
  const response = await fetch(writingFeedbackUrl, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      ...(anonKey ? { apikey: anonKey } : {}),
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ taskId, text: text.slice(0, 8000) }),
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string; feedback?: unknown };
  if (!response.ok)
    throw new Error(body.error ?? 'Feedback is unavailable right now. Please try again later.');
  const feedback = parseWritingFeedback({ ...(body.feedback as object), forText: text });
  if (!feedback) throw new Error('The feedback service returned an invalid result.');
  return feedback;
}
