import { parseSubscription, type SubscriptionConfig } from './subscription-policy.ts';

export type SubscriptionAccess = {
  config: SubscriptionConfig;
  knownUser: boolean;
  isPlus: boolean;
  expiresAt: string | null;
  store: string | null;
  willRenew: boolean;
  billingIssue: boolean;
  fresh: boolean;
  syncAllowed: boolean;
  voiceRemaining: number;
  assessmentRemaining: number;
  resetsAt: string;
};
export type SubscriptionClient = {
  rpc: (
    name: 'voka_subscription_access',
    args: {
      p_action: string;
      p_user_id: string;
      p_snapshot?: unknown;
      p_force?: boolean;
    },
  ) => PromiseLike<{ data: unknown; error: unknown }>;
};

export async function subscriptionAccess(
  client: SubscriptionClient,
  userId: string,
  action = 'read',
  snapshot?: unknown,
  force = false,
): Promise<SubscriptionAccess> {
  const { data, error } = await client.rpc('voka_subscription_access', {
    p_action: action,
    p_user_id: userId,
    p_snapshot: snapshot ?? null,
    p_force: force,
  });
  if (error || !data || typeof data !== 'object' || !('config' in data))
    throw new Error('Subscription services are temporarily unavailable.');
  return data as SubscriptionAccess;
}

export async function syncSubscription(
  client: SubscriptionClient,
  userId: string,
  secret: string | undefined,
  force = false,
  fetcher: typeof fetch = fetch,
) {
  const access = await subscriptionAccess(client, userId, 'prepare', undefined, force);
  if (!access.config.enabled || !access.knownUser) return access;
  if (!secret) throw new Error('Subscription services are not configured.');
  if (!access.syncAllowed) {
    if (access.fresh && !force) return access;
    throw new Error('Subscription confirmation is in progress. Please retry shortly.');
  }
  const response = await fetcher(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`,
    {
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok)
    throw new Error('The store could not confirm your subscription. Please retry shortly.');
  const snapshot = parseSubscription(await response.json(), userId, access.config);
  return subscriptionAccess(client, userId, 'save', snapshot);
}
