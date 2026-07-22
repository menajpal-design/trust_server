const Organization = require('../auth/organization.model');
const OrganizationMember = require('../auth/organizationMember.model');
const Role = require('../auth/role.model');
const AuditService = require('../audit/audit.service');
const { DEFAULT_ROLE_PERMISSIONS } = require('../../constants/permissions');

class OrganizationService {
  static async createOrganization(userId, data) {
    const existingSlug = await Organization.findOne({ slug: data.slug.toLowerCase() });
    if (existingSlug) {
      const error = new Error('Organization slug is already taken');
      error.statusCode = 400;
      throw error;
    }

    if (data.org_code) {
      const existingCode = await Organization.findOne({ org_code: data.org_code.toUpperCase() });
      if (existingCode) {
        const error = new Error('Organization code is already taken');
        error.statusCode = 400;
        throw error;
      }
    }

    const organization = await Organization.create({
      ...data,
      slug: data.slug.toLowerCase(),
      org_code: data.org_code ? data.org_code.toUpperCase() : undefined
    });

    const ownerRole = await Role.create({
      organization_id: organization._id,
      name: 'ORG_OWNER',
      permissions: DEFAULT_ROLE_PERMISSIONS.ORG_OWNER,
      is_system_role: true
    });

    await Role.create({
      organization_id: organization._id,
      name: 'MEMBER',
      permissions: DEFAULT_ROLE_PERMISSIONS.MEMBER,
      is_system_role: true
    });

    await OrganizationMember.create({
      organization_id: organization._id,
      user_id: userId,
      role_id: ownerRole._id,
      status: 'ACTIVE'
    });

    return organization;
  }

  static async getOrganizationsByUser(userId) {
    const members = await OrganizationMember.find({ user_id: userId, status: 'ACTIVE' })
      .populate('organization_id')
      .populate('role_id');

    return members
      .filter(m => m.organization_id && !m.organization_id.is_deleted)
      .map(m => ({
        ...m.organization_id.toObject(),
        user_role: m.role_id ? m.role_id.name : 'MEMBER'
      }));
  }

  static async getOrganizationById(orgId) {
    const org = await Organization.findOne({ _id: orgId, is_deleted: false });
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }
    return org;
  }

  static async updateOrganization(orgId, data) {
    const org = await Organization.findOne({ _id: orgId, is_deleted: false });
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    if (data.slug && data.slug.toLowerCase() !== org.slug) {
      const existingSlug = await Organization.findOne({ slug: data.slug.toLowerCase(), _id: { $ne: orgId } });
      if (existingSlug) {
        const error = new Error('Organization slug is already taken');
        error.statusCode = 400;
        throw error;
      }
      data.slug = data.slug.toLowerCase();
    }

    if (data.org_code && data.org_code.toUpperCase() !== org.org_code) {
      const existingCode = await Organization.findOne({ org_code: data.org_code.toUpperCase(), _id: { $ne: orgId } });
      if (existingCode) {
        const error = new Error('Organization code is already taken');
        error.statusCode = 400;
        throw error;
      }
      data.org_code = data.org_code.toUpperCase();
    }

    Object.assign(org, data);
    await org.save();
    return org;
  }

  static async updateTransparencySettings(orgId, userId, transparencySettings) {
    const org = await Organization.findOne({ _id: orgId, is_deleted: false });
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    org.transparency_settings = {
      ...org.transparency_settings,
      ...transparencySettings
    };
    await org.save();

    await AuditService.logAction({
      organization_id: orgId,
      user_id: userId,
      action: 'TRANSPARENCY_SETTINGS_UPDATED',
      entity_type: 'Organization',
      entity_id: orgId.toString(),
      details: 'Updated Organization Member Transparency & Visibility Settings'
    });

    return org;
  }

  static async deleteOrganization(orgId) {
    const org = await Organization.findOne({ _id: orgId, is_deleted: false });
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    org.is_deleted = true;
    await org.save();
    return { message: 'Organization deleted successfully' };
  }

  static async updateMedia(orgId, type, file) {
    const org = await Organization.findOne({ _id: orgId, is_deleted: false });
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }

    const mime = file.mimetype;
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${mime};base64,${b64}`;

    if (type === 'logo') {
      org.logo_url = dataURI;
    } else if (type === 'banner') {
      org.banner_url = dataURI;
    }

    await org.save();
    return org;
  }
}

module.exports = OrganizationService;
