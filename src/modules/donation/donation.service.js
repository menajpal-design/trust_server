const Campaign = require('./campaign.model');
const Donation = require('./donation.model');
const Transaction = require('../finance/transaction.model');
const ReceiptService = require('../receipt/receipt.service');

class DonationService {
  static async createCampaign(organizationId, data) {
    return await Campaign.create({
      ...data,
      organization_id: organizationId
    });
  }

  static async getCampaigns(organizationId, { status }) {
    const query = { organization_id: organizationId, is_deleted: false };
    if (status) query.status = status;
    return await Campaign.find(query).sort({ created_at: -1 });
  }

  static async recordDonation(organizationId, data) {
    const donation = await Donation.create({
      ...data,
      organization_id: organizationId
    });

    // 1. Update Campaign raised_amount if linked
    if (data.campaign_id) {
      await Campaign.findByIdAndUpdate(data.campaign_id, {
        $inc: { raised_amount: data.amount }
      });
    }

    // 2. Auto-record Income transaction in Finance Ledger
    const transaction = await Transaction.create({
      organization_id: organizationId,
      type: 'INCOME',
      title: `Donation from ${data.is_anonymous ? 'Anonymous Donor' : data.donor_name}`,
      category: 'Donation & Grants',
      amount: data.amount,
      payment_method: data.payment_method || 'CASH',
      status: 'APPROVED',
      date: new Date()
    });

    // 3. Auto-issue Payment Receipt with QR Verification Token
    try {
      const receipt = await ReceiptService.createReceipt(organizationId, {
        payer_name: data.is_anonymous ? 'Anonymous Donor' : data.donor_name,
        payer_email: data.donor_email || '',
        amount: data.amount,
        payment_method: data.payment_method || 'CASH',
        description: `Donation Contribution - ${data.notes || 'General Support'}`,
        transaction_id: transaction._id
      });
      donation.receipt_no = receipt.receipt_no;
      await donation.save();
    } catch (e) {
      console.error('Receipt generation warning:', e.message);
    }

    return donation;
  }

  static async getDonations(organizationId, { campaign_id, page = 1, limit = 20 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId, is_deleted: false };
    if (campaign_id) query.campaign_id = campaign_id;

    const totalDocs = await Donation.countDocuments(query);
    const docs = await Donation.find(query)
      .populate('campaign_id', 'title target_amount raised_amount')
      .sort({ created_at: -1 })
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
}

module.exports = DonationService;
