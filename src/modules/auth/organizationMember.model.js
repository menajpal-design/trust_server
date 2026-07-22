const mongoose = require('mongoose');

const organizationMemberSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    member_code: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
      default: 'ACTIVE'
    },
    membership_type: {
      type: String,
      enum: ['GENERAL', 'LIFE_MEMBER', 'HONORARY', 'STUDENT', 'DONOR'],
      default: 'GENERAL'
    },
    committee_level: {
      type: String,
      enum: ['NONE', 'CENTRAL', 'DISTRICT', 'UPAZILA'],
      default: 'NONE'
    },
    position_title: {
      type: String,
      default: 'Member'
    },
    custom_permissions: [
      {
        type: String
      }
    ],
    // Per-Member Fee Configuration & Summary
    fee_profile: {
      custom_fee_amount: { type: Number, default: null }, // Null = Use Org Default
      fee_frequency: {
        type: String,
        enum: ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'],
        default: 'MONTHLY'
      },
      fee_start_date: { type: Date, default: Date.now },
      next_due_date: { type: Date },
      grace_period_days: { type: Number, default: 5 },
      late_fee_amount: { type: Number, default: 10 },
      late_fee_type: { type: String, enum: ['FIXED', 'PERCENTAGE'], default: 'FIXED' },
      fee_status: {
        type: String,
        enum: ['ACTIVE', 'SUSPENDED', 'EXEMPT'],
        default: 'ACTIVE'
      },
      auto_generate_due: { type: Boolean, default: true },
      auto_send_reminder: { type: Boolean, default: true },
      auto_generate_receipt: { type: Boolean, default: true }
    },
    phone: {
      type: String,
      default: ''
    },
    blood_group: {
      type: String,
      default: ''
    },
    emergency_contact: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    joined_date: {
      type: Date,
      default: Date.now
    },
    qr_code_data: {
      type: String, // Base64 Data URI
      default: ''
    },
    is_default_tenant: {
      type: Boolean,
      default: false
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

organizationMemberSchema.index({ organization_id: 1, user_id: 1 }, { unique: true });
organizationMemberSchema.index({ organization_id: 1, is_deleted: 1, status: 1 });

module.exports = mongoose.model('OrganizationMember', organizationMemberSchema);
