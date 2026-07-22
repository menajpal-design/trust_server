const mongoose = require('mongoose');
const geoHierarchySchema = require('../geo/geoHierarchy.model');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Organization slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    org_code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true
    },
    subdomain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    logo_url: {
      type: String,
      default: ''
    },
    banner_url: {
      type: String,
      default: ''
    },
    favicon_url: {
      type: String,
      default: ''
    },
    registration_number: {
      type: String,
      default: ''
    },
    established_date: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    contact_email: {
      type: String,
      default: ''
    },
    contact_phone: {
      type: String,
      default: ''
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postal_code: { type: String, default: '' },
      country: { type: String, default: 'Bangladesh' }
    },
    geo_location: geoHierarchySchema,
    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        date_format: 'YYYY-MM-DD',
        allow_public_registration: false,
        auto_member_id: true,
        member_approval: 'MANUAL',
        auto_receipt: true,
        bkash_merchant_id: '',
        nagad_merchant_id: '',
        enable_sms: false,
        enable_whatsapp: true,
        enable_qr_attendance: true,
        enable_gps_checkin: false,
        require_2fa: false,
        session_timeout_mins: 30,
        theme_mode: 'DARK',
        enable_ai_copilot: true,
        maintenance_mode: false
      }
    },
    transparency_settings: {
      financial: {
        show_balance: { type: Boolean, default: true },
        show_income: { type: Boolean, default: true },
        show_expenses: { type: Boolean, default: true },
        show_receipts: { type: Boolean, default: true },
        show_donations: { type: Boolean, default: true },
        show_financial_reports: { type: Boolean, default: true },
        show_budgets: { type: Boolean, default: true },
        balance_view_mode: { type: String, enum: ['TOTAL_ONLY', 'DETAILED'], default: 'DETAILED' }
      },
      activity: {
        show_committee_activity: { type: Boolean, default: true },
        show_events: { type: Boolean, default: true },
        show_meetings: { type: Boolean, default: true },
        show_notices: { type: Boolean, default: true },
        show_attendance_stats: { type: Boolean, default: true },
        show_audit_logs: { type: Boolean, default: false },
        show_action_performer: { type: Boolean, default: true }
      },
      directory: {
        show_member_profiles: { type: Boolean, default: true },
        show_committee_assignments: { type: Boolean, default: true },
        show_leadership_positions: { type: Boolean, default: true }
      },
      reports: {
        show_reports: { type: Boolean, default: true },
        allow_report_exports: { type: Boolean, default: true }
      }
    },
    subscription_status: {
      type: String,
      enum: ['ACTIVE', 'PAST_DUE', 'SUSPENDED'],
      default: 'ACTIVE'
    },
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
