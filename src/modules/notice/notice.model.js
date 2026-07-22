const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['GENERAL', 'EMERGENCY', 'FINANCIAL', 'EVENT', 'ELECTION', 'NOTICE'],
      default: 'GENERAL'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM'
    },
    attachment_url: {
      type: String,
      default: ''
    },
    broadcast_channels: [{
      type: String,
      enum: ['EMAIL', 'WHATSAPP', 'SMS', 'APP_NOTIFICATION']
    }],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    published_at: {
      type: Date,
      default: Date.now
    },
    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Notice', noticeSchema);
