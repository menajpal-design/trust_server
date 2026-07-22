const { z } = require('zod');

const createReceiptSchema = z.object({
  body: z.object({
    payer_name: z.string().min(2, 'Payer name is required'),
    payer_email: z.string().email().optional().or(z.literal('')),
    amount: z.number().positive('Amount must be greater than zero'),
    payment_method: z.enum(['CASH', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'MOBILE_BANKING']).optional(),
    description: z.string().min(2, 'Description is required'),
    transaction_id: z.string().optional().nullable(),
    member_id: z.string().optional().nullable()
  })
});

const emailReceiptSchema = z.object({
  body: z.object({
    target_email: z.string().email('Invalid email address')
  })
});

module.exports = {
  createReceiptSchema,
  emailReceiptSchema
};
