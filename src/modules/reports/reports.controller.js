const ReportsService = require('./reports.service');
const ApiResponse = require('../../utils/apiResponse');

class ReportsController {
  static async getIncome(req, res) {
    const result = await ReportsService.getIncomeData(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Income report data retrieved', result, 200);
  }

  static async getExpense(req, res) {
    const result = await ReportsService.getExpenseData(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Expense report data retrieved', result, 200);
  }

  static async getBudget(req, res) {
    const result = await ReportsService.getBudgetData(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Budget report data retrieved', result, 200);
  }

  static async getCommittee(req, res) {
    const result = await ReportsService.getCommitteeData(req.user.active_organization_id);
    return ApiResponse.success(res, 'Committee report data retrieved', result, 200);
  }

  static async getMember(req, res) {
    const result = await ReportsService.getMemberData(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Member report data retrieved', result, 200);
  }

  static async getAttendance(req, res) {
    const result = await ReportsService.getAttendanceData(req.user.active_organization_id);
    return ApiResponse.success(res, 'Attendance report data retrieved', result, 200);
  }

  static async exportPDF(req, res) {
    await ReportsService.exportPDF(
      req.user.active_organization_id,
      req.params.type,
      req.query,
      res
    );
  }

  static async exportExcel(req, res) {
    await ReportsService.exportExcel(
      req.user.active_organization_id,
      req.params.type,
      req.query,
      res
    );
  }
}

module.exports = ReportsController;
