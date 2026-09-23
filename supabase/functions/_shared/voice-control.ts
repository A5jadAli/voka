export async function hangUpCall(apiKey: string, callId: string) {
  if (!/^rtc_[A-Za-z0-9_-]{1,200}$/.test(callId))
    throw new Error('Invalid provider call identifier.');
  const response = await fetch(
    `https://api.openai.com/v1/realtime/calls/${encodeURIComponent(callId)}/hangup`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    },
  );
  // Already closed / expired calls require no further work. Authentication failures do.
  if (!response.ok && response.status !== 404 && response.status !== 410)
    throw new Error(`Provider hangup failed (${response.status}).`);
}
export function providerCallId(location: string | null) {
  const value = location?.split('/').pop();
  return value && /^rtc_[A-Za-z0-9_-]{1,200}$/.test(value) ? value : null;
}
