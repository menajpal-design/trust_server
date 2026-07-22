const mongoose = require('mongoose');

const feeSettingSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true
    },
    fee_name: {
      type: String,
      default: 'Monthly Membership Fee'
    },
    amount: {
      type: Number,
      required: true,
      default: 100
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'WEEKLY', 'YEARLY', 'ONE_TIME'],
      default: 'MONTHLY'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    due_day: {
      type: Number,
      default: 10 // 10th of every month
    },
    grace_period_days: {
      type: Number,
      default: 5
    },
    late_fee_amount: {
      type: Number,
      default: 10
    },
    is_enabled: {
      type: Boolean,
      default: true
    },
    auto_receipt: {
      type: Boolean,
      default: true
    },
    auto_reminder: {
      type: Boolean,
      default: true
    },
    allow_partial_payment: {
      type: Boolean,
      default: true
    },
    allow_advance_payment: {
      type: Boolean,
      default: true
    },
    tier_pricing: [
      {
        membership_type: { type: String, required: true },
        amount: { type: Number, required: true }
      }
    ]
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('FeeSetting', feeSettingSchema);
