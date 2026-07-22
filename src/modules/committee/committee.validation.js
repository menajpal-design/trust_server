const { z } = require('zod');

const createCommitteeSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Committee name must be at least 2 characters'),
    code: z.string().optional(),
    description: z.string().optional(),
    parent_committee_id: z.string().optional().nullable(),
    term_start_date: z.string().optional(),
    term_end_date: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISSOLVED', 'ARCHIVED']).optional()
  })
});

const updateCommitteeSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    code: z.string().optional(),
    description: z.string().optional(),
    parent_committee_id: z.string().optional().nullable(),
    term_start_date: z.string().optional(),
    term_end_date: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'DISSOLVED', 'ARCHIVED']).optional()
  })
});

const assignMemberSchema = z.object({
  body: z.object({
    user_id: z.string().min(1, 'User ID is required'),
    position_title: z.string().min(1, 'Position title is required'),
    position_order: z.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional()
  })
});

const updateMemberSchema = z.object({
  body: z.object({
    position_title: z.string().optional(),
    position_order: z.number().optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    status: z.enum(['ACTIVE', 'RESIGNED', 'EXPIRED', 'REMOVED']).optional()
  })
});

const archiveTermSchema = z.object({
  body: z.object({
    term_name: z.string().min(2, 'Term name is required'),
    notes: z.string().optional(),
    new_term_start_date: z.string().optional(),
    new_term_end_date: z.string().optional()
  })
});

module.exports = {
  createCommitteeSchema,
  updateCommitteeSchema,
  assignMemberSchema,
  updateMemberSchema,
  archiveTermSchema
};
