import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { hangUpCall, providerCallId } from '../supabase/functions/_shared/voice-control';
const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
describe('server voice termination', () => {
  it('extracts only bounded provider call identifiers', () => {
    expect(providerCallId('/v1/realtime/calls/rtc_example')).toBe('rtc_example');
    expect(providerCallId('request-id')).toBeNull();
    expect(providerCallId('/rtc_bad?query=1')).toBeNull();
    expect(providerCallId(null)).toBeNull();
  });
  it('does not send credentials to a caller-controlled URL', async () => {
    const fetchMock = jest.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
    await expect(hangUpCall('synthetic-key', 'https://example.test/steal')).rejects.toThrow(
      'Invalid',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('accepts closed calls but retains failed termination for retry', async () => {
    const fetchMock = jest.fn<typeof fetch>();
    globalThis.fetch = fetchMock;
    for (const status of [200, 404, 410]) {
      fetchMock.mockResolvedValueOnce(new Response('', { status }));
      await expect(hangUpCall('synthetic-key', 'rtc_example')).resolves.toBeUndefined();
    }
    for (const status of [401, 429, 500]) {
      fetchMock.mockResolvedValueOnce(new Response('', { status }));
      await expect(hangUpCall('synthetic-key', 'rtc_example')).rejects.toThrow(String(status));
    }
  });
});
