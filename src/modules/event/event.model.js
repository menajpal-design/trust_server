const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    location: {
      type: String,
      required: [true, 'Event location is required']
    },
    start_time: {
      type: Date,
      required: [true, 'Start date/time is required']
    },
    end_time: {
      type: Date,
      required: [true, 'End date/time is required']
    },
    ticket_price: {
      type: Number,
      default: 0
    },
    max_attendees: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'],
      default: 'UPCOMING',
      index: true
    },
    banner_url: {
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

eventSchema.index({ organization_id: 1, start_time: 1 });

module.exports = mongoose.model('Event', eventSchema);
