import { z } from 'zod';

export const ServiceRequestSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters'),
  organizationName: z
    .string()
    .trim()
    .max(120, 'Organization name must not exceed 120 characters')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(25, 'Phone number is too long')
    .regex(/^[+]?[0-9\s\-().]{7,25}$/, 'Invalid phone number format'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address')
    .max(120, 'Email address must not exceed 120 characters'),
  serviceType: z.enum(
    [
      'STATIC_GUARDING',
      'EVENT_SECURITY',
      'VIP_ESCORT',
      'PATROL_SERVICES',
      'CCTV_MONITORING',
      'OTHER_SECURITY',
    ],
    { message: 'Please select an authorized security service' }
  ),
  siteAddress: z
    .string()
    .trim()
    .min(5, 'Physical site address must be at least 5 characters')
    .max(200, 'Site address cannot exceed 200 characters'),
  city: z
    .string()
    .trim()
    .min(2, 'City or locality is required')
    .max(80, 'City name is too long'),
  coordinates: z
    .string()
    .trim()
    .max(60, 'Coordinates format is invalid')
    .optional()
    .or(z.literal('')),
  guardCount: z.coerce
    .number({ message: 'Number of guards must be a valid number' })
    .int('Number of guards must be a whole number')
    .min(1, 'At least 1 security operative is required')
    .max(200, 'Maximum guard count per standard intake is 200. Contact command for enterprise battalions.'),
  coverage: z.enum(['DAY', 'NIGHT', 'TWENTY_FOUR_HOUR'], {
    message: 'Please select shift coverage pattern',
  }),
  armedPreference: z.enum(['UNARMED', 'ARMED_IF_PERMITTED'], {
    message: 'Please select guard classification preference',
  }),
  startDate: z
    .string()
    .min(1, 'Desired start date is required')
    .refine((val) => {
      const parsed = new Date(val);
      return !isNaN(parsed.getTime());
    }, 'Invalid start date format'),
  duration: z.enum(
    ['ONE_OFF', 'ONE_MONTH', 'THREE_MONTHS', 'SIX_MONTHS', 'TWELVE_MONTHS'],
    { message: 'Please select required deployment duration' }
  ),
  additionalRequirements: z
    .string()
    .trim()
    .max(1500, 'Additional requirements must be under 1500 characters')
    .optional()
    .or(z.literal('')),
  preferredContactMethod: z.enum(['PHONE', 'EMAIL', 'WHATSAPP'], {
    message: 'Please select your preferred communication channel',
  }),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the security privacy & consent terms',
  }),
  idempotencyKey: z
    .string()
    .trim()
    .max(64, 'Idempotency key max 64 characters')
    .optional(),
});

export type ServiceRequestFormData = z.infer<typeof ServiceRequestSchema>;

export const TrackRequestSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^SR-\d{4}-\d{5}$/, 'Reference number format should be SR-YYYY-XXXXX (e.g., SR-2026-00123)'),
  verificationCode: z
    .string()
    .trim()
    .min(4, 'Verification code must be at least 4 digits')
    .max(10, 'Verification code is invalid')
    .optional(),
  phone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(25, 'Phone number is too long')
    .optional(),
}).refine((data) => Boolean(data.verificationCode || data.phone), {
  message: "We couldn't find a match. Check the reference and phone number.",
});

export type TrackRequestFormData = z.infer<typeof TrackRequestSchema>;

export const CaseSchema = z
  .object({
    category: z.enum(['COMPLAINT', 'COMPLIMENT', 'SUGGESTION', 'GENERAL_FEEDBACK'], {
      message: 'Please select a feedback category',
    }),
    contactName: z
      .string()
      .trim()
      .max(100, 'Name must not exceed 100 characters')
      .default(''),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(120, 'Email address must not exceed 120 characters')
      .default(''),
    phone: z
      .string()
      .trim()
      .max(25, 'Phone number is too long')
      .optional()
      .or(z.literal('')),
    relatedSite: z
      .string()
      .trim()
      .max(150, 'Site location reference is too long')
      .optional()
      .or(z.literal('')),
    personnelRef: z
      .string()
      .trim()
      .max(100, 'Personnel reference is too long')
      .optional()
      .or(z.literal('')),
    rating: z.coerce
      .number()
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating cannot exceed 5')
      .optional()
      .or(z.literal(undefined)),
    description: z
      .string()
      .trim()
      .min(10, 'Please provide sufficient detail (at least 10 characters)')
      .max(2500, 'Description cannot exceed 2500 characters'),
    privacyConsent: z.boolean().refine((val) => val === true, {
      message: 'You must accept the confidentiality and records notice',
    }),
    idempotencyKey: z.string().trim().max(64).optional(),
  })
  .superRefine((data, ctx) => {
    const contactName = data.contactName.trim();
    const email = data.email.trim().toLowerCase();
    const hasName = contactName.length > 0;
    const hasEmail = email.length > 0;

    if (data.category === 'GENERAL_FEEDBACK') {
      if (hasName && contactName.length < 2) {
        ctx.addIssue({
          code: 'custom',
          path: ['contactName'],
          message: 'Name must be at least 2 characters',
        });
      }

      if (hasEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Please provide a valid email address',
        });
      }

      return;
    }

    if (!hasName || contactName.length < 2) {
      ctx.addIssue({
        code: 'custom',
        path: ['contactName'],
        message: 'Name must be at least 2 characters',
      });
    }

    if (!hasEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Please provide a valid email address',
      });
    }
  });

export type CaseFormData = z.infer<typeof CaseSchema>;

export const TrackCaseSchema = z.object({
  referenceNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^CS-\d{4}-\d{5}$/, 'Case reference format must be CS-YYYY-XXXXX (e.g., CS-2026-00045)'),
  verificationCode: z
    .string()
    .trim()
    .min(4, 'Verification code must be at least 4 digits')
    .max(10, 'Verification code is invalid')
    .optional(),
  phone: z
    .string()
    .trim()
    .min(7, 'Please provide a valid phone number')
    .max(25, 'Phone number is too long')
    .optional(),
}).refine((data) => Boolean(data.verificationCode || data.phone), {
  message: "We couldn't find a match. Check the reference and phone number.",
});

export type TrackCaseFormData = z.infer<typeof TrackCaseSchema>;

export const ContactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Valid email required').max(120),
  phone: z.string().trim().max(25).optional().or(z.literal('')),
  subject: z.string().trim().min(3, 'Subject required').max(150),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(2000),
  privacyConsent: z.boolean().refine((val) => val === true, {
    message: 'Consent is required to submit',
  }),
  idempotencyKey: z.string().trim().max(64).optional(),
});

export type ContactMessageFormData = z.infer<typeof ContactMessageSchema>;
