import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method !== 'POST') {
      return Response.json({ error: 'Method not allowed.' }, { status: 405 });
    }
    const userId = context.userClaims?.id ?? context.jwtClaims?.sub;
    if (typeof userId !== 'string' || !userId) {
      return Response.json({ error: 'Authentication is required.' }, { status: 401 });
    }
    const { error } = await context.supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      console.error('Account deletion failed', error.status);
      return Response.json(
        { error: 'Your account could not be deleted. Please try again.' },
        { status: 500 },
      );
    }
    return Response.json({ deleted: true });
  }),
};
