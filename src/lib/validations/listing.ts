import { z } from 'zod'

export const listingFormSchema = z.object({
  listingType: z.string().min(1, 'Listing type is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  country: z.string().min(1, 'Country is required'),
  state: z.string().min(1, 'State is required'),
  district: z.string().min(1, 'District is required'),
  taluk: z.string().min(1, 'Taluk/Sub-District is required'),
  panchayat: z.string().min(1, 'Panchayat/Municipality is required'),
  village: z.string().min(1, 'Village/Town is required'),
  googleMapsUrl: z.string().url('Please enter a valid Google Maps URL').or(z.literal('')).optional(),
  contactPerson: z.string().min(2, 'Contact person name is required'),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, 'Mobile number must be 10 digits'),
  whatsapp: z.string().regex(/^[0-9]{10}$/, 'WhatsApp number must be 10 digits').or(z.literal('')).optional(),
  email: z.string().email('Please enter a valid email address'),
  website: z.string().url('Please enter a valid website URL').or(z.literal('')).optional(),
})

export type ListingFormData = z.infer<typeof listingFormSchema>
