const express = require('express');
const OrganizationController = require('./organization.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const upload = require('../../middlewares/upload.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { createOrgSchema, updateOrgSchema } = require('./organization.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(OrganizationController.listUserOrganizations));
router.post('/', validate(createOrgSchema), asyncHandler(OrganizationController.create));
router.get('/:id', asyncHandler(OrganizationController.getById));
router.put('/:id', validate(updateOrgSchema), asyncHandler(OrganizationController.update));
router.put('/:id/transparency', asyncHandler(OrganizationController.updateTransparency));
router.delete('/:id', asyncHandler(OrganizationController.delete));

const mediaUpload = upload.single('image');
router.post('/:id/media', mediaUpload, asyncHandler(OrganizationController.uploadMedia));

module.exports = router;
