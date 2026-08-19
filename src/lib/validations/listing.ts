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

  timing: z
    .string()
    .min(1, 'Timing / schedule is required'),

  country: z
    .string()
    .min(1, 'Country is required'),

  state_id: z
    .number()
    .min(1, 'Please select a state'),

  district_id: z
    .number()
    .min(1, 'Please select a district'),

  taluk: z
    .string()
    .min(1, 'Taluk is required'),

  panchayat: z
    .string()
    .min(1, 'Panchayat is required'),

  village: z
    .string()
    .min(1, 'Village is required'),

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
      'Mobile number must contain exactly 10 digits'
    ),

  whatsapp: z
    .string()
    .regex(
      /^[0-9]{10}$/,
      'WhatsApp number must contain exactly 10 digits'
    )
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Please enter a valid email address'),

  website: z
    .string()
    .optional(),
})

export type ListingFormData =
  z.infer<typeof listingFormSchema>