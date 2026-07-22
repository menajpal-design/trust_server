const express = require('express');
const MemberController = require('./member.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const upload = require('../../middlewares/upload.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { createMemberSchema, updateMemberSchema } = require('./member.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(MemberController.list));
router.post('/', validate(createMemberSchema), asyncHandler(MemberController.create));
router.get('/export', asyncHandler(MemberController.exportExcel));
router.post('/import', upload.single('file'), asyncHandler(MemberController.importExcel));
router.get('/:id', asyncHandler(MemberController.getById));
router.put('/:id', validate(updateMemberSchema), asyncHandler(MemberController.update));
router.get('/:id/history', asyncHandler(MemberController.getHistory));
router.delete('/:id', asyncHandler(MemberController.delete));

module.exports = router;
