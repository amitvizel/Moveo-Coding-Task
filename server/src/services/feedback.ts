import prisma from '../prisma.js';
import { FeedbackContentType, VoteType } from '@prisma/client';

export interface FeedbackInput {
  contentType: FeedbackContentType;
  contentId: string;
  vote: VoteType;
}

/**
 * Submits user feedback for content.
 * @param userId User ID
 * @param contentType Type of content (NEWS, AI_INSIGHT, MEME, COIN_PRICE)
 * @param contentId ID of the content item
 * @param vote Vote type (UP or DOWN)
 * @returns Created feedback object
 * @throws Error if validation fails
 */
export async function submitFeedback(
  userId: string,
  contentType: FeedbackContentType,
  contentId: string,
  vote: VoteType
): Promise<{
  id: string;
  userId: string;
  contentType: FeedbackContentType;
  contentId: string;
  vote: VoteType;
  createdAt: Date;
}> {
  if (!contentType || !contentId || !vote) {
    throw new Error('Missing required fields');
  }

  if (!Object.values(FeedbackContentType).includes(contentType)) {
    throw new Error('Invalid content type');
  }

  if (!Object.values(VoteType).includes(vote)) {
    throw new Error('Invalid vote type');
  }

  const feedback = await prisma.feedback.create({
    data: {
      userId,
      contentType,
      contentId,
      vote,
    },
  });

  return feedback;
}
