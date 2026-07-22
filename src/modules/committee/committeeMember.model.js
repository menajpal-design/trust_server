const mongoose = require('mongoose');

const committeeMemberSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    committee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Committee',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    position_title: {
      type: String,
      required: [true, 'Position title is required'],
      trim: true
    },
    position_order: {
      type: Number,
      default: 99 // Lower numbers appear higher in hierarchy (1 = President, 2 = VP, etc.)
    },
    start_date: {
      type: Date,
      default: Date.now
    },
    end_date: {
      type: Date
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'RESIGNED', 'EXPIRED', 'REMOVED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

committeeMemberSchema.index({ committee_id: 1, user_id: 1, status: 1 });

module.exports = mongoose.model('CommitteeMember', committeeMemberSchema);
