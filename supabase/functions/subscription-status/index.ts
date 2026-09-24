import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import { readBoundedJson } from '../_shared/ai-budget.ts';
import type { Database } from '../_shared/database.types.ts';
import { syncSubscription } from '../_shared/subscription-service.ts';

export default {
  fetch: withSupabase<Database>({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST')
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    const userId = context.userClaims?.id ?? context.jwtClaims?.sub;
    if (typeof userId !== 'string')
      return Response.json({ error: 'Sign in to view Voka Plus.' }, { status: 401 });
    let force: boolean;
    try {
      const body = (await readBoundedJson(request, 1024)) as { action?: unknown } | null;
      if (!body || !['status', 'sync'].includes(String(body.action)))
        throw new Error('Invalid action');
      force = body.action === 'sync';
    } catch {
      return Response.json({ error: 'Invalid request.' }, { status: 400 });
    }
    try {
      const access = await syncSubscription(
        context.supabaseAdmin,
        userId,
        Deno.env.get('REVENUECAT_SECRET_API_KEY'),
        force,
      );
      if (!access.knownUser)
        return Response.json({ error: 'Create an account to use Voka Plus.' }, { status: 403 });
      // Sales also require a configured, authenticated lifecycle-notification endpoint.
      access.config.salesEnabled &&= Boolean(
        (Deno.env.get('REVENUECAT_WEBHOOK_AUTH')?.length ?? 0) >= 32 &&
        Deno.env.get('REVENUECAT_WEBHOOK_SIGNING_SECRET'),
      );
      const { syncAllowed: _sync, knownUser: _known, ...publicAccess } = access;
      return Response.json(publicAccess, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
      return Response.json(
        {
          error:
            'Your subscription could not be confirmed. Please retry in a few seconds. You will not be charged again by refreshing.',
        },
        { status: 503, headers: { 'Retry-After': '10', 'Cache-Control': 'no-store' } },
      );
    }
  }),
};
