interface CacheEntry {
  value: Promise<unknown>;
  expiresAt: number;
}

type ContentCache = {
  get: <T>(key: string, load: () => Promise<T>) => Promise<T>;
};

/**
 * Caches successful loads per key, including requests still in flight. Failures are not cached,
 * so unknown keys from user input do not grow the cache and the next request retries.
 * Callers get a copy, so changing a returned value does not change the cached one.
 */
const createContentCache = (ttlMs: number): ContentCache => {
  const entries = new Map<string, CacheEntry>();

  const get = <T>(key: string, load: () => Promise<T>): Promise<T> => {
    const cached = entries.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value.then((value) => structuredClone(value as T));
    }

    const value = load();
    entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    value.catch(() => {
      if (entries.get(key)?.value === value) entries.delete(key);
    });
    return value.then((loaded) => structuredClone(loaded));
  };

  return { get };
};

export { createContentCache };
export type { ContentCache };
