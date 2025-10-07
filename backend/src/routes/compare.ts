import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Compare progress with another user
router.get('/user/:friendId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const friendId = parseInt(req.params.friendId);
    const { category, startDate, endDate } = req.query;

    // Check if users are friends
    const friendshipResult = await query(
      `SELECT * FROM user_friends 
       WHERE (user_id = ? AND friend_id = ? OR user_id = ? AND friend_id = ?) 
       AND status = 'accepted'`,
      [req.userId, friendId]
    );

    if (friendshipResult.rows.length === 0) {
      return res.status(403).json({ error: 'Users are not friends' });
    }

    // Get both users' progress
    let progressQuery = `
      SELECT p.*, u.id as user_id, u.first_name, u.last_name
      FROM progress p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id IN (?, ?)
    `;
    const values: any[] = [req.userId, friendId];
    let paramCount = 3;

    if (category) {
      progressQuery += ` AND p.category = $${paramCount++}`;
      values.push(category);
    }

    if (startDate) {
      progressQuery += ` AND p.date >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      progressQuery += ` AND p.date <= $${paramCount++}`;
      values.push(endDate);
    }

    progressQuery += ' ORDER BY p.date DESC';

    const progressResult = await query(progressQuery, values);

    // Get user details
    const usersResult = await query(
      'SELECT id, email, first_name, last_name, avatar_url FROM users WHERE id IN (?, ?)',
      [req.userId, friendId]
    );

    const currentUser = usersResult.rows.find((u) => u.id === req.userId);
    const friend = usersResult.rows.find((u) => u.id === friendId);

    const currentUserProgress = progressResult.rows.filter((p) => p.user_id === req.userId);
    const friendProgress = progressResult.rows.filter((p) => p.user_id === friendId);

    res.json({
      currentUser: {
        user: currentUser,
        progress: currentUserProgress,
        totalEntries: currentUserProgress.length,
        averageValue: currentUserProgress.reduce((sum, p) => sum + parseFloat(p.value), 0) / currentUserProgress.length || 0,
      },
      friend: {
        user: friend,
        progress: friendProgress,
        totalEntries: friendProgress.length,
        averageValue: friendProgress.reduce((sum, p) => sum + parseFloat(p.value), 0) / friendProgress.length || 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Invite friend
router.post('/invite', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { friendEmail } = req.body;

    if (!friendEmail) {
      return res.status(400).json({ error: 'Friend email is required' });
    }

    // Find friend by email
    const friendResult = await query('SELECT id FROM users WHERE email = ?', [friendEmail]);

    if (friendResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendId = friendResult.rows[0].id;

    if (friendId === req.userId) {
      return res.status(400).json({ error: 'Cannot add yourself as a friend' });
    }

    // Check if friendship already exists
    const existingFriendship = await query(
      'SELECT * FROM user_friends WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)',
      [req.userId, friendId]
    );

    if (existingFriendship.rows.length > 0) {
      return res.status(409).json({ error: 'Friendship already exists' });
    }

    // Create friendship invitation
    await query(
      'INSERT INTO user_friends (user_id, friend_id, status) VALUES (?, ?, ?)',
      [req.userId, friendId, 'pending']
    );

    // Create notification for friend
    await query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [friendId, 'New Friend Invitation', 'You have received a friend invitation to compare progress!', 'info']
    );

    res.json({ message: 'Friend invitation sent' });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard
router.get('/leaderboard', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { category, startDate, endDate, limit = '10' } = req.query;

    let leaderboardQuery = `
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.avatar_url,
        COUNT(p.id) as total_entries,
        SUM(p.value) as total_progress
      FROM users u
      LEFT JOIN progress p ON u.id = p.user_id
      WHERE u.is_active = true
    `;

    const values: any[] = [];
    let paramCount = 1;

    if (category) {
      leaderboardQuery += ` AND p.category = $${paramCount++}`;
      values.push(category);
    }

    if (startDate) {
      leaderboardQuery += ` AND p.date >= $${paramCount++}`;
      values.push(startDate);
    }

    if (endDate) {
      leaderboardQuery += ` AND p.date <= $${paramCount++}`;
      values.push(endDate);
    }

    leaderboardQuery += `
      GROUP BY u.id, u.email, u.first_name, u.last_name, u.avatar_url
      ORDER BY total_progress DESC
      LIMIT $${paramCount++}
    `;
    values.push(limit);

    const result = await query(leaderboardQuery, values);

    const leaderboard = result.rows.map((row, index) => ({
      user: {
        id: row.id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        avatar_url: row.avatar_url,
      },
      totalProgress: parseFloat(row.total_progress) || 0,
      rank: index + 1,
    }));

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

export default router;

