const FeeService = require('./fee.service');
const ApiResponse = require('../../utils/apiResponse');

class FeeController {
  static async getSettings(req, res) {
    const result = await FeeService.getFeeSettings(req.user.active_organization_id);
    return ApiResponse.success(res, 'Fee settings retrieved', result, 200);
  }

  static async updateSettings(req, res) {
    const result = await FeeService.updateFeeSettings(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Fee settings updated', result, 200);
  }

  static async generateDues(req, res) {
    const result = await FeeService.generateMonthlyDues(
      req.user.active_organization_id,
      req.body.period
    );
    return ApiResponse.success(res, `Generated ${result.generated} dues for period ${result.period}`, result, 200);
  }

  static async collect(req, res) {
    const result = await FeeService.collectFee(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Membership fee collected successfully & receipt issued', result, 200);
  }

  static async getMemberProfile(req, res) {
    const result = await FeeService.getMemberFeeProfileSummary(
      req.user.active_organization_id,
      req.params.memberId
    );
    return ApiResponse.success(res, 'Member fee profile and history retrieved', result, 200);
  }

  static async listDues(req, res) {
    const result = await FeeService.listDues(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Member fee dues list retrieved', result.docs, 200, result.meta);
  }

  static async getReports(req, res) {
    const result = await FeeService.getFeeReports(req.user.active_organization_id);
    return ApiResponse.success(res, 'Fee collection report metrics retrieved', result, 200);
  }
}

module.exports = FeeController;
