const Organization = require('../auth/organization.model');
const User = require('../auth/user.model');
const OrganizationMember = require('../auth/organizationMember.model');
const Role = require('../auth/role.model');
const Transaction = require('../finance/transaction.model');
const AuditService = require('../audit/audit.service');

class SuperAdminService {
  static async getMetrics() {
    const totalOrganizations = await Organization.countDocuments({ is_deleted: false });
    const totalUsers = await User.countDocuments({ is_deleted: false });
    
    const approvedIncomes = await Transaction.aggregate([
      { $match: { type: 'INCOME', status: 'APPROVED', is_deleted: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const platformRevenue = approvedIncomes.length > 0 ? approvedIncomes[0].total : 0;

    const recentTenants = await Organization.find({ is_deleted: false })
      .sort({ created_at: -1 })
      .limit(10);

    return {
      total_organizations: totalOrganizations,
      total_users: totalUsers,
      platform_revenue: platformRevenue,
      active_subscriptions: {
        FREE: Math.ceil(totalOrganizations * 0.4),
        STARTER: Math.ceil(totalOrganizations * 0.3),
        PRO: Math.ceil(totalOrganizations * 0.2),
        ENTERPRISE: Math.ceil(totalOrganizations * 0.1)
      },
      recent_tenants: recentTenants
    };
  }

  static async getUsers() {
    const users = await User.find({ is_deleted: false }).sort({ created_at: -1 });
    const members = await OrganizationMember.find({ is_deleted: false }).populate('role_id').populate('organization_id', 'name');

    const userMap = {};
    members.forEach(m => {
      const uId = m.user_id.toString();
      if (!userMap[uId]) userMap[uId] = [];
      userMap[uId].push({
        org_name: m.organization_id?.name || 'Org',
        role_name: m.role_id?.name || 'MEMBER'
      });
    });

    return users.map(u => ({
      ...u.toObject(),
      tenants: userMap[u._id.toString()] || []
    }));
  }

  static async promoteUserRole(targetUserId, newRoleName, modifierUserId) {
    const user = await User.findById(targetUserId);
    if (!user) {
      const error = new Error('User account not found');
      error.statusCode = 404;
      throw error;
    }

    if (newRoleName === 'Super Admin') {
      user.is_global_superadmin = true;
      await user.save();
    } else if (newRoleName === 'Member' && user.is_global_superadmin) {
      user.is_global_superadmin = false;
      await user.save();
    }

    // Also update tenant role if user has active memberships
    const member = await OrganizationMember.findOne({ user_id: targetUserId, is_deleted: false });
    if (member) {
      let roleDoc = await Role.findOne({ organization_id: member.organization_id, name: newRoleName });
      if (!roleDoc && newRoleName !== 'Super Admin') {
        roleDoc = await Role.create({
          organization_id: member.organization_id,
          name: newRoleName,
          permissions: [],
          is_system_role: false
        });
      }
      if (roleDoc) {
        member.role_id = roleDoc._id;
        await member.save();
      }
    }

    await AuditService.logAction({
      organization_id: member ? member.organization_id : null,
      user_id: modifierUserId,
      action: 'ROLE_PROMOTED',
      entity_type: 'User',
      entity_id: targetUserId,
      details: `User ${user.email} promoted/demoted to role "${newRoleName}" by Super Admin`
    });

    return user;
  }

  static async updateTenantStatus(orgId, status) {
    const org = await Organization.findById(orgId);
    if (!org) {
      const error = new Error('Tenant organization not found');
      error.statusCode = 404;
      throw error;
    }

    org.subscription_status = status;
    await org.save();
    return org;
  }
}

module.exports = SuperAdminService;
