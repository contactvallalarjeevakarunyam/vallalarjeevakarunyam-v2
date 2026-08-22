import { z } from 'zod'

const optionalCoordinate = (min: number, max: number, label: string) =>
  z
    .union([z.literal(''), z.string().trim().refine((value) => {
      const number = Number(value)
      return Number.isFinite(number) && number >= min && number <= max
    }, `${label} must be between ${min} and ${max}`)])
    .optional()

export const listingFormSchema = z
  .object({
    listingType: z.string().min(1, 'Listing type is required'),
    serviceType: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    timing: z.string().min(1, 'Timing / schedule is required'),
    country: z.string().min(1, 'Country is required'),
    state_id: z.number().min(1, 'Please select a state'),
    district_id: z.number().min(1, 'Please select a district'),
    taluk: z.string().min(1, 'Taluk is required'),
    panchayat: z.string().min(1, 'Panchayat is required'),
    village: z.string().min(1, 'Village is required'),
    googleMapsUrl: z.string().optional(),
    latitude: optionalCoordinate(-90, 90, 'Latitude'),
    longitude: optionalCoordinate(-180, 180, 'Longitude'),
    contactPerson: z.string().min(2, 'Contact person is required'),
    mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must contain exactly 10 digits'),
    whatsapp: z.string().regex(/^[0-9]{10}$/, 'WhatsApp number must contain exactly 10 digits').optional().or(z.literal('')),
    email: z.string().email('Please enter a valid email address'),
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.listingType === 'community_service' && !data.serviceType?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['serviceType'], message: 'Service type is required' })
    }
    const hasLatitude = Boolean(data.latitude?.trim())
    const hasLongitude = Boolean(data.longitude?.trim())
    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: [hasLatitude ? 'longitude' : 'latitude'], message: 'Enter both latitude and longitude, or leave both blank' })
    }
  })

export type ListingFormData = z.infer<typeof listingFormSchema>
