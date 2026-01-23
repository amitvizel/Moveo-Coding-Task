import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { CoinGeckoService } from '../services/coingecko.js';
import { CryptoPanicService } from '../services/cryptopanic.js';
import { MemeService } from '../services/meme.js';
import { AIService } from '../services/ai.js';
import { CacheService, CACHE_TTL_MS, MEME_CACHE_TTL_MS, AI_INSIGHT_CACHE_TTL_MS, CacheType } from '../services/cache.js';
import prisma from '../prisma.js';

const router = express.Router();

router.get('/data', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user preferences to get favorite coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferences = (user?.preferences as any) || {};
    const favoriteCoins = preferences.favoriteCoins || [];
    const investorType = preferences.investorType || 'moderate';
    const contentPreferences = preferences.contentPreferences || [];

    // Check cache for each data type and fetch if stale or missing
    let prices = await CacheService.getCachedDataByType(userId, CacheType.prices, CACHE_TTL_MS);
    let news = await CacheService.getCachedDataByType(userId, CacheType.news, CACHE_TTL_MS);
    let meme = await CacheService.getCachedDataByType(userId, CacheType.meme, MEME_CACHE_TTL_MS);
    let aiInsight = await CacheService.getCachedDataByType(userId, CacheType.aiInsight, AI_INSIGHT_CACHE_TTL_MS);

    // Fetch prices if cache is stale or missing
    if (!prices) {
      console.log('[Dashboard] Fetching prices for user:', userId);
      prices = favoriteCoins.length > 0 
        ? await CoinGeckoService.getPrices(favoriteCoins) 
        : {};
      await CacheService.setCachedDataByType(userId, CacheType.prices, prices);
    } else {
      console.log('[Dashboard] Using cached prices for user:', userId);
    }

    // Fetch news if cache is stale or missing
    if (!news) {
      console.log('[Dashboard] Fetching news for user:', userId);
      news = await CryptoPanicService.getNews(favoriteCoins);
      await CacheService.setCachedDataByType(userId, CacheType.news, news);
    } else {
      console.log('[Dashboard] Using cached news for user:', userId);
    }

    // Always fetch a fresh meme on every dashboard refresh
    console.log('[Dashboard] Fetching fresh meme for user:', userId);
    meme = await MemeService.getMeme();

    // Fetch AI insight if cache is stale or missing
    // Note: AI insight depends on prices and news, so we need fresh data
    if (!aiInsight) {
      console.log('[Dashboard] Generating AI insight for user:', userId);
      const insightText = await AIService.generateInsight(
        {
          favoriteCoins,
          investorType,
          contentPreferences,
        },
        {
          prices,
          newsCount: news.length,
          topNewsTitle: news[0]?.title,
        }
      );
      // Store as JSON object, not plain string
      const insightObject = { insight: insightText };
      await CacheService.setCachedDataByType(userId, CacheType.aiInsight, insightObject);
      aiInsight = insightText;
    } else {
      console.log('[Dashboard] Using cached AI insight for user:', userId);
      // Handle both object format (new) and string format (old) for backward compatibility
      if (typeof aiInsight === 'object' && aiInsight !== null && 'insight' in aiInsight) {
        aiInsight = (aiInsight as { insight: string }).insight;
      } else if (typeof aiInsight === 'string') {
        // Already a string, use as-is
        aiInsight = aiInsight;
      } else {
        aiInsight = null;
      }
    }

    const dashboardData = {
      prices,
      news,
      meme,
      aiInsight
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
