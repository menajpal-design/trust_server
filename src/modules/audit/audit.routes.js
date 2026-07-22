const express = require('express');
const AuditController = require('./audit.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(AuditController.list));

module.exports = router;
