const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
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
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['COMMITTEE_ELECTION', 'CONSTITUTION_AMENDMENT', 'BUDGET_APPROVAL', 'GENERAL_POLL'],
      default: 'COMMITTEE_ELECTION'
    },
    options: [{
      option_id: String,
      option_text: String,
      votes_count: { type: Number, default: 0 }
    }],
    voters: [{
      user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      option_id: String,
      voted_at: { type: Date, default: Date.now }
    }],
    start_date: {
      type: Date,
      default: Date.now
    },
    end_date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'CLOSED'],
      default: 'ACTIVE'
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Vote', voteSchema);
