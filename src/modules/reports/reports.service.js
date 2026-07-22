const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Transaction = require('../finance/transaction.model');
const Budget = require('../budget/budget.model');
const Committee = require('../committee/committee.model');
const CommitteeMember = require('../committee/committeeMember.model');
const OrganizationMember = require('../auth/organizationMember.model');
const Organization = require('../auth/organization.model');

class ReportsService {
  static async getIncomeData(organizationId, { startDate, endDate }) {
    const query = {
      organization_id: organizationId,
      type: 'INCOME',
      status: 'APPROVED',
      is_deleted: false
    };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    let totalAmount = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      totalAmount += t.amount;
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    return {
      title: 'Income Financial Report',
      total_amount: totalAmount,
      transaction_count: transactions.length,
      category_breakdown: categoryBreakdown,
      transactions
    };
  }

  static async getExpenseData(organizationId, { startDate, endDate }) {
    const query = {
      organization_id: organizationId,
      type: 'EXPENSE',
      status: 'APPROVED',
      is_deleted: false
    };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    let totalAmount = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      totalAmount += t.amount;
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    return {
      title: 'Expense Financial Report',
      total_amount: totalAmount,
      transaction_count: transactions.length,
      category_breakdown: categoryBreakdown,
      transactions
    };
  }

  static async getBudgetData(organizationId, { fiscal_year }) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (fiscal_year) query.fiscal_year = fiscal_year;

    const budgets = await Budget.find(query).sort({ created_at: -1 });
    const approvedExpenses = await Transaction.find({
      organization_id: organizationId,
      type: 'EXPENSE',
      status: 'APPROVED',
      is_deleted: false
    });

    const utilizationMap = {};
    approvedExpenses.forEach(exp => {
      const key = exp.category.toLowerCase();
      utilizationMap[key] = (utilizationMap[key] || 0) + exp.amount;
    });

    let totalAllocated = 0;
    let totalUtilized = 0;

    const docs = budgets.map(b => {
      const utilized = utilizationMap[b.department_name.toLowerCase()] || 0;
      if (b.status === 'APPROVED') {
        totalAllocated += b.allocated_amount;
        totalUtilized += utilized;
      }
      return {
        ...b.toObject(),
        utilized_amount: utilized,
        remaining_balance: b.allocated_amount - utilized
      };
    });

