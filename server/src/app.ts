import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import dashboardRoutes from './routes/dashboard.js';
import feedbackRoutes from './routes/feedback.js';

dotenv.config();

const app = express();

// CORS configuration - supports single origin or comma-separated list of origins
const corsOriginEnv = process.env.CORS_ORIGIN || 'http://localhost:5173';
const corsOrigins = corsOriginEnv.includes(',')
  ? corsOriginEnv.split(',').map(origin => origin.trim())
  : corsOriginEnv;
app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/feedback', feedbackRoutes);

app.get('/health', (req, res) => {
  res.send('OK');
});

export default app;
