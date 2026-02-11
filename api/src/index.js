import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

import authRoutes from './routes/auth.js';
import teamsRoutes from './routes/teams.js';
import providersRoutes from './routes/providers.js';
import providerRatingsRoutes from './routes/provider-ratings.js';
import spendingRoutes from './routes/spending.js';
import userRoutes from './routes/user.js';
import billingRoutes from './routes/billing.js';
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase client once (singleton)
const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Make Supabase client available to all routes
app.use((req, res, next) => {
  res.locals.supabase = supabaseClient;
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/provider-ratings', providerRatingsRoutes);

// Protected routes
app.use('/api/user', verifyToken, userRoutes);
app.use('/api/teams', verifyToken, teamsRoutes);
app.use('/api/providers', verifyToken, providersRoutes);
app.use('/api/spending', verifyToken, spendingRoutes);
app.use('/api/billing', verifyToken, billingRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ aiMonitor API running on port ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
