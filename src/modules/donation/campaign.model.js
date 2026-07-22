const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Campaign title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Campaign description is required']
    },
    target_amount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [1, 'Target amount must be positive']
    },
    raised_amount: {
      type: Number,
      default: 0
    },
    start_date: {
      type: Date,
      default: Date.now
    },
    end_date: {
      type: Date
    },
    status: {
      type: String,
      enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'],
      default: 'ACTIVE',
      index: true
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

campaignSchema.index({ organization_id: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
