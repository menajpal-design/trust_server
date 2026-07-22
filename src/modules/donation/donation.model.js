const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    campaign_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
      index: true
    },
    donor_name: {
      type: String,
      required: [true, 'Donor name is required'],
      trim: true
    },
    donor_email: {
      type: String,
      trim: true,
      lowercase: true
    },
    donor_phone: {
      type: String,
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Donation amount is required'],
      min: [0.01, 'Amount must be greater than zero']
    },
    payment_method: {
      type: String,
      enum: ['CASH', 'BANK_TRANSFER', 'CARD', 'MOBILE_BANKING'],
      default: 'CASH'
    },
    transaction_reference: {
      type: String,
      default: ''
    },
    receipt_no: {
      type: String,
      default: ''
    },
    is_anonymous: {
      type: Boolean,
      default: false
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

donationSchema.index({ organization_id: 1, created_at: -1 });

module.exports = mongoose.model('Donation', donationSchema);
