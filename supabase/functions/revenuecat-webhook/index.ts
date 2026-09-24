import '@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from '@supabase/supabase-js';
import { readBoundedText } from '../_shared/ai-budget.ts';
import type { Database } from '../_shared/database.types.ts';
import {
  constantTimeEqual,
  verifyWebhookSignature,
  webhookUsers,
} from '../_shared/subscription-policy.ts';
import { syncSubscription } from '../_shared/subscription-service.ts';

Deno.serve(async (request) => {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const auth = Deno.env.get('REVENUECAT_WEBHOOK_AUTH');
  const signingSecret = Deno.env.get('REVENUECAT_WEBHOOK_SIGNING_SECRET');
  const apiSecret = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  if (!auth || auth.length < 32 || !signingSecret || !apiSecret)
    return new Response('Not configured', { status: 503 });
  if (!constantTimeEqual(request.headers.get('Authorization') ?? '', auth))
    return new Response('Unauthorized', { status: 401 });
  let users: string[];
  try {
    const raw = await readBoundedText(request, 64_000);
    if (
      !(await verifyWebhookSignature(
        raw,
        request.headers.get('X-RevenueCat-Webhook-Signature'),
        signingSecret,
      ))
    )
      return new Response('Unauthorized', { status: 401 });
    users = webhookUsers(JSON.parse(raw));
  } catch {
    return new Response('Invalid event', { status: 400 });
  }
  try {
    const adminKey =
      JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default ??
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!adminKey) throw new Error('Missing backend configuration');
    const client = createClient<Database>(Deno.env.get('SUPABASE_URL')!, adminKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Never grant from the webhook payload. Re-fetch canonical state for both
    // sides of a transfer. Replays are harmless and cannot refill usage counters.
    await Promise.all(users.map((userId) => syncSubscription(client, userId, apiSecret, true)));
    return Response.json({ received: true });
  } catch {
    // Retryable status: RevenueCat will redeliver. Do not acknowledge failed work.
    return new Response('Subscription synchronization incomplete', { status: 503 });
  }
});
