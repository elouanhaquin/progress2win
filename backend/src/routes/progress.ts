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

    const result = await query(
      `INSERT INTO progress (user_id, category, metric, value, unit, notes, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?) 
       RETURNING *`,
      [req.userId, category, metric, value, unit, notes, date]
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
    let paramCount = 2;

    if (category) {
      queryText += ` AND category = $${paramCount++}`;
      values.push(category);
    }

    if (startDate) {
      queryText += ` AND date >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      queryText += ` AND date <= $${paramCount++}`;
      values.push(endDate);
    }

    queryText += ` ORDER BY date DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
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
    let paramCount = 1;

    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (metric !== undefined) {
      updates.push(`metric = $${paramCount++}`);
      values.push(metric);
    }
    if (value !== undefined) {
      updates.push(`value = $${paramCount++}`);
      values.push(value);
    }
    if (unit !== undefined) {
      updates.push(`unit = $${paramCount++}`);
      values.push(unit);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(notes);
    }
    if (date !== undefined) {
      updates.push(`date = $${paramCount++}`);
      values.push(date);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = datetime('now')`);
    values.push(progressId);

    const result = await query(
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

    const result = await query(
      'DELETE FROM progress WHERE id = ? AND user_id = ? RETURNING id',
      [progressId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Progress not found' });
    }

    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

