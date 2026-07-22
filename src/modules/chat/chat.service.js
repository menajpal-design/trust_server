const ChatRoom = require('./chatRoom.model');
const ChatMessage = require('./chatMessage.model');
const Committee = require('../committee/committee.model');
const User = require('../auth/user.model');

class ChatService {
  static async getRooms(organizationId, userId) {
    let rooms = await ChatRoom.find({
      organization_id: organizationId,
      is_deleted: false,
      $or: [
        { type: 'GROUP' },
        { participants: userId }
      ]
    })
      .populate('participants', 'first_name last_name avatar_url email')
      .populate('committee_id', 'name code')
      .populate('last_message')
      .sort({ last_message_at: -1 });

    // If no general room exists, auto-create General Channel
    if (rooms.length === 0) {
      const generalRoom = await ChatRoom.create({
        organization_id: organizationId,
        name: 'General Channel',
        type: 'GROUP',
        participants: [userId]
      });
      rooms = [generalRoom];
    }

    return rooms;
  }

  static async createRoom(organizationId, userId, data) {
    if (data.type === 'PRIVATE') {
      if (!data.target_user_id) {
        const error = new Error('Target user ID required for private chat');
        error.statusCode = 400;
        throw error;
      }

      // Check if private room already exists between these 2 users
      const existing = await ChatRoom.findOne({
        organization_id: organizationId,
        type: 'PRIVATE',
        participants: { $all: [userId, data.target_user_id] }
      }).populate('participants', 'first_name last_name avatar_url email');

      if (existing) return existing;

      const targetUser = await User.findById(data.target_user_id);
      return await ChatRoom.create({
        organization_id: organizationId,
        name: targetUser ? `${targetUser.first_name} ${targetUser.last_name}` : 'Direct Message',
        type: 'PRIVATE',
        participants: [userId, data.target_user_id]
      });
    }

    if (data.type === 'COMMITTEE') {
      const committee = await Committee.findById(data.committee_id);
      if (!committee) {
        const error = new Error('Committee not found');
        error.statusCode = 404;
        throw error;
      }

      const existing = await ChatRoom.findOne({
        organization_id: organizationId,
        type: 'COMMITTEE',
        committee_id: data.committee_id
      });
      if (existing) return existing;

      return await ChatRoom.create({
        organization_id: organizationId,
        name: `${committee.name} Channel`,
        type: 'COMMITTEE',
        committee_id: data.committee_id,
        participants: [userId]
      });
    }

    // Default Group Chat
    return await ChatRoom.create({
      organization_id: organizationId,
      name: data.name || 'Group Channel',
      type: 'GROUP',
      participants: data.participants || [userId]
    });
  }

  static async getRoomMessages(organizationId, roomId, { page = 1, limit = 50 }) {
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const query = { organization_id: organizationId, room_id: roomId, is_deleted: false };

    const totalDocs = await ChatMessage.countDocuments(query);
    const docs = await ChatMessage.find(query)
      .populate('sender_id', 'first_name last_name avatar_url email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return {
      docs: docs.reverse(), // Chronological order
      meta: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalDocs,
        totalPages: Math.ceil(totalDocs / parseInt(limit, 10))
      }
    };
  }

  static async postMessage(organizationId, userId, roomId, data) {
    const message = await ChatMessage.create({
      ...data,
      organization_id: organizationId,
      room_id: roomId,
      sender_id: userId,
      seen_by: [{ user_id: userId, seen_at: new Date() }]
    });

    await ChatRoom.findByIdAndUpdate(roomId, {
      last_message: message._id,
      last_message_at: new Date()
    });

    return await ChatMessage.findById(message._id)
      .populate('sender_id', 'first_name last_name avatar_url email');
  }

  static async uploadMedia(file) {
    const mime = file.mimetype;
    const b64 = Buffer.from(file.buffer).toString('base64');
    const file_url = `data:${mime};base64,${b64}`;

    let message_type = 'FILE';
    if (mime.startsWith('image/')) message_type = 'IMAGE';
    else if (mime.startsWith('audio/')) message_type = 'VOICE';

    return {
      file_url,
      file_name: file.originalname,
      file_size: file.size,
      message_type
    };
  }
}

module.exports = ChatService;
