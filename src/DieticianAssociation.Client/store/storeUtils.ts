// src/stores/storeUtils.ts
export const handleError = (err: unknown): string => {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'An unexpected error occurred'
}

// --- Request deduplication ---
const inflightRequests = new Map<string, Promise<unknown>>()

/**
 * Deduplicates concurrent identical requests. If a request with the same key
 * is already in-flight, returns the existing promise instead of firing a new one.
 */
export async function deduplicatedFetch<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const existing = inflightRequests.get(key)
  if (existing) return existing as Promise<T>

  const promise = fetcher().finally(() => {
    inflightRequests.delete(key)
  })
  inflightRequests.set(key, promise)
  return promise
}

// --- Simple TTL cache for store data ---
interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()
const DEFAULT_TTL_MS = 60_000 // 1 minute

/**
 * Returns cached data if still valid, otherwise calls fetcher, caches the result, and returns it.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const entry = cache.get(key)
  if (entry && Date.now() - entry.timestamp < ttlMs) {
    return entry.data as T
  }

  const data = await deduplicatedFetch(key, fetcher)
  cache.set(key, { data, timestamp: Date.now() })
  return data
}

/** Invalidate a specific cache key or all keys matching a prefix. */
export function invalidateCache(keyOrPrefix?: string): void {
  if (!keyOrPrefix) {
    cache.clear()
    return
  }
  for (const k of cache.keys()) {
    if (k === keyOrPrefix || k.startsWith(keyOrPrefix + ':')) {
      cache.delete(k)
    }
  }
}