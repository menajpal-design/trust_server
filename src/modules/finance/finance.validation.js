const { z } = require('zod');

const createTransactionSchema = z.object({
  body: z.object({
    type: z.enum(['INCOME', 'EXPENSE']),
    title: z.string().min(2, 'Title must be at least 2 characters'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().positive('Amount must be greater than zero'),
    payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'MOBILE_BANKING']).optional(),
    reference_no: z.string().optional(),
    party_name: z.string().optional(),
    member_id: z.string().optional().nullable(),
    date: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED']).optional()
  })
});

const approveTransactionSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'])
  })
});

const executeClosingSchema = z.object({
  body: z.object({
    period_type: z.enum(['DAILY', 'MONTHLY']),
    closing_date: z.string().optional(),
    notes: z.string().optional()
  })
});

module.exports = {
  createTransactionSchema,
  approveTransactionSchema,
  executeClosingSchema
};
