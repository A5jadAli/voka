import { describe, expect, it, jest } from '@jest/globals';
import { claimAiBudget } from '../supabase/functions/_shared/ai-budget';

describe('server AI budget gate', () => {
  it('explains stale paid verification instead of claiming the paid allowance was exhausted', async () => {
    const rpc = async () => ({
      data: { allowed: false, reason: 'verification', retryAfter: 30 },
      error: null,
    });
    expect(await claimAiBudget({ rpc }, 'user-a', 'voice')).toMatchObject({
      allowed: false,
      status: 503,
      error: expect.stringContaining('refresh status'),
    });
  });
  it('fails closed if the migration/database is unavailable', async () => {
    const rpc = jest.fn(async () => ({ data: null, error: new Error('Missing function') }));
    expect(await claimAiBudget({ rpc }, 'user-a', 'voice')).toMatchObject({
      allowed: false,
      status: 503,
    });
  });
  it('uses server-owned accounting for the authenticated user', async () => {
    const rpc = jest.fn(async () => ({ data: { allowed: true }, error: null }));
    expect(await claimAiBudget({ rpc }, 'user-a', 'voice')).toEqual({ allowed: true });
    expect(rpc).toHaveBeenCalledWith('claim_voka_ai_request', {
      p_user_id: 'user-a',
      p_kind: 'voice',
    });
  });
  it('returns a useful retry message when the limit is reached', async () => {
    const rpc = async () => ({
      data: { allowed: false, reason: 'cooldown', retryAfter: 5 },
      error: null,
    });
    expect(await claimAiBudget({ rpc }, 'user-a', 'assessment')).toMatchObject({
      allowed: false,
      status: 429,
      retryAfter: 5,
    });
  });
  it('rejects malformed gate responses and thrown connection errors', async () => {
    expect(
      await claimAiBudget({ rpc: async () => ({ data: {}, error: null }) }, 'a', 'voice'),
    ).toMatchObject({ allowed: false, status: 503 });
    expect(
      await claimAiBudget(
        {
          rpc: async () => {
            throw new Error('Offline');
          },
        },
        'a',
        'voice',
      ),
    ).toMatchObject({ allowed: false, status: 503 });
  });
});
