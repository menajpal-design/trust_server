const express = require('express');
const FinanceController = require('./finance.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const {
  createTransactionSchema,
  approveTransactionSchema,
  executeClosingSchema
} = require('./finance.validation');

const router = express.Router();

router.use(authenticate);

router.get('/summary', asyncHandler(FinanceController.getSummary));
router.get('/transactions', asyncHandler(FinanceController.listTransactions));
router.post('/transactions', validate(createTransactionSchema), asyncHandler(FinanceController.createTransaction));
router.put('/transactions/:id/approve', validate(approveTransactionSchema), asyncHandler(FinanceController.approveTransaction));
router.delete('/transactions/:id', asyncHandler(FinanceController.deleteTransaction));

router.get('/cashbook', asyncHandler(FinanceController.getCashbook));

router.get('/closings', asyncHandler(FinanceController.getClosings));
router.post('/closings', validate(executeClosingSchema), asyncHandler(FinanceController.executeClosing));

module.exports = router;
