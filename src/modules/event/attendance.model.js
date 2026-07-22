const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    event_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    ticket_code: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qr_code_data: {
      type: String,
      default: ''
    },
    check_in_status: {
      type: String,
      enum: ['REGISTERED', 'PRESENT', 'LATE', 'ABSENT'],
      default: 'REGISTERED'
    },
    checked_in_at: {
      type: Date
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

attendanceSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
