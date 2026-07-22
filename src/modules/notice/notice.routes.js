const express = require('express');
const router = express.Router();
const noticeController = require('./notice.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const tenantContextMiddleware = require('../../middlewares/tenantContext.middleware');
const { requirePermissions } = require('../../middlewares/rbac.middleware');
const { PERMISSIONS } = require('../../constants/permissions');

router.use(authenticate);
router.use(tenantContextMiddleware);

router.get('/', noticeController.getNotices);
router.post('/', requirePermissions(PERMISSIONS.NOTIFICATIONS_MANAGE), noticeController.createNotice);
router.delete('/:id', requirePermissions(PERMISSIONS.NOTIFICATIONS_MANAGE), noticeController.deleteNotice);

module.exports = router;
