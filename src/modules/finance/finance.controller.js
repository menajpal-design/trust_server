const FinanceService = require('./finance.service');
const ApiResponse = require('../../utils/apiResponse');

class FinanceController {
  static async getSummary(req, res) {
    const result = await FinanceService.getSummary(req.user.active_organization_id);
    return ApiResponse.success(res, 'Finance summary retrieved', result, 200);
  }

  static async listTransactions(req, res) {
    const result = await FinanceService.getTransactions(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Transactions retrieved', result.docs, 200, result.meta);
  }

  static async createTransaction(req, res) {
    const result = await FinanceService.createTransaction(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Transaction recorded successfully', result, 201);
  }

  static async approveTransaction(req, res) {
    const result = await FinanceService.approveTransaction(
      req.user.active_organization_id,
      req.params.id,
      req.user._id,
      req.body.status
    );
    return ApiResponse.success(res, `Transaction marked as ${req.body.status}`, result, 200);
  }

  static async deleteTransaction(req, res) {
    const result = await FinanceService.deleteTransaction(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, result.message, null, 200);
  }

  static async getCashbook(req, res) {
    const result = await FinanceService.getCashbook(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Cash book ledger generated', result, 200);
  }

  static async executeClosing(req, res) {
    const result = await FinanceService.executeClosing(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, `${req.body.period_type} closing completed`, result, 201);
  }

  static async getClosings(req, res) {
    const result = await FinanceService.getPeriodClosings(
      req.user.active_organization_id,
      req.query.period_type
    );
    return ApiResponse.success(res, 'Period closing history retrieved', result, 200);
  }
}

module.exports = FinanceController;
