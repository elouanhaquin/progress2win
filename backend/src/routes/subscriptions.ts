import { Router } from 'express';
import { query } from '../database/db.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Create checkout session (placeholder for Stripe integration)
router.post('/create-checkout', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { planType } = req.body;

    if (!planType) {
      return res.status(400).json({ error: 'Plan type is required' });
    }

    // TODO: Integrate with Stripe
    // For now, just create a basic subscription
    const result = await query(
      `INSERT INTO subscriptions (user_id, status, plan_type) 
       VALUES (?, ?, ?) 
       RETURNING *`,
      [req.userId, 'active', planType]
    );

    res.json({
      subscription: result.rows[0],
      checkoutUrl: 'https://checkout.stripe.com/placeholder',
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Cancel subscription
router.post('/cancel', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await query(
      'UPDATE subscriptions SET status = ? WHERE user_id = ? AND status = ? RETURNING *',
      ['canceled', req.userId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// Webhook handler (placeholder for Stripe webhooks)
router.post('/webhook', async (req, res, next) => {
  try {
    // TODO: Verify Stripe signature
    // TODO: Handle different webhook events
    
    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;

