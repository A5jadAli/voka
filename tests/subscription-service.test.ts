import { describe, expect, it, jest } from '@jest/globals';
import {
  syncSubscription,
  type SubscriptionAccess,
} from '../supabase/functions/_shared/subscription-service';

const user = '00000000-0000-4000-8000-000000000001';
const access: SubscriptionAccess = {
  config: {
    enabled: true,
    salesEnabled: true,
    environment: 'PRODUCTION',
    androidProduct: 'voka_plus:monthly',
    iosProduct: '',
    voiceDaily: 15,
    assessmentDaily: 25,
  },
  knownUser: true,
  isPlus: false,
  expiresAt: null,
  store: null,
  willRenew: false,
  billingIssue: false,
  fresh: false,
  syncAllowed: true,
  voiceRemaining: 15,
  assessmentRemaining: 25,
  resetsAt: '',
};
describe('canonical subscription synchronization', () => {
  it('does not contact a payment provider when billing is disabled or the user is a guest', async () => {
    for (const data of [
      { ...access, config: { ...access.config, enabled: false } },
      { ...access, knownUser: false },
    ]) {
      const fetcher = jest.fn<typeof fetch>();
      const rpc = jest.fn(async () => ({ data, error: null }));
      await syncSubscription({ rpc }, user, undefined, false, fetcher);
      expect(fetcher).not.toHaveBeenCalled();
    }
  });
  it('uses only the authenticated ID and saves a verified canonical snapshot', async () => {
    const rpc = jest.fn(async () => ({ data: access, error: null }));
    const fetcher = jest.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          request_date_ms: Date.now(),
          subscriber: {
            original_app_user_id: user,
            entitlements: {},
            subscriptions: {},
          },
        }),
      ),
    );
    await syncSubscription({ rpc }, user, 'synthetic-secret', false, fetcher);
    expect(fetcher).toHaveBeenCalledWith(
      `https://api.revenuecat.com/v1/subscribers/${user}`,
      expect.objectContaining({
        headers: { Authorization: 'Bearer synthetic-secret', Accept: 'application/json' },
      }),
    );
    expect(rpc).toHaveBeenLastCalledWith(
      'voka_subscription_access',
      expect.objectContaining({
        p_action: 'save',
        p_user_id: user,
        p_snapshot: expect.objectContaining({ active: false }),
      }),
    );
  });
  it('does not overwrite entitlements on provider failure or malformed data', async () => {
    for (const response of [new Response('', { status: 429 }), new Response('{}')]) {
      const rpc = jest.fn(async () => ({ data: access, error: null }));
      const fetcher = jest.fn<typeof fetch>().mockResolvedValue(response);
      await expect(syncSubscription({ rpc }, user, 'synthetic', false, fetcher)).rejects.toThrow();
      expect(rpc).toHaveBeenCalledTimes(1);
    }
  });
  it('uses fresh cache normally but asks a webhook to retry instead of acknowledging skipped work', async () => {
    const data = { ...access, fresh: true, syncAllowed: false };
    const rpc = jest.fn(async () => ({ data, error: null }));
    const fetcher = jest.fn<typeof fetch>();
    expect(await syncSubscription({ rpc }, user, 'synthetic', false, fetcher)).toEqual(data);
    await expect(syncSubscription({ rpc }, user, 'synthetic', true, fetcher)).rejects.toThrow(
      'in progress',
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('rejects missing migrations and missing server credentials', async () => {
    await expect(
      syncSubscription({ rpc: async () => ({ data: null, error: 'missing' }) }, user, 'synthetic'),
    ).rejects.toThrow('unavailable');
    await expect(
      syncSubscription({ rpc: async () => ({ data: access, error: null }) }, user, undefined),
    ).rejects.toThrow('not configured');
  });
});
