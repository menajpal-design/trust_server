const express = require('express');
const CommitteeController = require('./committee.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { createCommitteeSchema, updateCommitteeSchema, addCommitteeMemberSchema } = require('./committee.validation');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(CommitteeController.list));
router.post('/', validate(createCommitteeSchema), asyncHandler(CommitteeController.create));
router.post('/seed-bd', asyncHandler(CommitteeController.seedBD));
router.get('/:id', asyncHandler(CommitteeController.getById));
router.put('/:id', validate(updateCommitteeSchema), asyncHandler(CommitteeController.update));
router.delete('/:id', asyncHandler(CommitteeController.delete));

router.post('/:id/members', validate(addCommitteeMemberSchema), asyncHandler(CommitteeController.addMember));
router.delete('/:id/members/:memberId', asyncHandler(CommitteeController.removeMember));

module.exports = router;
