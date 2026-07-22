const { z } = require('zod');

const createRoomSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    type: z.enum(['PRIVATE', 'GROUP', 'COMMITTEE']),
    target_user_id: z.string().optional(),
    committee_id: z.string().optional(),
    participants: z.array(z.string()).optional()
  })
});

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().optional(),
    message_type: z.enum(['TEXT', 'IMAGE', 'FILE', 'VOICE']).optional(),
    file_url: z.string().optional(),
    file_name: z.string().optional(),
    file_size: z.number().optional()
  })
});

module.exports = {
  createRoomSchema,
  sendMessageSchema
};
