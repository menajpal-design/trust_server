const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Budget title is required'],
      trim: true
    },
    fiscal_year: {
      type: String,
      required: [true, 'Fiscal year is required'],
      trim: true,
      index: true
    },
    budget_type: {
      type: String,
      enum: ['DEPARTMENT', 'SECRETARY', 'CATEGORY'],
      default: 'DEPARTMENT',
      index: true
    },
    department_name: {
      type: String,
      required: [true, 'Department or Secretary name is required'],
      trim: true
    },
    allocated_amount: {
      type: Number,
      required: [true, 'Allocated amount is required'],
      min: [0.01, 'Allocated amount must be greater than zero']
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'APPROVED',
      index: true
    },
    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approved_at: {
      type: Date
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    notes: {
      type: String,
      default: ''
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

budgetSchema.index({ organization_id: 1, fiscal_year: 1, is_deleted: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
