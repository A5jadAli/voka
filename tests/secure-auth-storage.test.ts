import { describe, expect, it } from '@jest/globals';
import { createSecureAuthStorage } from '@/features/auth/secure-auth-storage';

function memory() {
  const values = new Map<string, string>();
  return {
    values,
    getItem: async (key: string) => values.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: async (key: string) => {
      values.delete(key);
    },
  };
}
describe('secure authentication storage', () => {
  it('round-trips empty values and permits logout recovery from a corrupt manifest', async () => {
    const legacy = memory();
    const secure = memory();
    const storage = createSecureAuthStorage(secure, legacy);
    await storage.setItem('session', '');
    expect(await storage.getItem('session')).toBe('');
    await secure.setItem('session.secure-v1', 'corrupted');
    await expect(storage.getItem('session')).rejects.toThrow();
    await storage.removeItem('session');
    expect(await storage.getItem('session')).toBeNull();
  });
  it('migrates long Unicode sessions without leaving plaintext behind', async () => {
    const legacy = memory();
    const secure = memory();
    const value = JSON.stringify({ token: 'a'.repeat(6000), name: 'ü🔐'.repeat(600) });
    await legacy.setItem('session', value);
    const storage = createSecureAuthStorage(secure, legacy);
    expect(await storage.getItem('session')).toBe(value);
    expect(await legacy.getItem('session')).toBeNull();
    expect(await storage.getItem('session')).toBe(value);
    for (const chunk of secure.values.values()) expect(Buffer.byteLength(chunk)).toBeLessThan(2048);
  });

  it('keeps the old session intact if a secure write fails', async () => {
    const legacy = memory();
    const secure = memory();
    let fail = false;
    const storage = createSecureAuthStorage(
      {
        ...secure,
        setItem: async (key, value) => {
          if (fail && !key.endsWith('secure-v1')) throw new Error('Storage unavailable');
          await secure.setItem(key, value);
        },
      },
      legacy,
    );
    await storage.setItem('session', 'old-token');
    fail = true;
    await expect(storage.setItem('session', 'replacement-token')).rejects.toThrow(
      'Storage unavailable',
    );
    expect(await storage.getItem('session')).toBe('old-token');
  });

  it('does not resurrect stale legacy tokens after logout', async () => {
    const legacy = memory();
    const secure = memory();
    const storage = createSecureAuthStorage(secure, legacy);
    await storage.setItem('session', 'token');
    await storage.removeItem('session');
    await legacy.setItem('session', 'stale-backup-token');
    expect(await storage.getItem('session')).toBeNull();
    await storage.setItem('session', 'new-token');
    expect(await storage.getItem('session')).toBe('new-token');
  });

  it('does not discard plaintext during a failed migration', async () => {
    const legacy = memory();
    const secure = memory();
    await legacy.setItem('session', 'recoverable-token');
    const storage = createSecureAuthStorage(
      {
        ...secure,
        setItem: async () => {
          throw new Error('Locked');
        },
      },
      legacy,
    );
    await expect(storage.getItem('session')).rejects.toThrow('Locked');
    expect(await legacy.getItem('session')).toBe('recoverable-token');
  });
});
