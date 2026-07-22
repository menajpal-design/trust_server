const mongoose = require('mongoose');

const memberRoleHistorySchema = new mongoose.Schema(
  {
    organization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true
    },
    member_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrganizationMember',
      required: true,
      index: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    old_role_name: {
      type: String,
      default: ''
    },
    new_role_name: {
      type: String,
      required: true
    },
    old_position: {
      type: String,
      default: ''
    },
    new_position: {
      type: String,
      required: true
    },
    committee_name: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: 'Role or Position Revision'
    },
    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

memberRoleHistorySchema.index({ member_id: 1, created_at: -1 });

module.exports = mongoose.model('MemberRoleHistory', memberRoleHistorySchema);
