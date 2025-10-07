import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { NotificationCreate } from '../types/index.js';

const router = Router();

// Get notifications
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '50', offset = '0', unreadOnly = 'false' } = req.query;

    let queryText = 'SELECT * FROM notifications WHERE user_id = ?';
    const values: any[] = [req.userId];

    if (unreadOnly === 'true') {
      queryText += ' AND is_read = false';
    }

    queryText += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const result = await query(queryText, values);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Create notification (admin only - simplified for now)
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { title, message, type = 'info' } = req.body as NotificationCreate;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const result = await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?) RETURNING *',
      [req.userId, title, message, type]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/:notificationId/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notificationId = parseInt(req.params.notificationId);

    const result = await query(
      'UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ? RETURNING *',
      [notificationId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:notificationId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notificationId = parseInt(req.params.notificationId);

    const result = await query(
      'DELETE FROM notifications WHERE id = ? AND user_id = ? RETURNING id',
      [notificationId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

