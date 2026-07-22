const mongoose = require('mongoose');

const periodClosingSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    period_type: {
      type: String,
      enum: ['DAILY', 'MONTHLY'],
      required: true,
      index: true
    },
    closing_date: {
      type: Date,
      required: true,
      index: true
    },
    opening_balance: {
      type: Number,
      required: true,
      default: 0
    },
    total_income: {
      type: Number,
      required: true,
      default: 0
    },
    total_expense: {
      type: Number,
      required: true,
      default: 0
    },
    closing_balance: {
      type: Number,
      required: true,
      default: 0
    },
    closed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

periodClosingSchema.index({ organization_id: 1, period_type: 1, closing_date: -1 });

module.exports = mongoose.model('PeriodClosing', periodClosingSchema);
