import express from 'express';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { query } from '../database/db.js';

const router = express.Router();

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = process.env.MAILGUN_API_KEY ? mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net'
}) : null;

const MAILGUN_DOMAIN = 'sandboxe620164f1e9441808823e31cf44f06ca.mailgun.org';

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { rating, feedback, suggestions } = req.body;

    // Get user info from database
    const userResult = await query(
      'SELECT id, email, first_name, last_name FROM users WHERE id = ?',
      [req.userId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être entre 1 et 5' });
    }

    // Check if Mailgun is configured
    if (!mg) {
      console.error('Mailgun API key not configured');
      return res.status(500).json({ error: 'Service de feedback non configuré' });
    }

    // Prepare email content
    const ratingStars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e54dff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background-color: #f7f6f3; padding: 20px; border: 2px solid #000; }
          .section { margin-bottom: 20px; }
          .label { font-weight: bold; color: #171715; margin-bottom: 5px; }
          .value { background-color: white; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
          .rating { font-size: 24px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #737169; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🎯 Nouveau Feedback - Progress2Win</h1>
          </div>
          <div class="content">
            <div class="section">
              <div class="label">👤 Utilisateur</div>
              <div class="value">
                ${user.first_name} ${user.last_name} (${user.email})
              </div>
            </div>

            <div class="section">
              <div class="label">⭐ Note</div>
              <div class="rating">${ratingStars} (${rating}/5)</div>
            </div>

            ${feedback ? `
            <div class="section">
              <div class="label">💭 Avis général</div>
              <div class="value">${feedback.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}

            ${suggestions ? `
            <div class="section">
              <div class="label">💡 Suggestions de fonctionnalités</div>
              <div class="value">${suggestions.replace(/\n/g, '<br>')}</div>
            </div>
            ` : ''}

            <div class="section">
              <div class="label">📅 Date</div>
              <div class="value">${new Date().toLocaleString('fr-FR')}</div>
            </div>
          </div>
          <div class="footer">
            Feedback envoyé depuis Progress2Win
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
NOUVEAU FEEDBACK - Progress2Win
================================

Utilisateur: ${user.first_name} ${user.last_name} (${user.email})

Note: ${ratingStars} (${rating}/5)

${feedback ? `Avis général:\n${feedback}\n\n` : ''}
${suggestions ? `Suggestions:\n${suggestions}\n\n` : ''}

Date: ${new Date().toLocaleString('fr-FR')}
    `.trim();

    // Send email via Mailgun
    try {
      const data = await mg.messages.create(MAILGUN_DOMAIN, {
        from: `Mailgun Sandbox <postmaster@${MAILGUN_DOMAIN}>`,
        to: ['haquinelouan@gmail.com'],
        subject: `[Feedback ${rating}⭐] ${user.first_name} ${user.last_name}`,
        text: emailText,
        html: emailHtml,
      });

      console.log('✅ Feedback email sent:', data);

      res.json({
        success: true,
        message: 'Feedback envoyé avec succès'
      });
    } catch (emailError: any) {
      console.error('❌ Mailgun error:', emailError);

      // Log the error but don't expose details to user
      res.status(500).json({
        error: 'Erreur lors de l\'envoi du feedback',
        details: process.env.NODE_ENV === 'development' ? emailError.message : undefined
      });
    }

  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
