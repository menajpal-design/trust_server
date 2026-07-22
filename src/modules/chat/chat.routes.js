const express = require('express');
const ChatController = require('./chat.controller');
const authenticate = require('../../middlewares/auth.middleware');
const validate = require('../../middlewares/validation.middleware');
const upload = require('../../middlewares/upload.middleware');
const asyncHandler = require('../../utils/asyncHandler');
const { createRoomSchema, sendMessageSchema } = require('./chat.validation');

const router = express.Router();

router.use(authenticate);

router.get('/rooms', asyncHandler(ChatController.listRooms));
router.post('/rooms', validate(createRoomSchema), asyncHandler(ChatController.createRoom));
router.get('/rooms/:roomId/messages', asyncHandler(ChatController.listMessages));
router.post('/rooms/:roomId/messages', validate(sendMessageSchema), asyncHandler(ChatController.postMessage));

// Media attachment upload endpoint for Images, Documents, Voice Notes
const mediaUpload = upload.single('media');
router.post('/upload-media', mediaUpload, asyncHandler(ChatController.uploadMedia));

module.exports = router;
