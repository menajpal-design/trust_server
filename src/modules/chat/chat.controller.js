const ChatService = require('./chat.service');
const ApiResponse = require('../../utils/apiResponse');

class ChatController {
  static async listRooms(req, res) {
    const result = await ChatService.getRooms(req.user.active_organization_id, req.user._id);
    return ApiResponse.success(res, 'Chat rooms retrieved', result, 200);
  }

  static async createRoom(req, res) {
    const result = await ChatService.createRoom(req.user.active_organization_id, req.user._id, req.body);
    return ApiResponse.success(res, 'Chat room created/retrieved', result, 201);
  }

  static async listMessages(req, res) {
    const result = await ChatService.getRoomMessages(
      req.user.active_organization_id,
      req.params.roomId,
      req.query
    );
    return ApiResponse.success(res, 'Messages retrieved', result.docs, 200, result.meta);
  }

  static async postMessage(req, res) {
    const result = await ChatService.postMessage(
      req.user.active_organization_id,
      req.user._id,
      req.params.roomId,
      req.body
    );
    return ApiResponse.success(res, 'Message posted successfully', result, 201);
  }

  static async uploadMedia(req, res) {
    if (!req.file) {
      return ApiResponse.error(res, 'No media file uploaded', 400);
    }
    const result = await ChatService.uploadMedia(req.file);
    return ApiResponse.success(res, 'Media uploaded successfully', result, 200);
  }
}

module.exports = ChatController;
