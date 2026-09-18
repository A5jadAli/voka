import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import { createClient } from 'npm:@supabase/supabase-js@2';

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }
    const userId = context.userClaims?.id ?? context.jwtClaims?.sub;
    if (typeof userId !== 'string' || !userId) {
      return Response.json({ error: 'Authentication is required.' }, { status: 401 });
    }
    const url = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRoleKey) {
      return Response.json({ error: 'Account deletion is not configured.' }, { status: 503 });
    }
    const admin = createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Account deletion failed', error.message);
      return Response.json(
        { error: 'Your account could not be deleted. Please try again.' },
        { status: 500 },
      );
    }
    return Response.json({ deleted: true });
  }),
};
