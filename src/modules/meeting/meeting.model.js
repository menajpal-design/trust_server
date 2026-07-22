const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
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
    meeting_type: {
      type: String,
      enum: ['EXECUTIVE', 'GENERAL', 'COMMITTEE', 'EMERGENCY'],
      default: 'GENERAL'
    },
    agenda: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Main Office'
    },
    scheduled_at: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    resolutions: [{
      title: String,
      description: String,
      approved_by: String,
      created_at: { type: Date, default: Date.now }
    }],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Meeting', meetingSchema);
