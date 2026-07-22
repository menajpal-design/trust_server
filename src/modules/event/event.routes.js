const express = require('express');
const EventController = require('./event.controller');
const authenticate = require('../../middlewares/auth.middleware');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

router.use(authenticate);

router.get('/', asyncHandler(EventController.list));
router.post('/', asyncHandler(EventController.create));
router.post('/:id/register', asyncHandler(EventController.register));
router.post('/check-in', asyncHandler(EventController.checkIn));
router.get('/:id/attendees', asyncHandler(EventController.getAttendees));

module.exports = router;
