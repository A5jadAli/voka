import { describe, expect, it } from '@jest/globals';
import { createHmac, webcrypto } from 'node:crypto';
import {
  constantTimeEqual,
  parseSubscription,
  verifyWebhookSignature,
  webhookUsers,
  type SubscriptionConfig,
} from '../supabase/functions/_shared/subscription-policy';

const user = '00000000-0000-4000-8000-000000000001';
const other = '00000000-0000-4000-8000-000000000002';
const now = Date.parse('2026-09-24T12:00:00Z');
const expires = '2026-10-24T12:00:00Z';
const config: SubscriptionConfig = {
  enabled: true,
  salesEnabled: true,
  environment: 'PRODUCTION',
  androidProduct: 'voka_plus:monthly',
  iosProduct: 'voka_plus_monthly',
  voiceDaily: 15,
  assessmentDaily: 25,
};
function customer(changes: Record<string, unknown> = {}) {
  return {
    request_date_ms: now,
    subscriber: {
      original_app_user_id: user,
      entitlements: { voka_plus: { product_identifier: 'voka_plus', expires_date: expires } },
      subscriptions: {
        'voka_plus:monthly': {
          store: 'play_store',
          is_sandbox: false,
          expires_date: expires,
          ...changes,
        },
      },
    },
  };
}
describe('server subscription verification', () => {
  it('accepts only the configured paid product and authenticated identity', () => {
    expect(parseSubscription(customer(), user, config, now)).toMatchObject({
      active: true,
      willRenew: true,
      productId: 'voka_plus:monthly',
    });
    expect(parseSubscription(customer(), other, config, now).active).toBe(false);
    expect(
      parseSubscription(customer(), user, { ...config, androidProduct: 'another:monthly' }, now)
        .active,
    ).toBe(false);
  });
  it('does not treat missing, promotional, sandbox or refunded entitlements as paid production access', () => {
    for (const change of [
      { store: 'promotional' },
      { store: 'test_store' },
      { is_sandbox: true },
      { refunded_at: '2026-09-24T10:00:00Z' },
      { expires_date: null },
      { expires_date: 'bad' },
    ])
      expect(parseSubscription(customer(change), user, config, now).active).toBe(false);
    const missing = customer();
    missing.subscriber.entitlements = {} as typeof missing.subscriber.entitlements;
    expect(parseSubscription(missing, user, config, now).active).toBe(false);
    expect(
      parseSubscription(
        customer({ is_sandbox: true }),
        user,
        { ...config, environment: 'SANDBOX' },
        now,
      ).active,
    ).toBe(true);
    expect(
      parseSubscription(customer(), user, { ...config, environment: 'SANDBOX' }, now).active,
    ).toBe(false);
  });
  it('supports explicit base-plan metadata but rejects ambiguous base-plan products', () => {
    const input = customer({ product_plan_identifier: 'monthly' });
    const sub = input.subscriber.subscriptions['voka_plus:monthly'];
    input.subscriber.subscriptions = {
      voka_plus: sub,
    } as unknown as typeof input.subscriber.subscriptions;
    expect(parseSubscription(input, user, config, now).active).toBe(true);
    delete (sub as Record<string, unknown>).product_plan_identifier;
    expect(parseSubscription(input, user, config, now).active).toBe(false);
  });
  it('retains cancelled access until expiry and handles explicit payment grace', () => {
    expect(
      parseSubscription(customer({ unsubscribe_detected_at: '2026-09-23' }), user, config, now),
    ).toMatchObject({ active: true, willRenew: false });
    expect(
      parseSubscription(
        { ...customer(), request_date_ms: Date.parse(expires) },
        user,
        config,
        Date.parse(expires),
      ).active,
    ).toBe(false);
  });
  it('rejects expiry and untrusted response timestamps', () => {
    const input = customer({ expires_date: '2026-09-23T12:00:00Z' });
    expect(parseSubscription(input, user, config, now).active).toBe(false);
    expect(() => parseSubscription({}, user, config, now)).toThrow();
    expect(() =>
      parseSubscription({ ...customer(), request_date_ms: now - 301_000 }, user, config, now),
    ).toThrow();
    expect(() =>
      parseSubscription({ ...customer(), request_date_ms: now + 301_000 }, user, config, now),
    ).toThrow();
  });
  it('retains expiry for the UI and does not let an old store purchase hide another active purchase', () => {
    const input = customer({ expires_date: '2026-09-23T12:00:00Z' });
    expect(parseSubscription(input, user, config, now)).toMatchObject({
      active: false,
      expiresAt: '2026-09-23T12:00:00.000Z',
      store: 'play_store',
    });
    const subscriptions = input.subscriber.subscriptions as Record<string, unknown>;
    subscriptions.voka_plus = { store: 'app_store', is_sandbox: false, expires_date: expires };
    expect(
      parseSubscription(input, user, { ...config, iosProduct: 'voka_plus' }, now),
    ).toMatchObject({ active: true, store: 'app_store' });
  });
  it('uses the earlier entitlement expiry and supports provider-confirmed grace only', () => {
    const input = customer({
      expires_date: '2026-09-23T12:00:00Z',
      grace_period_expires_date: expires,
      billing_issues_detected_at: '2026-09-23',
    });
    expect(parseSubscription(input, user, config, now)).toMatchObject({
      active: true,
      billingIssue: true,
      willRenew: false,
    });
    input.subscriber.entitlements.voka_plus.expires_date = '2026-09-23T12:00:00Z';
    expect(parseSubscription(input, user, config, now).active).toBe(false);
  });
});

describe('subscription webhook authentication and identity routing', () => {
  it('selects bounded UUID identities on both sides of a transfer and ignores anonymous aliases', () => {
    expect(
      webhookUsers({
        event: {
          id: 'test',
          type: 'TRANSFER',
          transferred_from: [user],
          transferred_to: [other],
          aliases: [user, '$RCAnonymousID:abc', 'attacker'],
        },
      }),
    ).toEqual([user, other]);
    expect(() => webhookUsers({})).toThrow();
    expect(webhookUsers({ event: { id: 'test', type: 'TEST' } })).toEqual([]);
  });
  it('checks authorization without accepting prefixes', () => {
    expect(constantTimeEqual('secret', 'secret')).toBe(true);
    expect(constantTimeEqual('secret', 'secret-extra')).toBe(false);
    expect(constantTimeEqual('', 'secret')).toBe(false);
  });
  it('verifies original body bytes, rejects tampering and stale delivery signatures', async () => {
    Object.defineProperty(globalThis, 'crypto', { value: webcrypto, configurable: true });
    const raw = '{ "event": {"id":"test"} }';
    const stamp = String(now / 1000);
    const hex = createHmac('sha256', 'synthetic-signing-secret')
      .update(`${stamp}.${raw}`)
      .digest('hex');
    const signature = `t=${stamp},v1=${hex}`;
    expect(await verifyWebhookSignature(raw, signature, 'synthetic-signing-secret', now)).toBe(
      true,
    );
    expect(
      await verifyWebhookSignature(
        JSON.stringify(JSON.parse(raw)),
        signature,
        'synthetic-signing-secret',
        now,
      ),
    ).toBe(false);
    expect(await verifyWebhookSignature(raw, signature, 'wrong-key', now)).toBe(false);
    expect(
      await verifyWebhookSignature(raw, signature, 'synthetic-signing-secret', now + 301_000),
    ).toBe(false);
    expect(await verifyWebhookSignature(raw, null, 'synthetic-signing-secret', now)).toBe(false);
  });
});
