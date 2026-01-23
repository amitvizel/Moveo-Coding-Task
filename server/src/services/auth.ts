import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { isValidEmail, isValidPassword } from '../utils/validation.js';
import { getJwtSecret } from '../utils/config.js';
import { MIN_PASSWORD_LENGTH, JWT_TOKEN_EXPIRATION, BCRYPT_ROUNDS } from '../utils/constants.js';

export interface RegisterResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    preferences: unknown;
  };
}

/**
 * Registers a new user account.
 * @param email User email address
 * @param password User password
 * @param name Optional user name
 * @returns Token and user object
 * @throws Error if validation fails or email is already in use
 */
export async function registerUser(
  email: string,
  password: string,
  name?: string
): Promise<RegisterResult> {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!isValidPassword(password, MIN_PASSWORD_LENGTH)) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error('Email already in use');
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: name ?? null,
    },
  });

  const JWT_SECRET = getJwtSecret();
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_TOKEN_EXPIRATION });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  };
}

/**
 * Authenticates a user and returns a JWT token.
 * @param email User email address
 * @param password User password
 * @returns Token and user object with preferences
 * @throws Error if validation fails, user not found, or invalid credentials
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  if (!isValidEmail(email)) {
    throw new Error('Invalid email format');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('User not found');
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw new Error('Invalid credentials');
  }

  const JWT_SECRET = getJwtSecret();
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_TOKEN_EXPIRATION });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      preferences: user.preferences,
    },
  };
}
