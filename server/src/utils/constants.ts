// Authentication constants
export const MIN_PASSWORD_LENGTH = 6;
export const JWT_TOKEN_EXPIRATION = '1d';
export const BCRYPT_ROUNDS = 10;

// AI Service constants
export const AI_MAX_TOKENS = 150;
export const AI_TEMPERATURE = 0.7;
export const AI_TOP_P = 0.95;
export const AI_REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const AI_RESPONSE_MAX_LENGTH = 500;

// Meme Service constants
export const REDDIT_POST_LIMIT = 50;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL_MS = 60 * 1000; // 1 minute
export const MEME_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const AI_INSIGHT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
