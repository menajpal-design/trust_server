const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null
    },
    token_hash: {
      type: String,
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['EMAIL_VERIFICATION', 'PASSWORD_RESET', 'REFRESH_TOKEN'],
      required: true
    },
    expires_at: {
      type: Date,
      required: true,
      expires: 0 // TTL index automatically removes expired tokens
    },
    is_revoked: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

module.exports = mongoose.model('Token', tokenSchema);
