import prisma from '../prisma.js';
import type { Prisma } from '@prisma/client';

// Cache type constants
export const CacheType = {
  prices: 'prices' as const,
  news: 'news' as const,
  aiInsight: 'aiInsight' as const,
} as const;

// Type for cache types
export type CacheType = typeof CacheType[keyof typeof CacheType];

// Type for cached data (can be any JSON-serializable value)
type CachedData = Prisma.JsonValue;

// Re-export cache TTL constants from utils for backward compatibility
export { CACHE_TTL_MS, AI_INSIGHT_CACHE_TTL_MS } from '../utils/constants.js';

/**
 * Checks if two dates are on the same calendar day (ignoring time).
 * @param date1 First date to compare
 * @param date2 Second date to compare
 * @returns true if both dates are on the same day, false otherwise
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export class CacheService {
  /**
   * Retrieves cached data for a specific type if it exists and is within the TTL.
   * For AI insights, checks if the cache is from the same day instead of using TTL.
   * @param userId User ID to retrieve cache for
   * @param cacheType Type of cache to retrieve
   * @param ttlMs Time to live in milliseconds
   * @returns Cached data if valid, null if cache is stale or doesn't exist
   */
  static async getCachedDataByType(
    userId: string,
    cacheType: CacheType,
    ttlMs: number
  ): Promise<CachedData | null> {
    try {
      const cache = await prisma.dashboardCache.findUnique({
        where: {
          userId_cacheType: {
            userId,
            cacheType,
          },
        },
      });

      if (!cache) {
        return null;
      }

      const now = new Date();
      const fetchedAt = cache.fetchedAt;

      // For AI insights, check if cache is from the same day
      if (cacheType === CacheType.aiInsight) {
        if (!isSameDay(now, fetchedAt)) {
          return null;
        }
        return cache.data;
      }

      // For other cache types, use TTL-based expiration
      const ageMs = now.getTime() - fetchedAt.getTime();
      if (ageMs >= ttlMs) {
        return null;
      }

      return cache.data;
    } catch (error) {
      console.error(`Error reading cache for type ${cacheType}:`, error);
      return null;
    }
  }

  /**
   * Stores data in cache for a specific type.
   * @param userId User ID to store cache for
   * @param cacheType Type of cache to store
   * @param data Data to cache
   */
  static async setCachedDataByType(
    userId: string,
    cacheType: CacheType,
    data: CachedData
  ): Promise<void> {
    try {
      await prisma.dashboardCache.upsert({
        where: {
          userId_cacheType: {
            userId,
            cacheType,
          },
        },
        update: {
          data: data as Prisma.InputJsonValue,
          fetchedAt: new Date(),
        },
        create: {
          userId,
          cacheType,
          data: data as Prisma.InputJsonValue,
          fetchedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error writing cache for type ${cacheType}:`, error);
    }
  }
}
