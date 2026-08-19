import { z } from 'zod'

export const listingFormSchema = z.object({
  listingType: z
    .string()
    .min(1, 'Listing type is required'),

  name: z
    .string()
    .min(2, 'Name must be at least 2 characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters'),

  country: z
    .string()
    .min(1, 'Country is required'),

  state_id: z.number({
    required_error: 'Please select a state',
  }),

  district_id: z.number({
    required_error: 'Please select a district',
  }),

  taluk: z
    .string()
    .min(1, 'Taluk is required'),

  panchayat: z
    .string()
    .min(1, 'Panchayat is required'),

  village: z
    .string()
    .min(1, 'Village is required'),

  timing: z
    .string()
    .max(
      500,
      'Timing / schedule must be less than 500 characters'
    )
    .optional(),

  googleMapsUrl: z
    .string()
    .optional(),

  contactPerson: z
    .string()
    .min(2, 'Contact person is required'),

  mobileNumber: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      'Enter a valid 10-digit mobile number'
    ),

  whatsapp: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      'Enter a valid 10-digit WhatsApp number'
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Enter a valid email address'),

  website: z
    .string()
    .optional(),
})

export type ListingFormData =
  z.infer<typeof listingFormSchema>