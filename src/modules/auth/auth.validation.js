const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    first_name: z.string().min(2, 'First name must be at least 2 characters'),
    last_name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    org_name: z.string().min(2, 'Organization name must be at least 2 characters'),
    org_slug: z.string().min(2, 'Organization slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    org_slug: z.string().optional()
  })
});

const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Verification token is required')
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address')
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    new_password: z.string().min(8, 'New password must be at least 8 characters')
  })
});

const switchTenantSchema = z.object({
  body: z.object({
    organization_id: z.string().min(1, 'Organization ID is required')
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  switchTenantSchema
};
