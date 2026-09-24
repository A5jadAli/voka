// Provider-independent parsing. Only server-fetched RevenueCat responses belong here.
export type SubscriptionConfig = {
  enabled: boolean;
  salesEnabled: boolean;
  environment: 'PRODUCTION' | 'SANDBOX';
  androidProduct: string;
  iosProduct: string;
  voiceDaily: number;
  assessmentDaily: number;
};

export type SubscriptionSnapshot = {
  active: boolean;
  expiresAt: string | null;
  productId: string | null;
  store: string | null;
  willRenew: boolean;
  billingIssue: boolean;
  environment: 'PRODUCTION' | 'SANDBOX';
  providerUpdatedAt: string;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function timestamp(value: unknown) {
  return typeof value === 'string' ? Date.parse(value) : NaN;
}

export function parseSubscription(
  input: unknown,
  userId: string,
  config: SubscriptionConfig,
  now = Date.now(),
): SubscriptionSnapshot {
  const body = record(input);
  const subscriber = record(body.subscriber);
  const providerTime = body.request_date_ms;
  if (
    typeof providerTime !== 'number' ||
    !Number.isFinite(providerTime) ||
    Math.abs(now - providerTime) > 300_000 ||
    typeof subscriber.original_app_user_id !== 'string' ||
    !subscriber.entitlements ||
    typeof subscriber.entitlements !== 'object' ||
    Array.isArray(subscriber.entitlements) ||
    !subscriber.subscriptions ||
    typeof subscriber.subscriptions !== 'object' ||
    Array.isArray(subscriber.subscriptions)
  )
    throw new Error('Invalid subscription response.');
  const result: SubscriptionSnapshot = {
    active: false,
    expiresAt: null,
    productId: null,
    store: null,
    willRenew: false,
    billingIssue: false,
    environment: config.environment,
    providerUpdatedAt: new Date(providerTime).toISOString(),
  };
  // Custom, authenticated UUIDs only. Do not grant shared aliases another user's allowance.
  if (subscriber.original_app_user_id !== userId) return result;
  let inactive = result;
  const entitlement = record(record(subscriber.entitlements).voka_plus);
  for (const [key, value] of Object.entries(record(subscriber.subscriptions))) {
    const subscription = record(value);
    const store = subscription.store;
    const expected =
      store === 'play_store'
        ? config.androidProduct
        : store === 'app_store'
          ? config.iosProduct
          : '';
    if (!expected) continue;
    const [base, plan] = expected.split(':');
    const productMatches =
      key === expected ||
      (key === base && (!plan || subscription.product_plan_identifier === plan));
    if (!productMatches || ![base, expected].includes(String(entitlement.product_identifier)))
      continue;
    if (subscription.is_sandbox !== (config.environment === 'SANDBOX')) continue;
    // Grace access is allowed only when the provider explicitly supplies its expiry.
    const subscriptionExpiry = Math.max(
      timestamp(subscription.expires_date),
      timestamp(subscription.grace_period_expires_date) || 0,
    );
    const entitlementExpiry = Math.max(
      timestamp(entitlement.expires_date),
      timestamp(entitlement.grace_period_expires_date) || 0,
    );
    const expires = Math.min(subscriptionExpiry, entitlementExpiry);
    if (!Number.isFinite(expires)) continue;
    const candidate: SubscriptionSnapshot = {
      ...result,
      active: subscription.refunded_at == null && expires > now,
      expiresAt: new Date(expires).toISOString(),
      productId: expected,
      store: String(store),
      willRenew:
        subscription.refunded_at == null &&
        expires > now &&
        subscription.unsubscribe_detected_at == null &&
        subscription.billing_issues_detected_at == null,
      billingIssue: subscription.billing_issues_detected_at != null,
    };
    if (candidate.active) return candidate;
    if (!inactive.expiresAt || expires > Date.parse(inactive.expiresAt)) inactive = candidate;
  }
  return inactive;
}

export function webhookUsers(input: unknown): string[] {
  const event = record(record(input).event);
  if (typeof event.id !== 'string' || typeof event.type !== 'string')
    throw new Error('Invalid webhook event.');
  const candidates = [
    event.app_user_id,
    event.original_app_user_id,
    ...(Array.isArray(event.aliases) ? event.aliases : []),
    ...(Array.isArray(event.transferred_from) ? event.transferred_from : []),
    ...(Array.isArray(event.transferred_to) ? event.transferred_to : []),
  ];
  const users = [
    ...new Set(
      candidates.filter(
        (id): id is string =>
          typeof id === 'string' &&
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id),
      ),
    ),
  ];
  if (users.length > 20) throw new Error('Too many webhook identities.');
  return users;
}

export function constantTimeEqual(left: string, right: string) {
  const a = new TextEncoder().encode(left);
  const b = new TextEncoder().encode(right);
  let difference = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) difference |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return difference === 0;
}

export async function verifyWebhookSignature(
  raw: string,
  header: string | null,
  secret: string,
  now = Date.now(),
) {
  const match = /^t=(\d+),v1=([a-f0-9]{64})$/.exec(header ?? '');
  if (!match || Math.abs(now / 1000 - Number(match[1])) > 300) return false;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${match[1]}.${raw}`),
  );
  const hex = Array.from(new Uint8Array(signature), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  return constantTimeEqual(hex, match[2]);
}
