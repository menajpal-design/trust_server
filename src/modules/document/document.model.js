const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['CONSTITUTION', 'AUDIT_REPORT', 'MEETING_RESOLUTION', 'OFFICE_REGISTRATION', 'POLICY_CERTIFICATE', 'OTHER'],
      default: 'CONSTITUTION'
    },
    file_url: {
      type: String,
      required: true
    },
    file_type: {
      type: String,
      default: 'PDF'
    },
    file_size: {
      type: String,
      default: '1.2 MB'
    },
    is_public: {
      type: Boolean,
      default: true
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

module.exports = mongoose.model('Document', documentSchema);
