const mongoose = require('mongoose');

const memberFeeDueSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationMember',
      required: true,
      index: true
    },
    period: {
      type: String, // e.g. "2026-07"
      required: true,
      index: true
    },
    due_amount: {
      type: Number,
      required: true
    },
    paid_amount: {
      type: Number,
      default: 0
    },
    late_fee: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'ADVANCE_PAID'],
      default: 'UNPAID',
      index: true
    },
    due_date: {
      type: Date,
      required: true
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'BANK', 'BKASH', 'NAGAD', 'ROCKET', 'CARD', 'ONLINE'],
      default: 'CASH'
    },
    payment_date: {
      type: Date
    },
    receipt_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Receipt'
    },
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction'
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

memberFeeDueSchema.index({ organization_id: 1, member_id: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('MemberFeeDue', memberFeeDueSchema);
