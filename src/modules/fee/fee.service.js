const FeeSetting = require('./feeSetting.model');
const MemberFeeDue = require('./memberFeeDue.model');
const OrganizationMember = require('../auth/organizationMember.model');
const Transaction = require('../finance/transaction.model');
const ReceiptService = require('../receipt/receipt.service');
const AuditService = require('../audit/audit.service');

class FeeService {
  static async getFeeSettings(organizationId) {
    let settings = await FeeSetting.findOne({ organization_id: organizationId });
    if (!settings) {
      settings = await FeeSetting.create({
        organization_id: organizationId,
        fee_name: 'Monthly Membership Fee',
        amount: 100,
        frequency: 'MONTHLY'
      });
    }
    return settings;
  }

  static async updateFeeSettings(organizationId, userId, data) {
    let settings = await FeeSetting.findOne({ organization_id: organizationId });
    if (!settings) {
      settings = new FeeSetting({ organization_id: organizationId });
    }

    Object.assign(settings, data);
    await settings.save();

    await AuditService.logAction({
      organization_id: organizationId,
      user_id: userId,
      action: 'FEE_SETTINGS_UPDATED',
      entity_type: 'FeeSetting',
      entity_id: settings._id.toString(),
      details: 'Updated Organization Fee & Due Settings'
    });

    return settings;
  }

