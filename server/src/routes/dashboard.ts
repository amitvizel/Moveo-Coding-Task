import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { CoinGeckoService } from '../services/coingecko.js';
import { CryptoPanicService } from '../services/cryptopanic.js';
import { MemeService } from '../services/meme.js';
import { AIService } from '../services/ai.js';
import { CacheService } from '../services/cache.js';
import prisma from '../prisma.js';

const router = express.Router();

router.get('/data', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Check cache first
    const cachedData = await CacheService.getCachedData(userId);
    if (cachedData) {
      console.log('[Dashboard] Returning cached data for user:', userId);
      return res.json(cachedData);
    }

    console.log('[Dashboard] Cache miss or stale, fetching fresh data for user:', userId);

    // Fetch user preferences to get favorite coins
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    });

    const preferences = (user?.preferences as any) || {};
    const favoriteCoins = preferences.favoriteCoins || [];
    const investorType = preferences.investorType || 'moderate';
    const contentPreferences = preferences.contentPreferences || [];
    
    // Fetch prices, news, and meme in parallel
    const [prices, news, meme] = await Promise.all([
      favoriteCoins.length > 0 ? CoinGeckoService.getPrices(favoriteCoins) : Promise.resolve({}),
      CryptoPanicService.getNews(favoriteCoins),
      MemeService.getMeme()
    ]);

    // Generate AI insight based on user preferences and market data
    const aiInsight = await AIService.generateInsight(
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

    const dashboardData = {
      prices,
      news,
      meme,
      aiInsight
    };

    // Store in cache
    await CacheService.setCachedData(userId, dashboardData);

    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
