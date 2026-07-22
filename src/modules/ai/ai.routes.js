const express = require('express');
const AIController = require('./ai.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/financial-insights', asyncHandler(AIController.getFinancialInsights));
router.post('/draft-notice', asyncHandler(AIController.draftNotice));
router.post('/summarize-meeting', asyncHandler(AIController.summarizeMeeting));

module.exports = router;
