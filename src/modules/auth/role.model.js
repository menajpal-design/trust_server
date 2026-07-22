const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    permissions: [{
      type: String
    }],
    is_system_role: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

roleSchema.index({ organization_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Role', roleSchema);
