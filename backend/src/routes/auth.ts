import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { User, UserCreate, LoginRequest, AuthResponse } from '../types/index.js';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// Helper to convert DB row to camelCase
const formatUser = (row: any): User => ({
  id: row.id,
  email: row.email,
  firstName: row.first_name,
  lastName: row.last_name,
  avatarUrl: row.avatar_url,
  goals: row.goals ? JSON.parse(row.goals) : [],
  isActive: Boolean(row.is_active),
  emailVerified: Boolean(row.email_verified),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions);
  return { accessToken, refreshToken };
};

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body as UserCreate;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if email already exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user - SQLite doesn't support RETURNING, we'll fetch after insert
    const insertResult = await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName, lastName]
    );

    // Fetch the inserted user
    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, goals, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [insertResult.rows[0].lastInsertRowid]
    );

    const user = formatUser(result.rows[0]);
    res.status(201).json(user);
  } catch (error: any) {
    // Handle SQLite unique constraint error
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body as LoginRequest;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clean up expired tokens for this user
    await query(
      "DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at <= datetime('now')",
      [user.id]
    );

    // Check number of active tokens and limit to 5
    const activeTokensResult = await query(
      'SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = ?',
      [user.id]
    );

    const activeTokensCount = activeTokensResult.rows[0].count;
    if (activeTokensCount >= 5) {
      // Delete the oldest token to make room
      await query(
        'DELETE FROM refresh_tokens WHERE user_id = ? AND id IN (SELECT id FROM refresh_tokens WHERE user_id = ? ORDER BY created_at ASC LIMIT 1)',
        [user.id, user.id]
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, refreshToken, expiresAt.toISOString()]
    );

    // Check if password reset is required
    const passwordResetRequired = user.password_reset_required === 1;

    // Format user (converts snake_case to camelCase)
    const formattedUser = formatUser(user);

    const authResponse: AuthResponse = {
      user: formattedUser,
      accessToken,
      refreshToken,
      passwordResetRequired,
    };

    res.json(authResponse);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token JWT signature
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET) as { userId: number };
    } catch (error) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Check if refresh token exists in database AND delete it immediately (rotation)
    const tokenResult = await query(
      "SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > datetime('now')",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: 'Refresh token expired or not found' });
    }

    // Delete the old refresh token immediately (rotation security)
    await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

    // Clean up expired tokens for this user
    await query(
      "DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at <= datetime('now')",
      [decoded.userId]
    );

    // Check number of active tokens and limit to 5
    const activeTokensResult = await query(
      'SELECT COUNT(*) as count FROM refresh_tokens WHERE user_id = ?',
      [decoded.userId]
    );

    const activeTokensCount = activeTokensResult.rows[0].count;
    if (activeTokensCount >= 5) {
      // Delete the oldest token to make room
      await query(
        'DELETE FROM refresh_tokens WHERE user_id = ? AND id IN (SELECT id FROM refresh_tokens WHERE user_id = ? ORDER BY created_at ASC LIMIT 1)',
        [decoded.userId, decoded.userId]
      );
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);

    // Store new refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [decoded.userId, newRefreshToken, expiresAt.toISOString()]
    );

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
});

// Forgot password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const userResult = await query(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );

    // Don't reveal if email exists - always return success
    if (userResult.rows.length === 0) {
      return res.json({ message: 'Si cet email existe, un mot de passe temporaire a été envoyé' });
    }

    const user = userResult.rows[0] as { id: number; email: string; first_name: string };

    // Generate temporary password
    const { generateTemporaryPassword, sendPasswordResetEmail } = await import('../utils/email.js');
    const temporaryPassword = generateTemporaryPassword();

    // Hash the temporary password
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    // Update user's password with temporary password and set reset flag
    await query(
      'UPDATE users SET password_hash = ?, password_reset_required = 1 WHERE id = ?',
      [passwordHash, user.id]
    );

    // Delete all existing refresh tokens to force re-login
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);

    // Send email with temporary password
    try {
      await sendPasswordResetEmail(user.email, user.first_name, temporaryPassword);
      console.log(`✅ Temporary password sent to ${user.email}`);
    } catch (emailError: any) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Rollback the password change if email fails
      return res.status(500).json({ error: 'Échec de l\'envoi de l\'email de réinitialisation' });
    }

    res.json({ message: 'Si cet email existe, un mot de passe temporaire a été envoyé' });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    // Find valid token
    const tokenResult = await query(
      "SELECT user_id FROM password_reset_tokens WHERE token = ? AND expires_at > datetime('now') AND used = false",
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, userId]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = true WHERE token = ?', [token]);

    // Delete all refresh tokens for this user
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

// Change password (for users who need to reset their temporary password)
router.post('/change-password', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
    }

    // Get user with current password
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = ?',
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0] as { id: number; password_hash: string };

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Le mot de passe actuel est incorrect' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset flag
    await query(
      'UPDATE users SET password_hash = ?, password_reset_required = 0 WHERE id = ?',
      [passwordHash, user.id]
    );

    // Delete all refresh tokens to force re-login on all devices
    await query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);

    res.json({ message: 'Mot de passe changé avec succès' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, goals, is_active, email_verified, password_reset_required, created_at, updated_at FROM users WHERE id = ?',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUser(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

export default router;

