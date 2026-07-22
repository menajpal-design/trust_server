const AuditLog = require('./auditLog.model');

class AuditService {
  static async logAction({ organization_id, user_id, action, entity_type, entity_id, ip_address, details }) {
    return await AuditLog.create({
      organization_id,
      user_id,
      action,
      entity_type,
      entity_id,
      ip_address: ip_address || '',
      details: details || ''
    });
  }

  static async getAuditLogs(organizationId, { page = 1, limit = 50 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId };

    const totalDocs = await AuditLog.countDocuments(query);
    const docs = await AuditLog.find(query)
      .populate('user_id', 'first_name last_name email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return {
      docs,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }
}

module.exports = AuditService;
