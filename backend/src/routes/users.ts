import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { UserUpdate } from '../types/index.js';

const router = Router();

// Helper to convert DB row to camelCase
const formatUser = (row: any) => ({
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

// Get user profile
router.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const isOwnProfile = userId === req.userId;

    // If requesting own profile, return full data including email
    if (isOwnProfile) {
      const result = await query(
        'SELECT id, email, first_name, last_name, avatar_url, goals, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(formatUser(result.rows[0]));
    }

    // If requesting another user's profile, return only public information
    const result = await query(
      'SELECT id, first_name, last_name, avatar_url, created_at FROM users WHERE id = ? AND is_active = 1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const publicUser = {
      id: result.rows[0].id,
      firstName: result.rows[0].first_name,
      lastName: result.rows[0].last_name,
      avatarUrl: result.rows[0].avatar_url,
      createdAt: result.rows[0].created_at,
    };

    res.json(publicUser);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { firstName, lastName, avatarUrl, goals } = req.body as UserUpdate;

    const updates: string[] = [];
    const values: any[] = [];

    if (firstName !== undefined) {
      updates.push(`first_name = ?`);
      values.push(firstName);
    }
    if (lastName !== undefined) {
      updates.push(`last_name = ?`);
      values.push(lastName);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = ?`);
      values.push(avatarUrl);
    }
    if (goals !== undefined) {
      updates.push(`goals = ?`);
      values.push(JSON.stringify(goals));
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(userId);

    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const fetchResult = await query(
      'SELECT id, email, first_name, last_name, avatar_url, goals, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(formatUser(fetchResult.rows[0]));
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await query('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

