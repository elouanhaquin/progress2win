import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { escape } from 'html-escaper';

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = process.env.MAILGUN_API_KEY ? mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
  url: 'https://api.mailgun.net'
}) : null;

const MAILGUN_DOMAIN = 'sandboxe620164f1e9441808823e31cf44f06ca.mailgun.org';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!mg) {
    console.error('Mailgun API key not configured');
    throw new Error('Service de mail non configuré');
  }

  try {
    const data = await mg.messages.create(MAILGUN_DOMAIN, {
      from: `Progress2Win <postmaster@${MAILGUN_DOMAIN}>`,
      to: [options.to],
      subject: options.subject,
      text: options.text,
      html: options.html || options.text,
    });

    console.log('✅ Email sent successfully:', data);
  } catch (error: any) {
    console.error('❌ Mailgun error:', error);
    throw new Error('Échec de l\'envoi de l\'email');
  }
};

export const generateTemporaryPassword = (): string => {
  // Génère un mot de passe temporaire sécurisé de 12 caractères
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

export const sendPasswordResetEmail = async (
  email: string,
  firstName: string,
  temporaryPassword: string
): Promise<void> => {
  // Escape user input to prevent XSS
  const safeFirstName = escape(firstName);

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3b82f6; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background-color: #f7f6f3; padding: 30px; border: 2px solid #000; }
        .password-box {
          background-color: #fff;
          padding: 20px;
          border: 3px solid #000;
          margin: 20px 0;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
          font-family: 'Courier New', monospace;
        }
        .warning {
          background-color: #fef3c7;
          border: 2px solid #f59e0b;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .footer { text-align: center; margin-top: 20px; color: #737169; font-size: 14px; }
        .btn {
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🔐 Réinitialisation de mot de passe</h1>
        </div>
        <div class="content">
          <p>Bonjour ${safeFirstName},</p>

          <p>Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte <strong>Progress2Win</strong>.</p>

          <p>Voici votre mot de passe temporaire :</p>

          <div class="password-box">
            ${temporaryPassword}
          </div>

          <div class="warning">
            <strong>⚠️ Important :</strong>
            <ul style="margin: 10px 0;">
              <li>Ce mot de passe est temporaire et valide pour une seule connexion</li>
              <li>Vous devrez le changer lors de votre prochaine connexion</li>
              <li>Ne partagez jamais ce mot de passe avec qui que ce soit</li>
            </ul>
          </div>

          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe actuel restera inchangé.</p>

          <p style="margin-top: 30px;">
            Sportivement,<br>
            <strong>L'équipe Progress2Win</strong>
          </p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé par Progress2Win</p>
          <p>Application de suivi de progression fitness</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `
Bonjour ${safeFirstName},

Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Progress2Win.

Voici votre mot de passe temporaire : ${temporaryPassword}

⚠️ Important :
- Ce mot de passe est temporaire et valide pour une seule connexion
- Vous devrez le changer lors de votre prochaine connexion
- Ne partagez jamais ce mot de passe avec qui que ce soit

Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email et votre mot de passe actuel restera inchangé.

Sportivement,
L'équipe Progress2Win

---
Cet email a été envoyé par Progress2Win
Application de suivi de progression fitness
  `.trim();

  await sendEmail({
    to: email,
    subject: '🔐 Réinitialisation de votre mot de passe - Progress2Win',
    text: emailText,
    html: emailHtml,
  });
};
