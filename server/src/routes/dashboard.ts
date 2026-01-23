import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { getDashboardData } from '../services/dashboard.js';

const router = express.Router();

/**
 * GET /dashboard/data
 * Fetches all dashboard data for the authenticated user.
 * Returns prices, news, meme, and AI insight.
 */
router.get('/data', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const dashboardData = await getDashboardData(userId);
    res.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data. Please try again later.' });
  }
});

export default router;
