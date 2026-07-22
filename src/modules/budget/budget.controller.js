const BudgetService = require('./budget.service');
const ApiResponse = require('../../utils/apiResponse');

class BudgetController {
  static async create(req, res) {
    const result = await BudgetService.createBudget(
      req.user.active_organization_id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Budget allocated successfully', result, 201);
  }

  static async list(req, res) {
    const result = await BudgetService.getBudgets(
      req.user.active_organization_id,
      req.query
    );
    return ApiResponse.success(res, 'Budgets retrieved', result.docs, 200, { summary: result.summary });
  }

  static async getById(req, res) {
    const result = await BudgetService.getBudgetById(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, 'Budget details retrieved', result, 200);
  }

  static async update(req, res) {
    const result = await BudgetService.updateBudget(
      req.user.active_organization_id,
      req.params.id,
      req.user._id,
      req.body
    );
    return ApiResponse.success(res, 'Budget updated successfully', result, 200);
  }

  static async approve(req, res) {
    const result = await BudgetService.approveBudget(
      req.user.active_organization_id,
      req.params.id,
      req.user._id,
      req.body.status
    );
    return ApiResponse.success(res, `Budget marked as ${req.body.status}`, result, 200);
  }

  static async delete(req, res) {
    const result = await BudgetService.deleteBudget(
      req.user.active_organization_id,
      req.params.id
    );
    return ApiResponse.success(res, result.message, null, 200);
  }
}

module.exports = BudgetController;
