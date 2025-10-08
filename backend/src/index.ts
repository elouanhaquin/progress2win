import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import progressRoutes from './routes/progress.js';
import compareRoutes from './routes/compare.js';
import notificationsRoutes from './routes/notifications.js';
import subscriptionsRoutes from './routes/subscriptions.js';
import settingsRoutes from './routes/settings.js';
import groupsRoutes from './routes/groups.js';
import feedbackRoutes from './routes/feedback.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.CORS_ORIGIN].filter(Boolean)
  : [
      'http://localhost:5173',    // Vite dev server
      'http://localhost:1420',    // Tauri dev server
      'https://tauri.localhost',  // Tauri production
      process.env.CORS_ORIGIN || ''
    ].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting - Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Rate limiting - Specific for auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Trop de tentatives de connexion, réessayez dans 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Trop de demandes de réinitialisation, réessayez dans 1 heure',
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: 'Trop de créations de compte, réessayez demain',
  standardHeaders: true,
  legacyHeaders: false,
});

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply specific rate limiters to auth endpoints
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/forgot-password', forgotPasswordLimiter);
app.use('/api/auth/register', registerLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/feedback', feedbackRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`
🚀 Progress2Win Backend Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export default app;

