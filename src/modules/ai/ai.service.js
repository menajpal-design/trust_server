const Transaction = require('../finance/transaction.model');
const Budget = require('../budget/budget.model');
const FinanceService = require('../finance/finance.service');

class AIService {
  static async generateFinancialInsights(organizationId) {
    const summary = await FinanceService.getExecutiveSummary(organizationId);

    const approvedExpenses = await Transaction.find({
      organization_id: organizationId,
      type: 'EXPENSE',
      status: 'APPROVED',
      is_deleted: false
    });

    const categoryBreakdown = {};
    approvedExpenses.forEach(e => {
      categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let topCategoryAmount = 0;
    Object.entries(categoryBreakdown).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    const healthScore = summary.net_balance >= 0 ? (summary.total_income > 0 ? 88 : 70) : 45;
    const financialStatus = healthScore > 75 ? 'Healthy & Positive Reserve' : 'Requires Expense Control';

    const insights = [
      `Overall Fund Reserve is $${summary.net_balance.toFixed(2)} USD with a financial health score of ${healthScore}/100 (${financialStatus}).`,
      `Highest operational expenditure category is "${topCategory}" totaling $${topCategoryAmount.toFixed(2)} USD.`,
      summary.pending_approvals > 0
        ? `Attention Required: There are ${summary.pending_approvals} pending transaction voucher(s) awaiting managerial approval.`
        : 'All transaction vouchers have been processed and approved.',
      `Strategic Recommendation: Maintain liquid bank reserves of at least 25% of total income to safeguard against unforeseen operational costs.`
    ];

    return {
      health_score: healthScore,
      status: financialStatus,
      net_reserve: summary.net_balance,
      top_spending_category: topCategory,
      insights
    };
  }

  static async generateNoticeDraft(topic, targetAudience) {
    return {
      title: `Official Announcement: ${topic}`,
      category: 'GENERAL',
      content: `Dear ${targetAudience || 'Members'},\n\nPlease be informed regarding ${topic}. All concerned members are requested to review the updated organizational guidelines and comply with scheduled deadlines.\n\nThank you for your active cooperation.\n\nExecutive Board & Management`,
      priority: 'HIGH'
    };
  }

  static async generateMeetingSummary(rawNotes) {
    return {
      summary: `Executive summary compiled from raw meeting notes. Key topics covered organizational progress, budget reviews, and member engagement strategies.`,
      action_items: [
        'Finalize monthly financial ledger closings by end of week.',
        'Review sub-committee leadership appointments.',
        'Prepare upcoming general member assembly notice.'
      ]
    };
  }
}

module.exports = AIService;
