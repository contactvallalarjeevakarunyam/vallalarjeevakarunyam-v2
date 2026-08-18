'use client'
import LocationSelector from '@/components/location/LocationSelector'
import { useState } from 'react'
import FormField from './FormField'
import FormSelect from './FormSelect'
import { listingFormSchema, type ListingFormData } from '@/lib/validations/listing'
import { ZodError } from 'zod'

const listingTypes = [
  { value: 'annadhanam', label: 'Annadhanam' },
  { value: 'jeeva_samadhi', label: 'Jeeva Samadhi' },
  { value: 'temple', label: 'Temple' },
  { value: 'stay', label: 'Stay' },
  { value: 'volunteer', label: 'Volunteer' },
]

const countries = [
  { value: 'india', label: 'India' },
]

const states = [
  { value: 'tamil_nadu', label: 'Tamil Nadu' },
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'andhra_pradesh', label: 'Andhra Pradesh' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'maharashtra', label: 'Maharashtra' },
]

const initialFormData: Record<string, string> = {
  listingType: '',
  name: '',
  description: '',
  country: '',
  state_id: '',
district_id: '',
  taluk: '',
  panchayat: '',
  village: '',
  googleMapsUrl: '',
  contactPerson: '',
  mobileNumber: '',
  whatsapp: '',
  email: '',
  website: '',
}

export default function ListingForm() {
  const [formData, setFormData] = useState<Record<string, string>>(initialFormData)
  const [location, setLocation] = useState({
  state_id: null as number | null,
  district_id: null as number | null,
})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setErrors({})

    try {
      // Validate form data with Zod
      const payload = {
  ...formData,
  state_id: location.state_id,
  district_id: location.district_id,
}

const validatedData = listingFormSchema.parse(payload)

      setLoading(true)

      // TODO: Integrate with Supabase to insert data
      // const { data, error } = await supabase
      //   .from('listings')
      //   .insert([validatedData])
      //
      // if (error) throw error

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setSuccessMessage('Listing submitted successfully! We will review it shortly.')
      setFormData(initialFormData)

setLocation({
  state_id: null,
  district_id: null,
})
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const path = issue.path[0]?.toString()
          if (path) {
            fieldErrors[path] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">{errorMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormSelect
          label="Listing Type"
          name="listingType"
          options={listingTypes}
          value={formData.listingType}
          onChange={handleChange}
          error={errors.listingType}
          required
        />

        <FormField
          label="Name"
          name="name"
          type="text"
          placeholder="e.g., Sri Vallalar Annadhanam Center"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />
      </div>

      <FormField
        label="Description"
        name="description"
        type="textarea"
        placeholder="Describe the listing, services, or activities..."
        value={formData.description}
        onChange={handleChange}
        error={errors.description}
        required
        rows={5}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <FormSelect
    label="Country"
    name="country"
    options={countries}
    value={formData.country}
    onChange={handleChange}
    error={errors.country}
    required
  />

  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Location
    </label>

    <LocationSelector
      value={location}
      onChange={setLocation}
    />
  </div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <FormField
    label="Taluk / Sub-District"
    name="taluk"
    type="text"
    placeholder="e.g., Nagercoil"
    value={formData.taluk}
    onChange={handleChange}
    error={errors.taluk}
    required
  />

  <FormField
    label="Panchayat / Municipality"
    name="panchayat"
    type="text"
    placeholder="e.g., Mahabalipuram Municipality"
    value={formData.panchayat}
    onChange={handleChange}
    error={errors.panchayat}
    required
  />
</div>

<FormField
  label="Village / Town"
  name="village"
  type="text"
  placeholder="e.g., Mahabalipuram"
  value={formData.village}
  onChange={handleChange}
  error={errors.village}
  required
/>

      <FormField
        label="Google Maps URL"
        name="googleMapsUrl"
        type="url"
        placeholder="https://maps.google.com/..."
        value={formData.googleMapsUrl}
        onChange={handleChange}
        error={errors.googleMapsUrl}
      />

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Contact Person"
            name="contactPerson"
            type="text"
            placeholder="Full name"
            value={formData.contactPerson}
            onChange={handleChange}
            error={errors.contactPerson}
            required
          />

          <FormField
            label="Email"
            name="email"
            type="email"
            placeholder="contact@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Mobile Number"
            name="mobileNumber"
            type="tel"
            placeholder="10-digit number"
            value={formData.mobileNumber}
            onChange={handleChange}
            error={errors.mobileNumber}
            required
          />

          <FormField
            label="WhatsApp Number"
            name="whatsapp"
            type="tel"
            placeholder="10-digit number (optional)"
            value={formData.whatsapp}
            onChange={handleChange}
            error={errors.whatsapp}
          />
        </div>

        <FormField
          label="Website"
          name="website"
          type="url"
          placeholder="https://example.com (optional)"
          value={formData.website}
          onChange={handleChange}
          error={errors.website}
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          📷 <span className="font-medium">Image Upload:</span> This feature will be available in the next update to enhance your listing with photos.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Listing'}
        </button>
        <button
          type="reset"
          className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
        >
          Clear
        </button>
      </div>
    </form>
  )
}
