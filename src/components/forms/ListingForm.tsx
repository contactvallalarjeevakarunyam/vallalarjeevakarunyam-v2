'use client'

import { useState } from 'react'
import { ZodError } from 'zod'

import LocationSelector from '@/components/location/LocationSelector'
import { createClient } from '@/lib/supabase/client'
import {
  listingFormSchema,
  type ListingFormData,
} from '@/lib/validations/listing'
import type { TablesInsert } from '@/types/database.generated'

import FormField from './FormField'
import FormSelect from './FormSelect'

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

type FormState = {
  listingType: string
  name: string
  description: string
  country: string
  taluk: string
  panchayat: string
  village: string
  timing: string
  googleMapsUrl: string
  contactPerson: string
  mobileNumber: string
  whatsapp: string
  email: string
  website: string
}

type LocationState = {
  state_id: number | null
  district_id: number | null
}

const initialFormData: FormState = {
  listingType: '',
  name: '',
  description: '',
  country: 'india',
  taluk: '',
  panchayat: '',
  village: '',
  timing: '',
  googleMapsUrl: '',
  contactPerson: '',
  mobileNumber: '',
  whatsapp: '',
  email: '',
  website: '',
}

const initialLocation: LocationState = {
  state_id: null,
  district_id: null,
}

export default function ListingForm() {
  const [formData, setFormData] =
    useState<FormState>(initialFormData)

  const [location, setLocation] =
    useState<LocationState>(initialLocation)

  const [errors, setErrors] =
    useState<Record<string, string>>({})

  const [loading, setLoading] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  // =====================================================
  // FORM FIELD CHANGE
  // =====================================================

  const handleChange = (
    e: React.ChangeEvent<
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  // =====================================================
  // LOCATION CHANGE
  // =====================================================

  const handleLocationChange = (
    value: LocationState
  ) => {
    setLocation(value)

    setErrors((prev) => ({
      ...prev,
      state_id: '',
      district_id: '',
    }))
  }

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData(initialFormData)
    setLocation(initialLocation)

    setErrors({})
    setSuccessMessage('')
    setErrorMessage('')
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()

    setErrors({})
    setSuccessMessage('')
    setErrorMessage('')

    try {
      const payload = {
        ...formData,
        state_id: location.state_id,
        district_id: location.district_id,
      }

      const validatedData: ListingFormData =
        listingFormSchema.parse(payload)

      setLoading(true)

      const supabase = createClient()

      const insertData: TablesInsert<'listings'> = {
        listing_type:
          validatedData.listingType,

        name:
          validatedData.name.trim(),

        description:
          validatedData.description.trim(),

        state_id:
          validatedData.state_id,

        district_id:
          validatedData.district_id,

        // Free-text location fields

        taluk:
          validatedData.taluk.trim(),

        panchayat:
          validatedData.panchayat.trim(),

        village:
          validatedData.village.trim(),

        // Flexible timing / schedule

        timing:
          validatedData.timing?.trim() ||
          null,

        google_maps_url:
          validatedData.googleMapsUrl?.trim() ||
          null,

        contact_person:
          validatedData.contactPerson.trim(),

        phone:
          validatedData.mobileNumber.trim(),

        whatsapp:
          validatedData.whatsapp?.trim() ||
          null,

        email:
          validatedData.email.trim(),

        website:
          validatedData.website?.trim() ||
          null,

        // Public submissions wait for admin approval

        status: 'pending',

        // Structured lower-level location IDs
        // are not being used yet

        sub_district_id: null,
        local_body_id: null,
        settlement_id: null,

        image_url: null,
      }

      const { error } = await supabase
        .from('listings')
        .insert(insertData)

      if (error) {
        console.error(
          'Supabase insert error:',
          error
        )

        throw error
      }

      setSuccessMessage(
        'Listing submitted successfully! We will review it shortly.'
      )

      setFormData(initialFormData)
      setLocation(initialLocation)

    } catch (error) {

      // Zod validation errors

      if (error instanceof ZodError) {
        const fieldErrors:
          Record<string, string> = {}

        error.issues.forEach((issue) => {
          const path =
            issue.path[0]?.toString()

          if (path) {
            fieldErrors[path] =
              issue.message
          }
        })

        setErrors(fieldErrors)

      } else {

        console.error(
          'Listing submission error:',
          error
        )

        setErrorMessage(
          'Unable to submit the listing. Please try again.'
        )
      }

    } finally {
      setLoading(false)
    }
  }

  // =====================================================
  // FORM
  // =====================================================

  return (
    <form
      onSubmit={handleSubmit}
      onReset={handleReset}
      className="space-y-6"
    >

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            {successMessage}
          </p>
        </div>
      )}

      {/* ERROR MESSAGE */}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">
            {errorMessage}
          </p>
        </div>
      )}

      {/* LISTING TYPE + NAME */}

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

      {/* DESCRIPTION */}

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

      {/* COUNTRY + LOCATION */}

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
            onChange={handleLocationChange}
          />

          {(errors.state_id ||
            errors.district_id) && (
            <p className="mt-2 text-sm text-red-600">
              {errors.state_id ||
                errors.district_id}
            </p>
          )}

        </div>

      </div>

      {/* TALUK + PANCHAYAT */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <FormField
          label="Taluk / Sub-District"
          name="taluk"
          type="text"
          placeholder="e.g., Gingee"
          value={formData.taluk}
          onChange={handleChange}
          error={errors.taluk}
          required
        />

        <FormField
          label="Panchayat / Municipality"
          name="panchayat"
          type="text"
          placeholder="e.g., Avalurpet"
          value={formData.panchayat}
          onChange={handleChange}
          error={errors.panchayat}
          required
        />

      </div>

      {/* VILLAGE */}

      <FormField
        label="Village / Town"
        name="village"
        type="text"
        placeholder="e.g., Avalurpet"
        value={formData.village}
        onChange={handleChange}
        error={errors.village}
        required
      />

      {/* TIMING / SCHEDULE */}

      <div>

        <FormField
          label="Timing / Schedule"
          name="timing"
          type="textarea"
          placeholder="e.g., Daily - 12:00 PM to 2:00 PM"
          value={formData.timing}
          onChange={handleChange}
          error={errors.timing}
          rows={3}
        />

        <p className="text-sm text-gray-500 mt-1">
          Example: Daily 12:00 PM - 2:00 PM,
          Every Sunday 1:00 PM, or Pournami days
          from 12:30 PM.
        </p>

      </div>

      {/* GOOGLE MAP */}

      <FormField
        label="Google Maps URL"
        name="googleMapsUrl"
        type="url"
        placeholder="https://maps.google.com/..."
        value={formData.googleMapsUrl}
        onChange={handleChange}
        error={errors.googleMapsUrl}
      />

      {/* CONTACT INFORMATION */}

      <div className="border-t pt-6">

        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>

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

      {/* IMAGE PLACEHOLDER */}

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">

        <p className="text-sm text-gray-600">

          📷{' '}

          <span className="font-medium">
            Image Upload:
          </span>{' '}

          This feature will be available in the next update
          to enhance your listing with photos.

        </p>

      </div>

      {/* BUTTONS */}

      <div className="flex gap-4">

        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? 'Submitting...'
            : 'Submit Listing'}
        </button>

        <button
          type="reset"
          disabled={loading}
          className="flex-1 bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
        >
          Clear
        </button>

      </div>

    </form>
  )
}