  static async generateMonthlyDues(organizationId, targetPeriod = null) {
    const settings = await this.getFeeSettings(organizationId);
    if (!settings.is_enabled) return { generated: 0, message: 'Fee system is disabled' };

    const date = new Date();
    const period = targetPeriod || `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const dueDate = new Date(date.getFullYear(), date.getMonth(), settings.due_day);

    const members = await OrganizationMember.find({
      organization_id: organizationId,
      status: 'ACTIVE',
      is_deleted: false
    });

    let generatedCount = 0;
    for (const member of members) {
      const fp = member.fee_profile || {};

      // EXEMPTION CHECK: Never generate dues for EXEMPT or auto_generate_due: false members
      if (fp.fee_status === 'EXEMPT' || fp.auto_generate_due === false) {
        continue;
      }

      // CUSTOM FEE OVERRIDE or Fallback to Org Settings / Tier Pricing
      let feeAmount = fp.custom_fee_amount !== null && fp.custom_fee_amount !== undefined
        ? fp.custom_fee_amount
        : settings.amount;

      if (fp.custom_fee_amount === null && settings.tier_pricing && settings.tier_pricing.length > 0) {
        const tier = settings.tier_pricing.find(t => t.membership_type === member.membership_type);
        if (tier) feeAmount = tier.amount;
      }

      try {
        await MemberFeeDue.create({
          organization_id: organizationId,
          member_id: member._id,
          period,
          due_amount: feeAmount,
          paid_amount: 0,
          status: 'UNPAID',
          due_date: fp.next_due_date || dueDate
        });
        generatedCount++;
      } catch (err) {
        // Unique constraint - due already exists for this period
      }
    }

    return { generated: generatedCount, period };
  }

  static async collectFee(organizationId, collectorUserId, data) {
    const { due_id, payment_amount, payment_method, backdated_date, remarks } = data;

    const due = await MemberFeeDue.findOne({
      _id: due_id,
      organization_id: organizationId,
      is_deleted: false
    }).populate('member_id');

    if (!due) {
      const error = new Error('Fee due record not found');
      error.statusCode = 404;
      throw error;
    }

    const payAmount = parseFloat(payment_amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      const error = new Error('Invalid payment amount');
      error.statusCode = 400;
      throw error;
    }

    due.paid_amount += payAmount;
    due.payment_method = payment_method || 'CASH';
    due.payment_date = backdated_date ? new Date(backdated_date) : new Date();

    if (due.paid_amount >= due.due_amount + due.late_fee) {
      due.status = 'PAID';
    } else {
      due.status = 'PARTIALLY_PAID';
    }

    // 1. Post Approved Income Transaction
    const transaction = await Transaction.create({
      organization_id: organizationId,
      type: 'INCOME',
      category: 'MEMBERSHIP_FEE',
      amount: payAmount,
      currency: 'USD',
      description: `Membership Fee Payment (${due.period}) for Code: ${due.member_id?.member_code || ''}`,
      payment_method: due.payment_method,
      status: 'APPROVED',
      approved_by: collectorUserId,
      transaction_date: due.payment_date
    });

    due.transaction_id = transaction._id;

    // 2. Generate Receipt
    const receipt = await ReceiptService.createReceipt(organizationId, collectorUserId, {
      transaction_id: transaction._id,
      member_id: due.member_id._id,
      paid_by_name: due.member_id?.member_code || 'Member',
      amount_paid: payAmount,
      payment_method: due.payment_method,
      notes: `Membership Fee collection for period ${due.period}. ${remarks || ''}`
    });

    due.receipt_id = receipt._id;
    await due.save();

    // 3. Log Audit Record
    await AuditService.logAction({
      organization_id: organizationId,
      user_id: collectorUserId,
      action: 'FEE_COLLECTED',
      entity_type: 'MemberFeeDue',
      entity_id: due._id.toString(),
      details: `Collected $${payAmount} for period ${due.period} via ${due.payment_method}. Issued Receipt #${receipt.receipt_number}`
    });

    return { due, receipt, transaction };
  }

  static async getMemberFeeProfileSummary(organizationId, memberId) {
    const member = await OrganizationMember.findOne({
      _id: memberId,
      organization_id: organizationId,
      is_deleted: false
    }).populate('user_id', 'first_name last_name email');

    if (!member) {
      const error = new Error('Member record not found');
      error.statusCode = 404;
      throw error;
    }

    const dues = await MemberFeeDue.find({
      organization_id: organizationId,
      member_id: memberId,
      is_deleted: false
    }).populate('receipt_id').sort({ period: -1 });

    let totalPaid = 0;
    let totalOutstanding = 0;
    let currentDueAmount = 0;
    let lastPaymentDate = null;

    dues.forEach(d => {
      totalPaid += d.paid_amount;
      const rem = Math.max(0, d.due_amount + d.late_fee - d.paid_amount);
      totalOutstanding += rem;
      if (d.status !== 'PAID' && currentDueAmount === 0) {
        currentDueAmount = rem;
      }
      if (d.payment_date && (!lastPaymentDate || new Date(d.payment_date) > new Date(lastPaymentDate))) {
        lastPaymentDate = d.payment_date;
      }
    });

    return {
      member_code: member.member_code,
      fee_profile: member.fee_profile,
      summary: {
        current_due: currentDueAmount,
        total_paid: totalPaid,
        outstanding_balance: totalOutstanding,
        last_payment_date: lastPaymentDate,
        next_due_date: member.fee_profile?.next_due_date || null
      },
      payment_history: dues
    };
  }

  static async listDues(organizationId, { period, status, search, page = 1, limit = 20 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId, is_deleted: false };

    if (period) query.period = period;
    if (status) query.status = status;

    let dues = await MemberFeeDue.find(query)
      .populate({
        path: 'member_id',
        populate: { path: 'user_id', select: 'first_name last_name email' }
      })
      .populate('receipt_id')
      .sort({ created_at: -1 });

    if (search) {
      const regex = new RegExp(search, 'i');
      dues = dues.filter(d => {
        const u = d.member_id?.user_id;
        return (
          d.member_id?.member_code?.match(regex) ||
          (u && `${u.first_name} ${u.last_name}`.match(regex))
        );
      });
    }

    const totalDocs = dues.length;
    const paginated = dues.slice(skip, skip + parseInt(limit, 10));

    return {
      docs: paginated,
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }

  static async getFeeReports(organizationId) {
    const allDues = await MemberFeeDue.find({ organization_id: organizationId, is_deleted: false });

    let totalCollected = 0;
    let totalDue = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    allDues.forEach(d => {
      totalCollected += d.paid_amount;
      const remaining = Math.max(0, d.due_amount + d.late_fee - d.paid_amount);
      totalDue += remaining;
      if (d.status === 'PAID') paidCount++;
      else unpaidCount++;
    });

    const totalRecords = allDues.length;
    const collectionRate = totalRecords > 0 ? ((paidCount / totalRecords) * 100).toFixed(1) : 0;

    return {
      total_collected: totalCollected,
      total_due: totalDue,
      paid_members: paidCount,
      unpaid_members: unpaidCount,
      collection_rate: parseFloat(collectionRate)
    };
  }
}

module.exports = FeeService;
