const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    entity_type: {
      type: String,
      required: true
    },
    entity_id: {
      type: String
    },
    ip_address: {
      type: String,
      default: ''
    },
    details: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

auditLogSchema.index({ organization_id: 1, created_at: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
