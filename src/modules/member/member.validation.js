const { z } = require('zod');

const addMemberSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    member_code: z.string().optional(),
    role_id: z.string().optional(),
    phone: z.string().optional(),
    blood_group: z.string().optional(),
    emergency_contact: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional()
  })
});

const updateMemberSchema = z.object({
  body: z.object({
    first_name: z.string().min(2).optional(),
    last_name: z.string().min(2).optional(),
    email: z.string().email().optional(),
    member_code: z.string().optional(),
    role_id: z.string().optional(),
    phone: z.string().optional(),
    blood_group: z.string().optional(),
    emergency_contact: z.string().optional(),
    address: z.string().optional(),
    status: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED']).optional()
  })
});

module.exports = {
  addMemberSchema,
  updateMemberSchema
};
