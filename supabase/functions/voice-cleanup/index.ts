import { createClient } from '@supabase/supabase-js';
import type { Database } from '../_shared/database.types.ts';
import { hangUpCall } from '../_shared/voice-control.ts';

Deno.serve(async (request) => {
  const secret = Deno.env.get('VOICE_CLEANUP_SECRET');
  if (request.method !== 'POST' || !secret || request.headers.get('x-voka-worker') !== secret)
    return new Response('Unauthorized', { status: 401 });
  const key = Deno.env.get('OPENAI_API_KEY');
  if (!key) return new Response('Not configured', { status: 503 });
  let adminKey: string | undefined;
  try {
    adminKey =
      JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  } catch {
    return new Response('Invalid backend configuration', { status: 503 });
  }
  if (!adminKey) return new Response('Missing backend configuration', { status: 503 });
  const client = createClient<Database>(Deno.env.get('SUPABASE_URL')!, adminKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    const { data, error } = await client.rpc('voka_voice_control', { p_action: 'expired' });
    if (error || !Array.isArray(data))
      throw new Error(`lease-read:${error?.code ?? 'invalid-shape'}`);
    // The global lease cap is four, so this work is bounded independently of traffic.
    await Promise.all(
      data.map(async (lease: { id: string; callId: string | null }) => {
        if (lease.callId) await hangUpCall(key, lease.callId);
        const result = await client.rpc('voka_voice_control', {
          p_action: 'finish',
          p_lease_id: lease.id,
        });
        if (result.error) throw new Error(`lease-release:${result.error.code}`);
      }),
    );
    const heartbeat = await client.rpc('voka_voice_control', { p_action: 'heartbeat' });
    if (heartbeat.error) throw new Error(`heartbeat:${heartbeat.error.code}`);
    return Response.json({ closed: data.length });
  } catch (error) {
    // Keep failed leases for retry and do not renew the health gate.
    console.error('Voice cleanup failed; new sessions will fail closed if health becomes stale.');
    const code =
      error instanceof Error &&
      /^(lease-read|lease-release|heartbeat):[A-Za-z0-9-]+$/.test(error.message)
        ? error.message
        : 'upstream';
    return new Response(`Cleanup incomplete (${code})`, { status: 503 });
  }
});
