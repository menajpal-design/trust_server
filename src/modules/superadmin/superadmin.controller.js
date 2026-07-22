const SuperAdminService = require('./superadmin.service');
const ApiResponse = require('../../utils/apiResponse');

class SuperAdminController {
  static async getMetrics(req, res) {
    const result = await SuperAdminService.getMetrics();
    return ApiResponse.success(res, 'Super Admin metrics retrieved', result, 200);
  }

  static async listUsers(req, res) {
    const result = await SuperAdminService.getUsers();
    return ApiResponse.success(res, 'All platform users retrieved', result, 200);
  }

  static async promoteUserRole(req, res) {
    const result = await SuperAdminService.promoteUserRole(
      req.params.userId,
      req.body.role,
      req.user._id
    );
    return ApiResponse.success(res, `User system role updated to ${req.body.role}`, result, 200);
  }

  static async updateStatus(req, res) {
    const result = await SuperAdminService.updateTenantStatus(req.params.id, req.body.subscription_status);
    return ApiResponse.success(res, 'Tenant subscription status updated', result, 200);
  }
}

module.exports = SuperAdminController;
