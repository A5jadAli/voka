type Storage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};
type Manifest = { generation: string; count: number };

/** Small Unicode-safe chunks, with an atomic manifest and no plaintext fallback. */
export function createSecureAuthStorage(secure: Storage, legacy: Storage) {
  let queue: Promise<unknown> = Promise.resolve();
  let sequence = 0;
  const serialized = <T>(task: () => Promise<T>): Promise<T> => {
    const result = queue.then(task);
    queue = result.catch(() => undefined);
    return result;
  };
  const manifestKey = (key: string) => `${key}.secure-v1`;
  const partKey = (key: string, manifest: Manifest, index: number) =>
    `${key}.${manifest.generation}.${index}`;
  const readManifest = async (key: string): Promise<Manifest | null> => {
    const value = await secure.getItem(manifestKey(key));
    if (value === null) return null;
    const parsed = JSON.parse(value) as Manifest;
    if (
      !/^[\w-]+$/.test(parsed.generation) ||
      !Number.isInteger(parsed.count) ||
      parsed.count < 0 ||
      parsed.count > 256
    ) {
      throw new Error('Secure session storage is invalid. Please sign in again.');
    }
    return parsed;
  };
  const removeParts = async (key: string, manifest: Manifest | null) => {
    if (!manifest) return;
    await Promise.all(
      Array.from({ length: manifest.count }, (_, i) =>
        secure.removeItem(partKey(key, manifest, i)),
      ),
    );
  };
  const write = async (key: string, value: string) => {
    const previous = await readManifest(key).catch(() => null);
    const characters = Array.from(value);
    const manifest = {
      generation: `${Date.now()}-${++sequence}`,
      count: Math.max(1, Math.ceil(characters.length / 400)),
    };
    if (manifest.generation === previous?.generation) manifest.generation += '-next';
    if (manifest.count > 256) throw new Error('The session is too large to store securely.');
    try {
      for (let i = 0; i < manifest.count; i++) {
        await secure.setItem(
          partKey(key, manifest, i),
          characters.slice(i * 400, (i + 1) * 400).join(''),
        );
      }
      await secure.setItem(manifestKey(key), JSON.stringify(manifest));
    } catch (error) {
      await removeParts(key, manifest).catch(() => undefined);
      throw error;
    }
    await legacy.removeItem(key);
    await removeParts(key, previous);
  };
  return {
    getItem: (key: string) =>
      serialized(async () => {
        const manifest = await readManifest(key);
        if (manifest) {
          if (manifest.count === 0) return null;
          const chunks = await Promise.all(
            Array.from({ length: manifest.count }, (_, i) =>
              secure.getItem(partKey(key, manifest, i)),
            ),
          );
          if (chunks.some((chunk) => chunk === null))
            throw new Error('Your secure session is incomplete. Please sign in again.');
          return chunks.join('');
        }
        const oldValue = await legacy.getItem(key);
        if (oldValue !== null) await write(key, oldValue);
        return oldValue;
      }),
    setItem: (key: string, value: string) => serialized(() => write(key, value)),
    removeItem: (key: string) =>
      serialized(async () => {
        const previous = await readManifest(key).catch(() => null);
        // A tombstone prevents stale plaintext credentials from ever resurrecting.
        await secure.setItem(manifestKey(key), JSON.stringify({ generation: 'deleted', count: 0 }));
        await legacy.removeItem(key);
        await removeParts(key, previous);
      }),
  };
}
