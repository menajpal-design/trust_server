const Budget = require('./budget.model');
const BudgetHistory = require('./budgetHistory.model');
const Transaction = require('../finance/transaction.model');

class BudgetService {
  static async createBudget(organizationId, userId, data) {
    const budget = await Budget.create({
      ...data,
      organization_id: organizationId,
      created_by: userId,
      status: data.status || 'APPROVED',
      approved_by: data.status === 'APPROVED' ? userId : null,
      approved_at: data.status === 'APPROVED' ? new Date() : null
    });

    // Log initial history record
    await BudgetHistory.create({
      organization_id: organizationId,
      budget_id: budget._id,
      action: 'INITIAL_ALLOCATION',
      old_amount: 0,
      new_amount: budget.allocated_amount,
      notes: `Initial budget allocation created for ${budget.department_name}`,
      modified_by: userId
    });

    return budget;
  }

  static async getBudgets(organizationId, { fiscal_year, budget_type, status }) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (fiscal_year) query.fiscal_year = fiscal_year;
    if (budget_type) query.budget_type = budget_type;
    if (status) query.status = status;

    const budgets = await Budget.find(query)
      .populate('created_by', 'first_name last_name email')
      .populate('approved_by', 'first_name last_name')
      .sort({ created_at: -1 });

    // Fetch all approved EXPENSE transactions for the organization to compute real-time utilization
    const approvedExpenses = await Transaction.find({
      organization_id: organizationId,
      type: 'EXPENSE',
      status: 'APPROVED',
      is_deleted: false
    });

    // Map utilization per department / category name
    const utilizationMap = {};
    approvedExpenses.forEach(exp => {
      const key = exp.category.toLowerCase();
      utilizationMap[key] = (utilizationMap[key] || 0) + exp.amount;
    });

    let totalAllocated = 0;
    let totalUtilized = 0;

    const docs = budgets.map(b => {
      const key = b.department_name.toLowerCase();
      const utilized = utilizationMap[key] || 0;
      const remaining = b.allocated_amount - utilized;
      const percentage = b.allocated_amount > 0 ? (utilized / b.allocated_amount) * 100 : 0;

      if (b.status === 'APPROVED') {
        totalAllocated += b.allocated_amount;
        totalUtilized += utilized;
      }

      return {
        ...b.toObject(),
        utilized_amount: utilized,
        remaining_balance: remaining,
        utilization_percentage: Math.min(percentage, 100).toFixed(1)
      };
    });

    return {
      summary: {
        total_allocated: totalAllocated,
        total_utilized: totalUtilized,
        total_remaining: totalAllocated - totalUtilized,
        overall_utilization_pct: totalAllocated > 0 ? ((totalUtilized / totalAllocated) * 100).toFixed(1) : '0.0'
      },
      docs
    };
  }

  static async getBudgetById(organizationId, budgetId) {
    const budget = await Budget.findOne({
      _id: budgetId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('created_by', 'first_name last_name email');

    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = 404;
      throw error;
    }

    const history = await BudgetHistory.find({ budget_id: budgetId })
      .populate('modified_by', 'first_name last_name')
      .sort({ created_at: -1 });

    return {
      budget,
      history
    };
  }

  static async updateBudget(organizationId, budgetId, userId, data) {
    const budget = await Budget.findOne({
      _id: budgetId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = 404;
      throw error;
    }

    const oldAmount = budget.allocated_amount;
    Object.assign(budget, data);
    await budget.save();

    if (data.allocated_amount !== undefined && data.allocated_amount !== oldAmount) {
      await BudgetHistory.create({
        organization_id: organizationId,
        budget_id: budgetId,
        action: 'ALLOCATION_REVISED',
        old_amount: oldAmount,
        new_amount: data.allocated_amount,
        notes: data.notes || `Budget allocation revised from $${oldAmount} to $${data.allocated_amount}`,
        modified_by: userId
      });
    }

    return budget;
  }

  static async approveBudget(organizationId, budgetId, userId, status) {
    const budget = await Budget.findOne({
      _id: budgetId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = 404;
      throw error;
    }

    budget.status = status;
    budget.approved_by = userId;
    budget.approved_at = new Date();
    await budget.save();

    await BudgetHistory.create({
      organization_id: organizationId,
      budget_id: budgetId,
      action: `BUDGET_${status}`,
      old_amount: budget.allocated_amount,
      new_amount: budget.allocated_amount,
      notes: `Budget status marked as ${status}`,
      modified_by: userId
    });

    return budget;
  }

  static async deleteBudget(organizationId, budgetId) {
    const budget = await Budget.findOne({
      _id: budgetId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!budget) {
      const error = new Error('Budget record not found');
      error.statusCode = 404;
      throw error;
    }

    budget.is_deleted = true;
    await budget.save();
    return { message: 'Budget record deleted successfully' };
  }
}

module.exports = BudgetService;
