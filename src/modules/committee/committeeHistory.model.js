const mongoose = require('mongoose');

const committeeHistorySchema = new mongoose.Schema(
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
    term_name: {
      type: String,
      required: true,
      trim: true
    },
    start_date: {
      type: Date
    },
    end_date: {
      type: Date
    },
    members_snapshot: [
      {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        user_name: String,
        user_email: String,
        position_title: String,
        position_order: Number,
        start_date: Date,
        end_date: Date,
        status: String
      }
    ],
    notes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

committeeHistorySchema.index({ committee_id: 1, created_at: -1 });

module.exports = mongoose.model('CommitteeHistory', committeeHistorySchema);
