const express = require('express');
const router = express.Router();
const documentController = require('./document.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const tenantContextMiddleware = require('../../middlewares/tenantContext.middleware');

router.use(authenticate);
router.use(tenantContextMiddleware);

router.get('/', documentController.getDocuments);
router.post('/', documentController.uploadDocument);
router.delete('/:id', documentController.deleteDocument);

module.exports = router;
