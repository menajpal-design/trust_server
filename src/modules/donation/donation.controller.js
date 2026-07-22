const DonationService = require('./donation.service');
const ApiResponse = require('../../utils/apiResponse');

class DonationController {
  static async createCampaign(req, res) {
    const result = await DonationService.createCampaign(req.user.active_organization_id, req.body);
    return ApiResponse.success(res, 'Campaign created successfully', result, 201);
  }

  static async listCampaigns(req, res) {
    const result = await DonationService.getCampaigns(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Campaigns retrieved', result, 200);
  }

  static async recordDonation(req, res) {
    const result = await DonationService.recordDonation(req.user.active_organization_id, req.body);
    return ApiResponse.success(res, 'Donation recorded successfully', result, 201);
  }

  static async listDonations(req, res) {
    const result = await DonationService.getDonations(req.user.active_organization_id, req.query);
    return ApiResponse.success(res, 'Donations retrieved', result.docs, 200, result.meta);
  }
}

module.exports = DonationController;
