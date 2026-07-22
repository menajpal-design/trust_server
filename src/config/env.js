const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://trust:uo41fswuIyXihR6i@cluster0.eokx1rc.mongodb.net/saas_org_management?retryWrites=true&w=majority&appName=Cluster0',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_change_in_production_32_chars',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_change_in_production_32_chars',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MAILTRAP_TOKEN: process.env.MAILTRAP_TOKEN || '81363c9448f5c7fa6b318c2507bd6937',
  SMTP_HOST: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 2525,
  SMTP_USER: process.env.SMTP_USER || '5d47469babdeb5',
  SMTP_PASS: process.env.SMTP_PASS || '81363c9448f5c7fa6b318c2507bd6937',
  EMAIL_FROM: process.env.EMAIL_FROM || 'arafath engineering workshop <hello@demomailtrap.co>'
};
