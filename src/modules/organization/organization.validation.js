const { z } = require('zod');

const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    slug: z.string().min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    org_code: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    contact_phone: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    settings: z.object({
      currency: z.string().optional(),
      timezone: z.string().optional(),
      date_format: z.string().optional(),
      allow_public_registration: z.boolean().optional()
    }).optional()
  })
});

const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    org_code: z.string().optional(),
    contact_email: z.string().email().optional().or(z.literal('')),
    contact_phone: z.string().optional(),
    logo_url: z.string().optional(),
    banner_url: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional()
    }).optional(),
    settings: z.object({
      currency: z.string().optional(),
      timezone: z.string().optional(),
      date_format: z.string().optional(),
      allow_public_registration: z.boolean().optional()
    }).optional()
  })
});

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema
};
