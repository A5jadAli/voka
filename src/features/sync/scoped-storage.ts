import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const GUEST_SCOPE = 'guest';
const LEGACY_KEYS = ['voka-progress', 'voka-coaching', 'voka-assessment'];

/** Capture the scope before each async operation, never after awaiting I/O. */
export function createScopedStorage(backing: StateStorage) {
  let scope: string | null = null;
  let paused = true;
  let writes: Promise<unknown> = Promise.resolve();
  const pending = new Map<string, () => unknown>();
  const keyFor = (owner: string, key: string) =>
    `@voka/learning/${encodeURIComponent(owner)}/${key}`;
  const enqueue = (target: string, operation: () => unknown) => {
    pending.set(target, operation);
    writes = writes.then(async () => {
      try {
        await operation();
        if (pending.get(target) === operation) pending.delete(target);
      } catch {
        /* Retain the latest write for a later flush/retry. */
      }
    });
    return writes.then(() => undefined);
  };
  const storage: StateStorage = {
    getItem: (key) => (scope ? backing.getItem(keyFor(scope, key)) : null),
    setItem: (key, value) => {
      if (!scope || paused) return;
      const target = keyFor(scope, key);
      return enqueue(target, () => backing.setItem(target, value));
    },
    removeItem: (key) => {
      if (!scope || paused) return;
      const target = keyFor(scope, key);
      return enqueue(target, () => backing.removeItem(target));
    },
  };
  return {
    storage,
    selectScope(owner: string) {
      scope = owner;
    },
    pauseWrites(value: boolean) {
      paused = value;
    },
    async flush() {
      await writes;
      for (const [target, operation] of pending) {
        await operation();
        if (pending.get(target) === operation) pending.delete(target);
      }
    },
    async migrateLegacy(currentScope: string) {
      const marker = '@voka/learning-scopes-migrated';
      if (await backing.getItem(marker)) return;
      const oldOwner = await backing.getItem('@voka/cloud-state-owner');
      // Unowned legacy data cannot safely be attributed to a signed-in account.
      const legacyScope =
        oldOwner || (currentScope === GUEST_SCOPE ? GUEST_SCOPE : 'legacy-unassigned');
      for (const key of LEGACY_KEYS) {
        const legacy = await backing.getItem(key);
        const destination = keyFor(legacyScope, key);
        if (legacy && !(await backing.getItem(destination)))
          await backing.setItem(destination, legacy);
      }
      await backing.setItem(marker, '1');
      // Retain legacy copies for recovery. New stores never read them.
    },
    async hasLearningData(owner: string) {
      const values = await Promise.all(
        LEGACY_KEYS.map((key) => backing.getItem(keyFor(owner, key))),
      );
      return values.some(Boolean);
    },
    async clearScope(owner: string) {
      await writes;
      if (scope === owner) paused = true;
      for (const key of [...LEGACY_KEYS, 'sync-pending']) {
        pending.delete(keyFor(owner, key));
        await backing.removeItem(keyFor(owner, key));
      }
      if ((await backing.getItem('@voka/cloud-state-owner')) === owner) {
        for (const key of LEGACY_KEYS) await backing.removeItem(key);
        await backing.removeItem('@voka/cloud-state-owner');
      }
    },
  };
}
export const scopedLearningStorage = createScopedStorage(AsyncStorage);
