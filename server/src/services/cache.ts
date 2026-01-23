import prisma from '../prisma.js';

// Type for cache types
export type CacheType = 'prices' | 'news' | 'meme' | 'aiInsight';

// Cache type constants
export const CacheType = {
  prices: 'prices' as const,
  news: 'news' as const,
  meme: 'meme' as const,
  aiInsight: 'aiInsight' as const,
} as const;

// Type assertion to work around TypeScript language server not picking up generated types
const typedPrisma = prisma as typeof prisma & {
  dashboardCache: {
    findUnique: (args: any) => Promise<any>;
    upsert: (args: any) => Promise<any>;
  };
};

export const CACHE_TTL_MS = 60 * 1000; // 1 minute in milliseconds
export const MEME_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
export const AI_INSIGHT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

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
  ): Promise<any | null> {
    try {
      const cache = await typedPrisma.dashboardCache.findUnique({
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
    data: any
  ): Promise<void> {
    try {
      await typedPrisma.dashboardCache.upsert({
        where: {
          userId_cacheType: {
            userId,
            cacheType,
          },
        },
        update: {
          data,
          fetchedAt: new Date(),
        },
        create: {
          userId,
          cacheType,
          data,
          fetchedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(`Error writing cache for type ${cacheType}:`, error);
    }
  }
}
