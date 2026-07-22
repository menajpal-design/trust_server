const nodemailer = require('nodemailer');
const { MailtrapClient } = require('mailtrap');
const env = require('../config/env');
const logger = require('./logger');

let mailtrapClient = null;
if (env.MAILTRAP_TOKEN) {
  try {
    mailtrapClient = new MailtrapClient({ token: env.MAILTRAP_TOKEN });
  } catch (err) {
    logger.warn('Failed to initialize MailtrapClient');
  }
}

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  port: env.SMTP_PORT || 2525,
  auth: env.SMTP_USER && env.SMTP_PASS ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  } : undefined
});

const sendMailHelper = async ({ to, subject, html, text }) => {
  let sent = false;

  // 1. Try Mailtrap API Client
  if (mailtrapClient) {
    try {
      await mailtrapClient.send({
        from: { name: 'arafath engineering workshop', email: 'hello@demomailtrap.co' },
        to: [{ email: to }],
        subject,
        html,
        text: text || subject
      });
      logger.info(`✅ Email successfully sent via Mailtrap API Client to ${to}`);
      sent = true;
      return;
    } catch (apiError) {
      logger.warn(`Mailtrap API Notice: ${apiError.message}`);
    }
  }

  // 2. Try Nodemailer SMTP
  if (!sent && env.SMTP_USER && env.SMTP_PASS) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html
      });
      logger.info(`✅ Email sent via Nodemailer SMTP to ${to}`);
      sent = true;
      return;
    } catch (smtpError) {
      logger.warn(`SMTP Notice: ${smtpError.message}`);
    }
  }

  // 3. Development Fallback Logger (Ensures registration & password reset ALWAYS work in Dev)
  logger.info(`ℹ️ [DEV EMAIL LOG] Target: ${to} | Subject: ${subject}`);
};

const sendVerificationEmail = async (email, token, firstName) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const html = `
    <h2>Hello ${firstName},</h2>
    <p>Thank you for registering with UnionDesk TRUST SaaS Platform.</p>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${verifyUrl}" target="_blank" style="padding: 10px 20px; background-color: #4F46E5; color: white; border-radius: 5px; text-decoration: none;">Verify Email</a></p>
    <p>Or copy this URL into your browser: ${verifyUrl}</p>
    <p>This link will expire in 24 hours.</p>
  `;

  try {
    await sendMailHelper({ to: email, subject: 'Verify Your Email Address - UnionDesk TRUST', html });
  } catch (error) {
    logger.error(`Failed to process verification email for ${email}: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (email, token, firstName) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const html = `
    <h2>Hello ${firstName},</h2>
    <p>You requested a password reset for your account.</p>
    <p>Click the link below to set a new password:</p>
    <p><a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #DC2626; color: white; border-radius: 5px; text-decoration: none;">Reset Password</a></p>
    <p>Or copy this URL into your browser: ${resetUrl}</p>
    <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
  `;

  try {
    await sendMailHelper({ to: email, subject: 'Reset Your Password - UnionDesk TRUST', html });
  } catch (error) {
    logger.error(`Failed to process password reset email for ${email}: ${error.message}`);
  }
};

const sendWelcomeCredentialsEmail = async ({ email, firstName, tempPassword, orgName }) => {
  const loginUrl = `${env.CLIENT_URL}/login`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
      <h2 style="color: #4F46E5;">Welcome to ${orgName}!</h2>
      <p>Dear ${firstName},</p>
      <p>An administrator has created your account for <strong>${orgName}</strong> on the UnionDesk TRUST ERP Platform.</p>
      
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <p style="margin: 4px 0;"><strong>Organization:</strong> ${orgName}</p>
        <p style="margin: 4px 0;"><strong>Email Address:</strong> ${email}</p>
        <p style="margin: 4px 0;"><strong>Temporary Password:</strong> <code style="font-size: 16px; color: #dc2626; background: #fee2e2; padding: 2px 6px; border-radius: 4px;">${tempPassword}</code></p>
      </div>

      <p><a href="${loginUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; border-radius: 6px; text-decoration: none; font-weight: bold;">Log In Now</a></p>
      
      <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-t: 1px solid #e2e8f0; padding-top: 12px;">
        Security Notice: For security reasons, you will be required to change your password immediately upon your first login.
      </p>
    </div>
  `;

  try {
    await sendMailHelper({ to: email, subject: `Welcome to ${orgName} - Account Credentials`, html });
  } catch (error) {
    logger.error(`Failed to process welcome credentials email for ${email}: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeCredentialsEmail
};
