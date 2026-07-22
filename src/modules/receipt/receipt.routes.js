const express = require('express');
const ReceiptController = require('./receipt.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { createReceiptSchema, emailReceiptSchema } = require('./receipt.validation');

const router = express.Router();

// Public Verification Endpoint (No Auth Needed for scanning QR codes)
router.get('/verify-public', asyncHandler(ReceiptController.verifyPublic));

// Protected Routes
router.use(authenticate);

router.get('/', asyncHandler(ReceiptController.list));
router.post('/', validate(createReceiptSchema), asyncHandler(ReceiptController.create));
router.get('/:id', asyncHandler(ReceiptController.getById));
router.get('/:id/pdf', asyncHandler(ReceiptController.downloadPDF));
router.post('/:id/email', validate(emailReceiptSchema), asyncHandler(ReceiptController.emailReceipt));

module.exports = router;
