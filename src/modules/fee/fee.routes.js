const express = require('express');
const FeeController = require('./fee.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/settings', asyncHandler(FeeController.getSettings));
router.put('/settings', asyncHandler(FeeController.updateSettings));
router.post('/generate-dues', asyncHandler(FeeController.generateDues));
router.post('/collect', asyncHandler(FeeController.collect));
router.get('/member-profile/:memberId', asyncHandler(FeeController.getMemberProfile));
router.get('/dues', asyncHandler(FeeController.listDues));
router.get('/reports', asyncHandler(FeeController.getReports));

module.exports = router;
