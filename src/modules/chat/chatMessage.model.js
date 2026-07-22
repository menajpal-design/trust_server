const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    room_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      default: ''
    },
    message_type: {
      type: String,
      enum: ['TEXT', 'IMAGE', 'FILE', 'VOICE'],
      default: 'TEXT'
    },
    file_url: {
      type: String,
      default: ''
    },
    file_name: {
      type: String,
      default: ''
    },
    file_size: {
      type: Number,
      default: 0
    },
    seen_by: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        seen_at: { type: Date, default: Date.now }
      }
    ],
    is_deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

chatMessageSchema.index({ room_id: 1, created_at: -1 });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
