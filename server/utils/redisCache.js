import { getRedisClient, isRedisConfigured } from "../config/redis.js";

const PREFIX = "eatoreum:public:";

/** Stable cache key fragment from Express `req.query`. */
export function stableQueryKey(query) {
  const q = query && typeof query === "object" ? query : {};
  const entries = Object.entries(q)
    .filter(([, v]) => v != null && String(v).trim() !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  if (!entries.length) return "default";
  return entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

function defaultTtlSec() {
  const n = Number(process.env.REDIS_CACHE_TTL_SEC);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 3600) : 60;
}

/**
 * Read-through JSON cache. If Redis is down or unset, always runs `fetchFn()`.
 * @template T
 * @param {string} key full key including PREFIX or bare suffix
 * @param {number} [ttlSec]
 * @param {() => Promise<T>} fetchFn
 * @returns {Promise<T>}
 */
export async function cacheWrap(key, ttlSec, fetchFn) {
  const ttl = ttlSec ?? defaultTtlSec();
  const fullKey = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;

  if (!isRedisConfigured()) {
    return fetchFn();
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return fetchFn();

    const hit = await redis.get(fullKey);
    if (hit) {
      return JSON.parse(hit);
    }

    const payload = await fetchFn();
    await redis.set(fullKey, JSON.stringify(payload), { EX: ttl });
    return payload;
  } catch (err) {
    console.warn("[redis] cache read/write skipped:", err.message);
    return fetchFn();
  }
}

/**
 * Like `cacheWrap`, but does **not** store when `fetchFn` resolves to `null` / `undefined`
 * (avoids caching 404-shaped responses for product detail).
 * @template T
 * @param {string} key
 * @param {number} [ttlSec]
 * @param {() => Promise<T | null | undefined>} fetchFn
 */
export async function cacheWrapNullable(key, ttlSec, fetchFn) {
  const ttl = ttlSec ?? defaultTtlSec();
  const fullKey = key.startsWith(PREFIX) ? key : `${PREFIX}${key}`;

  if (!isRedisConfigured()) {
    return fetchFn();
  }

  try {
    const redis = await getRedisClient();
    if (!redis) return fetchFn();

    const hit = await redis.get(fullKey);
    if (hit) {
      return JSON.parse(hit);
    }

    const payload = await fetchFn();
    if (payload != null) {
      await redis.set(fullKey, JSON.stringify(payload), { EX: ttl });
    }
    return payload;
  } catch (err) {
    console.warn("[redis] cache read/write skipped:", err.message);
    return fetchFn();
  }
}

/** Invalidate all storefront public cache entries (products list, product detail, categories). */
export async function invalidatePublicCatalogCache() {
  if (!isRedisConfigured()) return;
  try {
    const redis = await getRedisClient();
    if (!redis) return;
    const batch = [];
    for await (const key of redis.scanIterator({ MATCH: `${PREFIX}*`, COUNT: 128 })) {
      batch.push(key);
      if (batch.length >= 128) {
        await redis.del(batch);
        batch.length = 0;
      }
    }
    if (batch.length) await redis.del(batch);
  } catch (err) {
    console.warn("[redis] cache invalidate failed:", err.message);
  }
}
