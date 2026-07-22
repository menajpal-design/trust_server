const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['INCOME', 'EXPENSE'],
      required: [true, 'Transaction type is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0']
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'MOBILE_BANKING'],
      default: 'CASH'
    },
    reference_no: {
      type: String,
      trim: true,
      default: ''
    },
    party_name: {
      type: String,
      trim: true,
      default: ''
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationMember',
      default: null
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
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

transactionSchema.index({ organization_id: 1, is_deleted: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
