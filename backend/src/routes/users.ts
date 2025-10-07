import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { UserUpdate } from '../types/index.js';

const router = Router();

// Get user profile
router.get('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

    const result = await query(
      'SELECT id, email, first_name, last_name, avatar_url, goals, is_active, email_verified, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

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

    res.json(fetchResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete user account
router.delete('/:userId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const userId = parseInt(req.params.userId);

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

