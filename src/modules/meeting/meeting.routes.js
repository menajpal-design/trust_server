const express = require('express');
const router = express.Router();
const meetingController = require('./meeting.controller');
const { authenticate } = require('../../middlewares/auth.middleware');
const tenantContextMiddleware = require('../../middlewares/tenantContext.middleware');

router.use(authenticate);
router.use(tenantContextMiddleware);

router.get('/', meetingController.getMeetings);
router.post('/', meetingController.createMeeting);
router.post('/:id/resolution', meetingController.addResolution);

router.get('/votes', meetingController.getVotes);
router.post('/votes', meetingController.createVote);
router.post('/votes/:id/cast', meetingController.castVote);

module.exports = router;
