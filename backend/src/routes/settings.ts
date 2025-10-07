import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Get all settings
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM settings ORDER BY key');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Update setting
router.put('/:key', authenticate, async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const result = await query(
      `UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = ?`,
      [value, key]
    );
    
    // Fetch updated setting
    const fetchResult = await query(
      'SELECT * FROM settings WHERE key = ?',
      [key]
    );

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json(fetchResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get metrics (dashboard stats)
router.get('/metrics', authenticate, async (req, res, next) => {
  try {
    const [usersResult, progressResult, activeUsersResult] = await Promise.all([
      query('SELECT COUNT(*) as count FROM users'),
      query('SELECT COUNT(*) as count FROM progress'),
      query("SELECT COUNT(DISTINCT user_id) as count FROM progress WHERE created_at > datetime('now', '-30 days')"),
    ]);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProgress: parseInt(progressResult.rows[0].count),
      activeUsers: parseInt(activeUsersResult.rows[0].count),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

