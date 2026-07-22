const AuditService = require('./audit.service');
const ApiResponse = require('../../utils/apiResponse');

class AuditController {
  static async list(req, res) {
    const result = await AuditService.getAuditLogs(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Audit logs retrieved', result.docs, 200, result.meta);
  }
}

module.exports = AuditController;
