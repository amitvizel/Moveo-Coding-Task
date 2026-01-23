import { Router } from 'express';
import { registerUser, loginUser } from '../services/auth.js';

const router = Router();

/**
 * POST /auth/register
 * Registers a new user account.
 * @body {string} email - User email address
 * @body {string} password - User password (minimum 6 characters)
 * @body {string} [name] - Optional user name
 * @returns {object} Token and user object
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const result = await registerUser(email, password, name);
    res.json(result);
  } catch (error) {
    console.error('Error during registration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to register user. Please try again.';
    
    if (errorMessage === 'Email already in use' || errorMessage.includes('Invalid') || errorMessage.includes('required')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to register user. Please try again.' });
  }
});

/**
 * POST /auth/login
 * Authenticates a user and returns a JWT token.
 * @body {string} email - User email address
 * @body {string} password - User password
 * @returns {object} Token and user object with preferences
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error) {
    console.error('Error during login:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to login. Please try again.';
    
    if (errorMessage === 'User not found') {
      return res.status(404).json({ error: errorMessage });
    }
    
    if (errorMessage === 'Invalid credentials' || errorMessage.includes('Invalid') || errorMessage.includes('required')) {
      return res.status(400).json({ error: errorMessage });
    }
    
    res.status(500).json({ error: 'Failed to login. Please try again.' });
  }
});

export default router;
