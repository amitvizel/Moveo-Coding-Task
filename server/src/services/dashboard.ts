import { CoinGeckoService } from './coingecko.js';
import { CryptoPanicService } from './cryptopanic.js';
import { MemeService } from './meme.js';
import { AIService } from './ai.js';
import { CacheService, CACHE_TTL_MS, AI_INSIGHT_CACHE_TTL_MS, CacheType } from './cache.js';
import prisma from '../prisma.js';
import type { UserPreferences } from '../types/preferences.js';

export interface DashboardData {
  prices: Record<string, { usd: number; usd_24h_change: number }>;
  news: Array<{
    id: number;
    title: string;
    url: string;
    domain: string;
    created_at: string;
  }>;
  meme: {
    title: string;
    url: string;
    author: string;
    permalink: string;
  } | null;
  aiInsight: string | null;
}

/**
 * Type guard to check if a value is a valid price data object.
 */
function isValidPriceData(
  value: unknown
): value is { usd: number; usd_24h_change: number } {
  return (
    value !== null &&
    typeof value === 'object' &&
    'usd' in value &&
    'usd_24h_change' in value &&
    typeof (value as { usd: unknown }).usd === 'number' &&
    typeof (value as { usd_24h_change: unknown }).usd_24h_change === 'number'
  );
}

/**
 * Filters out invalid price entries that don't have valid usd and usd_24h_change properties.
 * @param prices Raw prices data from API or cache
 * @returns Filtered prices object with only valid entries
 */
function filterValidPrices(
  prices: Record<string, unknown>
): Record<string, { usd: number; usd_24h_change: number }> {
  const validPrices: Record<string, { usd: number; usd_24h_change: number }> = {};
  for (const [coinId, priceData] of Object.entries(prices)) {
    if (isValidPriceData(priceData)) {
      validPrices[coinId] = priceData;
    }
  }
  return validPrices;
}

/**
 * Fetches user preferences from the database.
 * @param userId User ID to fetch preferences for
 * @returns User preferences object with defaults
 */
async function getUserPreferences(userId: string): Promise<{
  favoriteCoins: string[];
  investorType: string;
  contentPreferences: string[];
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { preferences: true },
  });

  const preferences = (user?.preferences as UserPreferences | null) || {};
  return {
    favoriteCoins: preferences.favoriteCoins || [],
    investorType: preferences.investorType || 'moderate',
    contentPreferences: preferences.contentPreferences || [],
  };
}

/**
 * Fetches or retrieves cached prices data.
 * @param userId User ID
 * @param favoriteCoins List of favorite coin symbols
 * @returns Prices data object
 */
async function fetchPrices(
  userId: string,
  favoriteCoins: string[]
): Promise<Record<string, { usd: number; usd_24h_change: number }>> {
  let prices = await CacheService.getCachedDataByType(
    userId,
    CacheType.prices,
    CACHE_TTL_MS
  ) as Record<string, { usd: number; usd_24h_change: number }> | null;

  if (!prices) {
    console.log('[Dashboard] Fetching prices for user:', userId);
    prices = favoriteCoins.length > 0
      ? await CoinGeckoService.getPrices(favoriteCoins)
      : {};
    
    prices = filterValidPrices(prices);
    await CacheService.setCachedDataByType(userId, CacheType.prices, prices);
  } else {
    console.log('[Dashboard] Using cached prices for user:', userId);
    prices = filterValidPrices(prices);
  }

  return prices;
}

/**
 * Fetches or retrieves cached news data.
 * @param userId User ID
 * @param favoriteCoins List of favorite coin symbols
 * @returns Array of news items
 */
async function fetchNews(
  userId: string,
  favoriteCoins: string[]
): Promise<Array<{
  id: number;
  title: string;
  url: string;
  domain: string;
  created_at: string;
}>> {
  let news = await CacheService.getCachedDataByType(
    userId,
    CacheType.news,
    CACHE_TTL_MS
  ) as Array<{
    id: number;
    title: string;
    url: string;
    domain: string;
    created_at: string;
  }> | null;

  if (!news) {
    console.log('[Dashboard] Fetching news for user:', userId);
    news = await CryptoPanicService.getNews(favoriteCoins);
    await CacheService.setCachedDataByType(userId, CacheType.news, news);
  } else {
    console.log('[Dashboard] Using cached news for user:', userId);
  }

  return news;
}

/**
 * Normalizes AI insight data from cache (handles both old string format and new object format).
 * @param aiInsight Cached AI insight data
 * @returns Normalized insight string or null
 */
function normalizeAiInsight(aiInsight: unknown): string | null {
  if (typeof aiInsight === 'object' && aiInsight !== null && 'insight' in aiInsight) {
    return (aiInsight as { insight: string }).insight;
  }
  if (typeof aiInsight === 'string') {
    return aiInsight;
  }
  return null;
}

/**
 * Fetches or generates AI insight data.
 * @param userId User ID
 * @param preferences User preferences
 * @param prices Current prices data
 * @param news Current news data
 * @returns AI insight string or null
 */
async function fetchAiInsight(
  userId: string,
  preferences: { favoriteCoins: string[]; investorType: string; contentPreferences: string[] },
  prices: Record<string, { usd: number; usd_24h_change: number }>,
  news: Array<{ title?: string }>
): Promise<string | null> {
  let aiInsight = await CacheService.getCachedDataByType(
    userId,
    CacheType.aiInsight,
    AI_INSIGHT_CACHE_TTL_MS
  );

  if (!aiInsight) {
    console.log('[Dashboard] Generating AI insight for user:', userId);
    const insightText = await AIService.generateInsight(
      {
        favoriteCoins: preferences.favoriteCoins,
        investorType: preferences.investorType,
        contentPreferences: preferences.contentPreferences,
      },
      {
        prices,
        newsCount: news.length,
        topNewsTitle: news[0]?.title,
      }
    );
    const insightObject = { insight: insightText };
    await CacheService.setCachedDataByType(userId, CacheType.aiInsight, insightObject);
    return insightText;
  }

  console.log('[Dashboard] Using cached AI insight for user:', userId);
  return normalizeAiInsight(aiInsight);
}

/**
 * Fetches all dashboard data for a user.
 * @param userId User ID to fetch data for
 * @returns Complete dashboard data object
 */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  const preferences = await getUserPreferences(userId);

  // Fetch all data in parallel where possible
  const [prices, news] = await Promise.all([
    fetchPrices(userId, preferences.favoriteCoins),
    fetchNews(userId, preferences.favoriteCoins),
  ]);

  // Meme is always fetched fresh (not cached)
  console.log('[Dashboard] Fetching fresh meme for user:', userId);
  const meme = await MemeService.getMeme();

  // AI insight depends on prices and news, so fetch after those are ready
  const aiInsight = await fetchAiInsight(userId, preferences, prices, news);

  return {
    prices,
    news,
    meme,
    aiInsight,
  };
}
