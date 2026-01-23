/**
 * Validates email format using a simple regex pattern.
 * @param email Email address to validate
 * @returns true if email format is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password meets minimum requirements.
 * @param password Password to validate
 * @param minLength Minimum password length (default: 6)
 * @returns true if password is valid, false otherwise
 */
export function isValidPassword(password: string, minLength: number = 6): boolean {
  return password.length >= minLength;
}
