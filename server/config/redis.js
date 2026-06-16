/**
 * Optional Redis client for storefront HTTP caching (`utils/redisCache.js`).
 *
 * - Set `REDIS_URL` (e.g. `redis://127.0.0.1:6379`) to enable caching for GET /api/products,
 *   GET /api/products/:slug, GET /api/categories. Omit `REDIS_URL` and the API runs without Redis.
 * - Connects lazily on first cache use (server starts even if Redis is down).
 * - Admin product/category mutations call `invalidatePublicCatalogCache()`.
 *
 * Do not use top-level `await client.connect()` here — Express must boot without blocking on Redis.
 */
import { createClient } from "redis";

/** @type {import("redis").RedisClientType | null} */
let client = null;
/** After a failed connect, skip Redis until server restart (avoids ECONNREFUSED spam). */
let redisUnavailable = false;
let loggedUnavailable = false;
let loggedConnected = false;

export function isRedisConfigured() {
  return Boolean(process.env.REDIS_URL?.trim());
}

/**
 * Shared Redis client (lazy connect). Returns null if REDIS_URL is unset, connect failed once,
 * or Redis was unavailable at startup.
 * @returns {Promise<import("redis").RedisClientType | null>}
 */
export async function getRedisClient() {
  if (!isRedisConfigured()) return null;
  if (redisUnavailable) return null;
  if (client?.isOpen) return client;

  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL.trim(),
      socket: {
        /** Do not retry forever when nothing is listening (prevents log spam). */
        reconnectStrategy() {
          return false;
        },
      },
    });
    client.on("error", (err) => {
      if (!loggedUnavailable) {
        console.warn("[redis] Error:", err.message);
        loggedUnavailable = true;
      }
    });
  }

  try {
    if (!client.isOpen) {
      await client.connect();
      if (!loggedConnected) {
        loggedConnected = true;
        console.log("[redis] Connected — public catalog responses may be cached");
      }
    }
    return client;
  } catch (err) {
    redisUnavailable = true;
    try {
      if (client.isOpen) await client.quit();
      else await client.disconnect();
    } catch {
      /* ignore */
    }
    client = null;
    if (!loggedUnavailable) {
      console.warn("[redis] unavailable — API runs without cache:", err.message);
      console.warn("[redis] Start Redis on that host/port, or remove REDIS_URL from .env");
      loggedUnavailable = true;
    }
    return null;
  }
}

export async function closeRedis() {
  redisUnavailable = false;
  loggedUnavailable = false;
  loggedConnected = false;
  if (client?.isOpen) {
    try {
      await client.quit();
    } catch {
      /* ignore */
    }
  }
  client = null;
}
