import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import type { ProgressCreate, ProgressUpdate } from '../types/index.js';

const router = Router();

// Add progress
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { category, metric, value, unit, notes, date } = req.body as ProgressCreate;

    if (!category || !metric || value === undefined || !date) {
      return res.status(400).json({ error: 'Category, metric, value, and date are required' });
    }

    const insertResult = await query(
      `INSERT INTO progress (user_id, category, metric, value, unit, notes, date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, category, metric, value, unit || null, notes || null, date]
    );

    // Fetch the inserted progress
    const result = await query(
      'SELECT * FROM progress WHERE id = ?',
      [insertResult.rows[0].lastInsertRowid]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get user progress
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { limit = '100', offset = '0', category, startDate, endDate } = req.query;

    let queryText = 'SELECT * FROM progress WHERE user_id = ?';
    const values: any[] = [req.userId];

    if (category) {
      queryText += ` AND category = ?`;
      values.push(category);
    }

    if (startDate) {
      queryText += ` AND date >= ?`;
      values.push(startDate);
    }

    if (endDate) {
      queryText += ` AND date <= ?`;
      values.push(endDate);
    }

    queryText += ` ORDER BY date DESC LIMIT ? OFFSET ?`;
    values.push(limit, offset);

    const result = await query(queryText, values);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Get progress by ID
router.get('/:progressId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const progressId = parseInt(req.params.progressId);

    const result = await query(
      'SELECT * FROM progress WHERE id = ? AND user_id = ?',
      [progressId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Update progress
router.put('/:progressId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const progressId = parseInt(req.params.progressId);
    const { category, metric, value, unit, notes, date } = req.body as ProgressUpdate;

    // Check if progress exists and belongs to user
    const existingResult = await query(
      'SELECT * FROM progress WHERE id = ? AND user_id = ?',
      [progressId, req.userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (category !== undefined) {
      updates.push(`category = ?`);
      values.push(category);
    }
    if (metric !== undefined) {
      updates.push(`metric = ?`);
      values.push(metric);
    }
    if (value !== undefined) {
      updates.push(`value = ?`);
      values.push(value);
    }
    if (unit !== undefined) {
      updates.push(`unit = ?`);
      values.push(unit);
    }
    if (notes !== undefined) {
      updates.push(`notes = ?`);
      values.push(notes);
    }
    if (date !== undefined) {
      updates.push(`date = ?`);
      values.push(date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(progressId);

    await query(
      `UPDATE progress SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated progress
    const fetchResult = await query(
      'SELECT * FROM progress WHERE id = ?',
      [progressId]
    );

    res.json(fetchResult.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Delete progress
router.delete('/:progressId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const progressId = parseInt(req.params.progressId);

    // Check if progress exists
    const existingResult = await query(
      'SELECT id FROM progress WHERE id = ? AND user_id = ?',
      [progressId, req.userId]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    await query(
      'DELETE FROM progress WHERE id = ? AND user_id = ?',
      [progressId, req.userId]
    );

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

