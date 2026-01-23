import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import { submitFeedback } from '../services/feedback.js';
import { FeedbackContentType, VoteType } from '@prisma/client';

const router = express.Router();

/**
 * POST /feedback
 * Submits user feedback (upvote/downvote) for content.
 * @body {string} contentType - Type of content (NEWS, AI_INSIGHT, MEME, COIN_PRICE)
 * @body {string} contentId - ID of the content item
 * @body {string} vote - Vote type (UP or DOWN)
 * @returns {object} Created feedback object
 */
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { contentType, contentId, vote } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const feedback = await submitFeedback(
      userId,
      contentType as FeedbackContentType,
      contentId,
      vote as VoteType
    );

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to submit feedback. Please try again later.';
    
    if (errorMessage.includes('Missing required fields') || errorMessage.includes('Invalid')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to submit feedback. Please try again later.' });
  }
});

export default router;
