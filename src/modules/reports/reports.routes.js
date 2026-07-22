const express = require('express');
const ReportsController = require('./reports.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/income', asyncHandler(ReportsController.getIncome));
router.get('/expense', asyncHandler(ReportsController.getExpense));
router.get('/budget', asyncHandler(ReportsController.getBudget));
router.get('/committee', asyncHandler(ReportsController.getCommittee));
router.get('/member', asyncHandler(ReportsController.getMember));
router.get('/attendance', asyncHandler(ReportsController.getAttendance));

router.get('/export/pdf/:type', asyncHandler(ReportsController.exportPDF));
router.get('/export/excel/:type', asyncHandler(ReportsController.exportExcel));

module.exports = router;
