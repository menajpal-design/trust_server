const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    receipt_no: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      default: null
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationMember',
      default: null
    },
    payer_name: {
      type: String,
      required: [true, 'Payer name is required'],
      trim: true
    },
    payer_email: {
      type: String,
      trim: true,
      lowercase: true,
      default: ''
    },
    amount: {
      type: Number,
      required: [true, 'Receipt amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'MOBILE_BANKING'],
      default: 'CASH'
    },
    description: {
      type: String,
      required: [true, 'Receipt description is required'],
      trim: true
    },
    issue_date: {
      type: Date,
      default: Date.now
    },
    verification_token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qr_code_data: {
      type: String, // Base64 Data URI
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

receiptSchema.index({ organization_id: 1, receipt_no: 1 }, { unique: true });

module.exports = mongoose.model('Receipt', receiptSchema);
