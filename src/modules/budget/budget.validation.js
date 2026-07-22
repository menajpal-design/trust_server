const { z } = require('zod');

const createBudgetSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title is required'),
    fiscal_year: z.string().min(2, 'Fiscal year is required'),
    budget_type: z.enum(['DEPARTMENT', 'SECRETARY', 'CATEGORY']).optional(),
    department_name: z.string().min(2, 'Department or Secretary name is required'),
    allocated_amount: z.number().positive('Allocated amount must be greater than zero'),
    status: z.enum(['PENDING', 'APPROVED']).optional(),
    notes: z.string().optional()
  })
});

const updateBudgetSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    fiscal_year: z.string().min(2).optional(),
    budget_type: z.enum(['DEPARTMENT', 'SECRETARY', 'CATEGORY']).optional(),
    department_name: z.string().min(2).optional(),
    allocated_amount: z.number().positive().optional(),
    notes: z.string().optional()
  })
});

const approveBudgetSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'REJECTED'])
  })
});

module.exports = {
  createBudgetSchema,
  updateBudgetSchema,
  approveBudgetSchema
};