    return {
      title: 'Budget Allocation & Utilization Report',
      total_allocated: totalAllocated,
      total_utilized: totalUtilized,
      total_remaining: totalAllocated - totalUtilized,
      budgets: docs
    };
  }

  static async getCommitteeData(organizationId) {
    const committees = await Committee.find({
      organization_id: organizationId,
      is_deleted: false
    }).populate('parent_committee_id', 'name');

    const committeeIds = committees.map(c => c._id);
    const members = await CommitteeMember.find({
      committee_id: { $in: committeeIds },
      status: 'ACTIVE'
    }).populate('user_id', 'first_name last_name email');

    const memberMap = {};
    members.forEach(m => {
      const key = m.committee_id.toString();
      if (!memberMap[key]) memberMap[key] = [];
      memberMap[key].push(m);
    });

    const reportDocs = committees.map(c => ({
      ...c.toObject(),
      active_members: memberMap[c._id.toString()] || []
    }));

    return {
      title: 'Committee & Leadership Directory Report',
      total_committees: committees.length,
      committees: reportDocs
    };
  }

  static async getMemberData(organizationId, { status }) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;

    const members = await OrganizationMember.find(query)
      .populate('user_id', 'first_name last_name email avatar_url')
      .populate('role_id', 'name')
      .sort({ created_at: -1 });

    return {
      title: 'Member Roster & Demographics Report',
      total_members: members.length,
      members
    };
  }

  static async getAttendanceData(organizationId) {
    // Dummy attendance stats structure ready for Event/Meeting module integration
    return {
      title: 'Event & Meeting Attendance Report',
      total_events: 12,
      total_checkins: 450,
      average_attendance_rate: '87.5%'
    };
  }

  static async exportPDF(organizationId, type, filters, res) {
    const organization = await Organization.findById(organizationId);
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=report_${type}_${Date.now()}.pdf`);

    doc.pipe(res);

    // PDF Header
    doc.fillColor('#4F46E5').fontSize(20).font('Helvetica-Bold').text(organization?.name || 'SaaS Organization', 40, 40);
    doc.fillColor('#64748B').fontSize(12).font('Helvetica').text(`${type.toUpperCase()} REPORT`, 40, 65);
    doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(40, 85).lineTo(550, 85).stroke();

    doc.fontSize(10).fillColor('#0F172A').font('Helvetica').text(`Generated Date: ${new Date().toLocaleString()}`, 40, 100);

    if (type === 'INCOME' || type === 'EXPENSE') {
      const data = type === 'INCOME' ? await this.getIncomeData(organizationId, filters) : await this.getExpenseData(organizationId, filters);
      doc.fontSize(14).font('Helvetica-Bold').text(`Total ${type}: $${data.total_amount.toFixed(2)} USD`, 40, 125);
      doc.fontSize(10).font('Helvetica-Bold').text('Date          Category                Amount      Party Name', 40, 155);
      doc.strokeColor('#CBD5E1').moveTo(40, 168).lineTo(550, 168).stroke();

      let y = 175;
      data.transactions.slice(0, 25).forEach(t => {
        doc.font('Helvetica').fontSize(9).text(
          `${new Date(t.date).toLocaleDateString()}   ${t.category.padEnd(18)}   $${t.amount.toFixed(2).padEnd(10)}   ${t.party_name || '-'}`,
          40, y
        );
        y += 18;
      });
    } else if (type === 'BUDGET') {
      const data = await this.getBudgetData(organizationId, filters);
      doc.fontSize(12).font('Helvetica-Bold').text(`Total Budget: $${data.total_allocated.toFixed(2)} | Utilized: $${data.total_utilized.toFixed(2)} | Remaining: $${data.total_remaining.toFixed(2)}`, 40, 125);
      let y = 160;
      data.budgets.forEach(b => {
        doc.fontSize(10).font('Helvetica-Bold').text(`${b.department_name} (${b.fiscal_year})`, 40, y);
        doc.fontSize(9).font('Helvetica').text(`Allocated: $${b.allocated_amount.toFixed(2)} | Utilized: $${b.utilized_amount.toFixed(2)} | Remaining: $${b.remaining_balance.toFixed(2)}`, 40, y + 14);
        y += 35;
      });
    } else {
      doc.fontSize(12).font('Helvetica').text(`Report generation completed for ${type}.`, 40, 130);
    }

    doc.end();
  }

  static async exportExcel(organizationId, type, filters, res) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`${type} Report`);

    if (type === 'INCOME' || type === 'EXPENSE') {
      const data = type === 'INCOME' ? await this.getIncomeData(organizationId, filters) : await this.getExpenseData(organizationId, filters);
      worksheet.columns = [
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Category', key: 'category', width: 20 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Party Name', key: 'party', width: 20 }
      ];
      data.transactions.forEach(t => {
        worksheet.addRow({
          date: new Date(t.date).toLocaleDateString(),
          title: t.title,
          category: t.category,
          method: t.payment_method,
          amount: t.amount,
          party: t.party_name
        });
      });
    } else if (type === 'BUDGET') {
      const data = await this.getBudgetData(organizationId, filters);
      worksheet.columns = [
        { header: 'Fiscal Year', key: 'fy', width: 12 },
        { header: 'Department Name', key: 'dept', width: 25 },
        { header: 'Allocated Amount', key: 'allocated', width: 18 },
        { header: 'Utilized Amount', key: 'utilized', width: 18 },
        { header: 'Remaining Balance', key: 'remaining', width: 18 }
      ];
      data.budgets.forEach(b => {
        worksheet.addRow({
          fy: b.fiscal_year,
          dept: b.department_name,
          allocated: b.allocated_amount,
          utilized: b.utilized_amount,
          remaining: b.remaining_balance
        });
      });
    } else {
      worksheet.addRow(['Report Type', type]);
    }

    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=report_${type}_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  }
}

module.exports = ReportsService;
