import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { CoinGeckoService } from '../services/coingecko.js';
import { CryptoPanicService } from '../services/cryptopanic.js';
import { MemeService } from '../services/meme.js';
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

    const favoriteCoins = (user?.preferences as any)?.favoriteCoins || [];
    
    // Fetch prices, news, and meme in parallel
    const [prices, news, meme] = await Promise.all([
      favoriteCoins.length > 0 ? CoinGeckoService.getPrices(favoriteCoins) : Promise.resolve({}),
      CryptoPanicService.getNews(favoriteCoins),
      MemeService.getMeme()
    ]);

    res.json({
      prices,
      news,
      meme,
      // Placeholder for AI service we'll add later
      aiInsight: null
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
