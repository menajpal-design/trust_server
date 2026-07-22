const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      default: ''
    },
    type: {
      type: String,
      enum: ['PRIVATE', 'GROUP', 'COMMITTEE'],
      default: 'GROUP',
      index: true
    },
    committee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
      default: null,
      index: true
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true
    }],
    last_message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage',
      default: null
    },
    last_message_at: {
      type: Date,
      default: Date.now
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

chatRoomSchema.index({ organization_id: 1, type: 1, committee_id: 1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
