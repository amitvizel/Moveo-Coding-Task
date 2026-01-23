/**
 * Validates and returns JWT_SECRET from environment variables.
 * Throws an error if JWT_SECRET is not set.
 * @returns JWT_SECRET string
 * @throws Error if JWT_SECRET is not set
 */
export function getJwtSecret(): string {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return jwtSecret;
}
