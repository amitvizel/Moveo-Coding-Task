import express from 'express';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import prisma from '../prisma.js';
import { FeedbackContentType, VoteType } from '@prisma/client';

const router = express.Router();

router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    const { contentType, contentId, vote } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!contentType || !contentId || !vote) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate enum values
    if (!Object.values(FeedbackContentType).includes(contentType)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    if (!Object.values(VoteType).includes(vote)) {
        return res.status(400).json({ error: 'Invalid vote type' });
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId,
        contentType,
        contentId,
        vote,
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

export default router;
