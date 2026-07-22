const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: env.SMTP_USER && env.SMTP_PASS ? {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS
  } : undefined
});

const sendVerificationEmail = async (email, token, firstName) => {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;
  const message = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email Address - SaaS Org Platform',
    html: `
      <h2>Hello ${firstName},</h2>
      <p>Thank you for registering with our SaaS Organization Platform.</p>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verifyUrl}" target="_blank" style="padding: 10px 20px; background-color: #4F46E5; color: white; border-radius: 5px; text-decoration: none;">Verify Email</a></p>
      <p>Or copy this URL into your browser: ${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
    `
  };

  try {
    await transporter.sendMail(message);
    logger.info(`Verification email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (email, token, firstName) => {
  const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;
  const message = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Reset Your Password - SaaS Org Platform',
    html: `
      <h2>Hello ${firstName},</h2>
      <p>You requested a password reset for your account.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #DC2626; color: white; border-radius: 5px; text-decoration: none;">Reset Password</a></p>
      <p>Or copy this URL into your browser: ${resetUrl}</p>
      <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(message);
    logger.info(`Password reset email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}: ${error.message}`);
  }
};

const sendWelcomeCredentialsEmail = async ({ email, firstName, tempPassword, orgName }) => {
  const loginUrl = `${env.CLIENT_URL}/login`;
  const message = {
    from: env.EMAIL_FROM,
    to: email,
    subject: `Welcome to ${orgName} - Account Credentials`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
        <h2 style="color: #4F46E5;">Welcome to ${orgName}!</h2>
        <p>Dear ${firstName},</p>
        <p>An administrator has created your account for <strong>${orgName}</strong> on the SaaS Organization ERP Platform.</p>
        
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
    `
  };

  try {
    await transporter.sendMail(message);
    logger.info(`Welcome credentials email sent to ${email}`);
  } catch (error) {
    logger.error(`Failed to send welcome credentials email to ${email}: ${error.message}`);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeCredentialsEmail
};
