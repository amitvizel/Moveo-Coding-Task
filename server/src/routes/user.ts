import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { getUserProfile, updateUserPreferences } from '../services/user.js';

const router = express.Router();

/**
 * GET /user/me
 * Retrieves the current authenticated user's profile.
 * @returns {object} User profile with id, email, name, and preferences
 */
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const user = await getUserProfile(userId);
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile. Please try again later.';
    
    if (errorMessage === 'User not found') {
      return res.status(404).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to fetch user profile. Please try again later.' });
  }
});

/**
 * PUT /user/preferences
 * Updates the current user's preferences.
 * @body {object} preferences - User preferences object
 * @returns {object} Success message and updated user object
 */
router.put('/preferences', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { preferences } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updatedUser = await updateUserPreferences(userId, preferences);
    res.json({ message: 'Preferences updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences. Please try again later.' });
  }
});

export default router;
