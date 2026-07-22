const Transaction = require('./transaction.model');
const PeriodClosing = require('./periodClosing.model');

class FinanceService {
  static async getSummary(organizationId) {
    const approvedTransactions = await Transaction.find({
      organization_id: organizationId,
      status: 'APPROVED',
      is_deleted: false
    });

    let totalIncome = 0;
    let totalExpense = 0;
    let cashBalance = 0;
    let bankBalance = 0;

    approvedTransactions.forEach(t => {
      if (t.type === 'INCOME') {
        totalIncome += t.amount;
        if (t.payment_method === 'CASH') cashBalance += t.amount;
        else bankBalance += t.amount;
      } else if (t.type === 'EXPENSE') {
        totalExpense += t.amount;
        if (t.payment_method === 'CASH') cashBalance -= t.amount;
        else bankBalance -= t.amount;
      }
    });

    const pendingApprovalsCount = await Transaction.countDocuments({
      organization_id: organizationId,
      status: 'PENDING',
      is_deleted: false
    });

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      current_balance: totalIncome - totalExpense,
      cash_balance: cashBalance,
      bank_balance: bankBalance,
      pending_approvals_count: pendingApprovalsCount
    };
  }

  static async getTransactions(organizationId, { type, category, status, startDate, endDate, page = 1, limit = 20 }) {
    const query = { organization_id: organizationId, is_deleted: false };

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const totalDocs = await Transaction.countDocuments(query);

    const docs = await Transaction.find(query)
      .populate('created_by', 'first_name last_name email')
      .populate('approved_by', 'first_name last_name')
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'first_name last_name' }
      })
      .sort({ date: -1 })
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

  static async createTransaction(organizationId, userId, data) {
    const transaction = await Transaction.create({
      ...data,
      organization_id: organizationId,
      created_by: userId,
      status: data.status || 'APPROVED',
      approved_by: data.status === 'APPROVED' ? userId : null,
      approved_at: data.status === 'APPROVED' ? new Date() : null
    });

    return await Transaction.findById(transaction._id)
      .populate('created_by', 'first_name last_name email');
  }

  static async approveTransaction(organizationId, transactionId, userId, status) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    transaction.status = status;
    transaction.approved_by = userId;
    transaction.approved_at = new Date();
    await transaction.save();

    return await Transaction.findById(transaction._id)
      .populate('created_by', 'first_name last_name')
      .populate('approved_by', 'first_name last_name');
  }

  static async deleteTransaction(organizationId, transactionId) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      organization_id: organizationId,
      is_deleted: false
    });

    if (!transaction) {
      const error = new Error('Transaction not found');
      error.statusCode = 404;
      throw error;
    }

    transaction.is_deleted = true;
    await transaction.save();
    return { message: 'Transaction deleted successfully' };
  }

  static async getCashbook(organizationId, { startDate, endDate }) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);

    // Calculate Opening Balance prior to startDate
    let openingBalance = 0;
    if (startDate) {
      const priorTransactions = await Transaction.find({
        organization_id: organizationId,
        status: 'APPROVED',
        is_deleted: false,
        date: { $lt: new Date(startDate) }
      });
      priorTransactions.forEach(t => {
        if (t.type === 'INCOME') openingBalance += t.amount;
        else if (t.type === 'EXPENSE') openingBalance -= t.amount;
      });
    }

    const query = {
      organization_id: organizationId,
      status: 'APPROVED',
      is_deleted: false
    };
    if (startDate || endDate) query.date = dateQuery;

    const transactions = await Transaction.find(query)
      .sort({ date: 1 })
      .populate('created_by', 'first_name last_name');

    let runningBalance = openingBalance;
    let totalInflow = 0;
    let totalOutflow = 0;

    const entries = transactions.map(t => {
      const inflow = t.type === 'INCOME' ? t.amount : 0;
      const outflow = t.type === 'EXPENSE' ? t.amount : 0;
      totalInflow += inflow;
      totalOutflow += outflow;
      runningBalance += (inflow - outflow);

      return {
        _id: t._id,
        date: t.date,
        title: t.title,
        category: t.category,
        payment_method: t.payment_method,
        reference_no: t.reference_no,
        inflow,
        outflow,
        balance: runningBalance
      };
    });

    return {
      opening_balance: openingBalance,
      total_inflow: totalInflow,
      total_outflow: totalOutflow,
      closing_balance: runningBalance,
      entries
    };
  }

  static async executeClosing(organizationId, userId, { period_type, closing_date, notes }) {
    const targetDate = closing_date ? new Date(closing_date) : new Date();

    // Check if closing already exists for target date/month
    const existing = await PeriodClosing.findOne({
      organization_id: organizationId,
      period_type,
      closing_date: targetDate
    });

    if (existing) {
      const error = new Error(`${period_type} closing already executed for this date`);
      error.statusCode = 400;
      throw error;
    }

    // Get Cashbook summary for period
    const cashbook = await this.getCashbook(organizationId, { endDate: targetDate });

    const closingLog = await PeriodClosing.create({
      organization_id: organizationId,
      period_type,
      closing_date: targetDate,
      opening_balance: cashbook.opening_balance,
      total_income: cashbook.total_inflow,
      total_expense: cashbook.total_outflow,
      closing_balance: cashbook.closing_balance,
      closed_by: userId,
      notes: notes || ''
    });

    return await PeriodClosing.findById(closingLog._id).populate('closed_by', 'first_name last_name');
  }

  static async getPeriodClosings(organizationId, period_type) {
    const query = { organization_id: organizationId };
    if (period_type) query.period_type = period_type;

    return await PeriodClosing.find(query)
      .populate('closed_by', 'first_name last_name email')
      .sort({ closing_date: -1 });
  }
}

module.exports = FinanceService;
