import prisma from '../prisma.js';

const CACHE_TTL_MS = 60 * 1000; // 1 minute in milliseconds

export class CacheService {
  /**
   * Retrieves cached dashboard data if it exists and is less than 1 minute old.
   * @param userId User ID to retrieve cache for
   * @returns Cached data if valid, null if cache is stale or doesn't exist
   */
  static async getCachedData(userId: string): Promise<any | null> {
    try {
      const cache = await prisma.dashboardCache.findUnique({
        where: { userId },
      });

      if (!cache) {
        return null;
      }

      const now = new Date();
      const fetchedAt = cache.fetchedAt;
      const ageMs = now.getTime() - fetchedAt.getTime();

      if (ageMs >= CACHE_TTL_MS) {
        return null;
      }

      return cache.data;
    } catch (error) {
      console.error('Error reading cache:', error);
      return null;
    }
  }

  /**
   * Stores dashboard response in cache for a user.
   * @param userId User ID to store cache for
   * @param data Dashboard response data to cache
   */
  static async setCachedData(userId: string, data: any): Promise<void> {
    try {
      await prisma.dashboardCache.upsert({
        where: { userId },
        update: {
          data,
          fetchedAt: new Date(),
        },
        create: {
          userId,
          data,
          fetchedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Error writing cache:', error);
    }
  }
}
