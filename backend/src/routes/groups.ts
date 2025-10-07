import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Generate random 6-character alphanumeric code
const generateGroupCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new group
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Group name is required' });
    }

    // Check if user already has a group
    const existingGroup = await query(
      'SELECT g.id FROM groups g INNER JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ?',
      [req.userId]
    );

    if (existingGroup.rows.length > 0) {
      return res.status(400).json({ error: 'You can only be in one group at a time. Leave your current group first.' });
    }

    // Generate unique code
    let code = generateGroupCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await query('SELECT id FROM groups WHERE code = ?', [code]);
      if (existing.rows.length === 0) {
        isUnique = true;
      } else {
        code = generateGroupCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return res.status(500).json({ error: 'Failed to generate unique code' });
    }

    // Create group
    const insertResult = await query(
      'INSERT INTO groups (name, code, creator_id, description) VALUES (?, ?, ?, ?)',
      [name, code, req.userId, description || null]
    );

    const groupId = insertResult.rows[0].lastInsertRowid;

    // Add creator as member
    await query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [groupId, req.userId]
    );

    // Fetch the created group
    const result = await query(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Join a group by code
router.post('/join', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Group code is required' });
    }

    // Check if user already has a group
    const existingGroup = await query(
      'SELECT g.id FROM groups g INNER JOIN group_members gm ON g.id = gm.group_id WHERE gm.user_id = ?',
      [req.userId]
    );

    if (existingGroup.rows.length > 0) {
      return res.status(400).json({ error: 'You can only be in one group at a time. Leave your current group first.' });
    }

    // Find group by code
    const groupResult = await query(
      'SELECT * FROM groups WHERE code = ?',
      [code.toUpperCase()]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const group = groupResult.rows[0];

    // Add user to group
    await query(
      'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
      [group.id, req.userId]
    );

    res.json(group);
  } catch (error) {
    next(error);
  }
});

// Get user's group (single group only)
router.get('/my-group', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      `SELECT g.*,
              COUNT(gm.id) as member_count,
              u.first_name as creator_first_name,
              u.last_name as creator_last_name
       FROM groups g
       INNER JOIN group_members gm_user ON g.id = gm_user.group_id
       LEFT JOIN group_members gm ON g.id = gm.group_id
       LEFT JOIN users u ON g.creator_id = u.id
       WHERE gm_user.user_id = ?
       GROUP BY g.id
       LIMIT 1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.json(null);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Get group details with members
router.get('/:groupId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);

    // Check if user is member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Get group details
    const groupResult = await query(
      'SELECT * FROM groups WHERE id = ?',
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get members
    const membersResult = await query(
      `SELECT u.id, u.first_name, u.last_name, u.avatar_url, gm.joined_at
       FROM group_members gm
       INNER JOIN users u ON gm.user_id = u.id
       WHERE gm.group_id = ?
       ORDER BY gm.joined_at ASC`,
      [groupId]
    );

    res.json({
      ...groupResult.rows[0],
      members: membersResult.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Get group progress comparison
router.get('/:groupId/progress', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);
    const { category, metric, startDate, endDate, limit = '30' } = req.query;

    // Check if user is member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Build query
    let queryText = `
      SELECT p.*, u.first_name, u.last_name, u.avatar_url
      FROM progress p
      INNER JOIN group_members gm ON p.user_id = gm.user_id
      INNER JOIN users u ON p.user_id = u.id
      WHERE gm.group_id = ?
    `;
    const values: any[] = [groupId];

    if (category) {
      queryText += ` AND p.category = ?`;
      values.push(category);
    }

    if (metric) {
      queryText += ` AND p.metric = ?`;
      values.push(metric);
    }

    if (startDate) {
      queryText += ` AND p.date >= ?`;
      values.push(startDate);
    }

    if (endDate) {
      queryText += ` AND p.date <= ?`;
      values.push(endDate);
    }

    queryText += ` ORDER BY p.date DESC, p.created_at DESC LIMIT ?`;
    values.push(limit);

    const result = await query(queryText, values);

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

// Leave a group
router.delete('/:groupId/leave', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const groupId = parseInt(req.params.groupId);

    // Check if member
    const memberCheck = await query(
      'SELECT id FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.userId]
    );

    if (memberCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Not a member of this group' });
    }

    // Remove member
    await query(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, req.userId]
    );

    // Check if group is empty, delete if so
    const remainingMembers = await query(
      'SELECT id FROM group_members WHERE group_id = ?',
      [groupId]
    );

    if (remainingMembers.rows.length === 0) {
      await query('DELETE FROM groups WHERE id = ?', [groupId]);
    }

    res.json({ message: 'Left group successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
