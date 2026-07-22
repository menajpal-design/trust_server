const { verifyAccessToken } = require('../../utils/jwt');
const ChatMessage = require('./chatMessage.model');
const ChatRoom = require('./chatRoom.model');
const logger = require('../../utils/logger');

// Online users map: org_id -> set of user_ids
const onlineUsers = new Map();

const initChatSockets = (io) => {
  // Middleware for JWT Handshake verification
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.user = {
        _id: decoded.sub,
        org_id: decoded.org_id
      };
      next();
    } catch (err) {
      next(new Error('Unauthorized socket connection'));
    }
  });

  io.on('connection', (socket) => {
    const { _id: userId, org_id: orgId } = socket.user;
    logger.info(`Socket Connected: User ${userId} in Org ${orgId}`);

    // Register user in online map
    if (!onlineUsers.has(orgId)) {
      onlineUsers.set(orgId, new Set());
    }
    onlineUsers.get(orgId).add(userId);

    // Broadcast updated online users to organization room
    io.to(`org:${orgId}`).emit('online_users', Array.from(onlineUsers.get(orgId)));

    // Join tenant global room
    socket.join(`org:${orgId}`);

    // Event: Join Room
    socket.on('join_room', (roomId) => {
      socket.join(`room:${roomId}`);
      logger.info(`User ${userId} joined room ${roomId}`);
    });

    // Event: Leave Room
    socket.on('leave_room', (roomId) => {
      socket.leave(`room:${roomId}`);
    });

    // Event: Send Message
    socket.on('send_message', async (data, callback) => {
      try {
        const { room_id, content, message_type = 'TEXT', file_url, file_name, file_size } = data;

        const message = await ChatMessage.create({
          organization_id: orgId,
          room_id,
          sender_id: userId,
          content,
          message_type,
          file_url,
          file_name,
          file_size,
          seen_by: [{ user_id: userId, seen_at: new Date() }]
        });

        await ChatRoom.findByIdAndUpdate(room_id, {
          last_message: message._id,
          last_message_at: new Date()
        });

        const populatedMsg = await ChatMessage.findById(message._id)
          .populate('sender_id', 'first_name last_name avatar_url email');

        // Broadcast to room
        io.to(`room:${room_id}`).emit('new_message', populatedMsg);

        if (callback) callback({ success: true, message: populatedMsg });
      } catch (error) {
        logger.error(`Error sending socket message: ${error.message}`);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // Event: Typing Start / Stop
    socket.on('typing_start', ({ room_id, user_name }) => {
      socket.to(`room:${room_id}`).emit('typing_start', { room_id, user_id: userId, user_name });
    });

    socket.on('typing_stop', ({ room_id }) => {
      socket.to(`room:${room_id}`).emit('typing_stop', { room_id, user_id: userId });
    });

    // Event: Mark Seen
    socket.on('mark_seen', async ({ room_id }) => {
      try {
        await ChatMessage.updateMany(
          { room_id, 'seen_by.user_id': { $ne: userId } },
          { $push: { seen_by: { user_id: userId, seen_at: new Date() } } }
        );

        io.to(`room:${room_id}`).emit('messages_seen', { room_id, user_id: userId, seen_at: new Date() });
      } catch (err) {
        logger.error(`Error marking seen: ${err.message}`);
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (onlineUsers.has(orgId)) {
        onlineUsers.get(orgId).delete(userId);
        io.to(`org:${orgId}`).emit('online_users', Array.from(onlineUsers.get(orgId)));
      }
      logger.info(`Socket Disconnected: User ${userId}`);
    });
  });
};

module.exports = initChatSockets;
