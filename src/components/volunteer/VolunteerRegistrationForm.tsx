'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const interestOptions = [
  'Identify useful listings',
  'Verify public submissions',
  'Report outdated information',
  'Community service support',
]

export default function VolunteerRegistrationForm() {
  const supabase = createClient()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const form = new FormData(event.currentTarget)
    const interests = form.getAll('interests').map(String)

    if (interests.length === 0) {
      setError('Please select at least one way you would like to help.')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase
      .from('volunteer_applications')
      .insert({
        name: String(form.get('name') || '').trim(),
        phone: String(form.get('phone') || '').trim(),
        whatsapp: String(form.get('whatsapp') || '').trim() || null,
        email: String(form.get('email') || '').trim() || null,
        city: String(form.get('city') || '').trim(),
        state: String(form.get('state') || '').trim(),
        interests,
        message: String(form.get('message') || '').trim() || null,
        status: 'pending',
      })

    if (insertError) {
      setError('Unable to submit your volunteer registration. Please try again.')
      setSubmitting(false)
      return
    }

    event.currentTarget.reset()
    setSuccess(true)
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-7 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-xl font-bold text-gray-900">Thank you for volunteering</h3>
        <p className="text-gray-600 mt-2">
          Your registration has been received and will be reviewed by the Vallalar Jeevakarunyam team.
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-5 text-emerald-700 font-semibold hover:underline"
        >
          Submit another registration
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <label className="text-sm font-semibold text-gray-700">
          Name *
          <input name="name" required minLength={2} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Mobile Number *
          <input name="phone" required pattern="[0-9]{10}" inputMode="numeric" placeholder="10 digit number" className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          WhatsApp Number
          <input name="whatsapp" pattern="[0-9]{10}" inputMode="numeric" placeholder="Optional" className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          Email
          <input name="email" type="email" placeholder="Optional" className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          City / Town *
          <input name="city" required className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
        <label className="text-sm font-semibold text-gray-700">
          State *
          <input name="state" required className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
        </label>
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-semibold text-gray-700 mb-3">How would you like to help? *</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interestOptions.map((interest) => (
            <label key={interest} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 text-sm text-gray-700 cursor-pointer hover:bg-gray-50">
              <input type="checkbox" name="interests" value={interest} className="mt-1" />
              <span>{interest}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="block mt-6 text-sm font-semibold text-gray-700">
        Anything else you would like us to know?
        <textarea name="message" rows={4} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2.5 font-normal" />
      </label>

      {error && <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 disabled:opacity-60 transition"
      >
        {submitting ? 'Submitting...' : 'Register as Volunteer'}
      </button>

      <p className="text-xs text-gray-500 mt-4">
        Registration does not provide admin access. Volunteer applications are reviewed before participation.
      </p>
    </form>
  )
}
