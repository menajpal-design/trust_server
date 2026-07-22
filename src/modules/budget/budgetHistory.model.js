const mongoose = require('mongoose');

const budgetHistorySchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    budget_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Budget',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true
    },
    old_amount: {
      type: Number,
      default: 0
    },
    new_amount: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    modified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

budgetHistorySchema.index({ budget_id: 1, created_at: -1 });

module.exports = mongoose.model('BudgetHistory', budgetHistorySchema);
