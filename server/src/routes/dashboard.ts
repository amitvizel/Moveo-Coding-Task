import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { CoinGeckoService } from '../services/coingecko.js';
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
    
    // Fetch prices
    let prices = {};
    if (favoriteCoins.length > 0) {
        prices = await CoinGeckoService.getPrices(favoriteCoins);
    }

    res.json({
      prices,
      // Placeholders for other services we'll add later
      news: [],
      meme: null,
      aiInsight: null
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
