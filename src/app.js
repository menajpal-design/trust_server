const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const env = require('./config/env');
const tenantContextMiddleware = require('./middlewares/tenantContext.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');
const authRoutes = require('./modules/auth/auth.routes');
const organizationRoutes = require('./modules/organization/organization.routes');
const committeeRoutes = require('./modules/committee/committee.routes');
const memberRoutes = require('./modules/member/member.routes');
const financeRoutes = require('./modules/finance/finance.routes');
const receiptRoutes = require('./modules/receipt/receipt.routes');
const budgetRoutes = require('./modules/budget/budget.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const reportsRoutes = require('./modules/reports/reports.routes');
const donationRoutes = require('./modules/donation/donation.routes');
const eventRoutes = require('./modules/event/event.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const auditRoutes = require('./modules/audit/audit.routes');
const superAdminRoutes = require('./modules/superadmin/superadmin.routes');
const feeRoutes = require('./modules/fee/fee.routes');
const geoRoutes = require('./modules/geo/geo.routes');
const noticeRoutes = require('./modules/notice/notice.routes');
const meetingRoutes = require('./modules/meeting/meeting.routes');
const documentRoutes = require('./modules/document/document.routes');

const app = express();

// Trust reverse proxies (Vercel CDN / AWS ALB)
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin === env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(mongoSanitize());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  validate: { trustProxy: false },
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});
app.use('/api', limiter);

// Parsing Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Tenant Context Middleware
app.use(tenantContextMiddleware);

// API Health Check & DB Diagnosis
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  const hasUri = Boolean(process.env.MONGODB_URI);
  res.status(200).json({
    status: 'OK',
    db_status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    has_mongodb_uri_env: hasUri,
    message: isConnected ? 'UnionDesk 🇧🇩 SaaS API is running smoothly' : 'Database Disconnected: Ensure MONGODB_URI is set on Vercel and MongoDB Atlas IP Access List includes 0.0.0.0/0'
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/organizations', organizationRoutes);
app.use('/api/v1/committees', committeeRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/finance', financeRoutes);
app.use('/api/v1/receipts', receiptRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/donations', donationRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/superadmin', superAdminRoutes);
app.use('/api/v1/fees', feeRoutes);
app.use('/api/v1/geo', geoRoutes);
app.use('/api/v1/notices', noticeRoutes);
app.use('/api/v1/meetings', meetingRoutes);
app.use('/api/v1/documents', documentRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
