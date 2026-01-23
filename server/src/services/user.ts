import prisma from '../prisma.js';
import { Prisma } from '@prisma/client';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  preferences: unknown;
}

/**
 * Retrieves a user's profile.
 * @param userId User ID
 * @returns User profile with id, email, name, and preferences
 * @throws Error if user not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

/**
 * Updates a user's preferences.
 * @param userId User ID
 * @param preferences User preferences object
 * @returns Updated user object
 */
export async function updateUserPreferences(
  userId: string,
  preferences: unknown
): Promise<UserProfile> {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { preferences: preferences as Prisma.InputJsonValue },
    select: {
      id: true,
      email: true,
      name: true,
      preferences: true,
    },
  });

  return updatedUser;
}
