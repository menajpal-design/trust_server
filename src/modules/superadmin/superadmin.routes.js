const express = require('express');
const SuperAdminController = require('./superadmin.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireSuperAdmin } = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

// Enforce both Authentication AND SuperAdmin privilege
router.use(authenticate);
router.use(requireSuperAdmin);

router.get('/metrics', asyncHandler(SuperAdminController.getMetrics));
router.get('/users', asyncHandler(SuperAdminController.listUsers));
router.put('/users/:userId/role', asyncHandler(SuperAdminController.promoteUserRole));
router.put('/tenants/:id/status', asyncHandler(SuperAdminController.updateStatus));

module.exports = router;
