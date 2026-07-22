const express = require('express');
const DonationController = require('./donation.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/campaigns', asyncHandler(DonationController.listCampaigns));
router.post('/campaigns', asyncHandler(DonationController.createCampaign));
router.get('/donations', asyncHandler(DonationController.listDonations));
router.post('/donations', asyncHandler(DonationController.recordDonation));

module.exports = router;
