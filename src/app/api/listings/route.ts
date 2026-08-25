import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import { listingFormSchema } from '@/lib/validations/listing'

export const runtime = 'nodejs'

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase server credentials are not configured')
  return {
    url,
    secret,
    client: createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } }),
  }
}

export async function POST(request: Request) {
  try {
    const validatedData = listingFormSchema.parse(await request.json())
    const { url, secret, client } = getAdminClient()

    const insertData = {
      listing_type: validatedData.listingType,
      service_type: validatedData.listingType === 'community_service' ? validatedData.serviceType?.trim() || null : null,
      name: validatedData.name.trim(),
      description: validatedData.description.trim(),
      state_id: validatedData.state_id,
      district_id: validatedData.district_id,
      taluk: validatedData.taluk.trim(),
      panchayat: validatedData.panchayat.trim(),
      village: validatedData.village.trim(),
      timing: validatedData.timing?.trim() || null,
      google_maps_url: validatedData.googleMapsUrl?.trim() || null,
      latitude: validatedData.latitude?.trim() ? Number(validatedData.latitude) : null,
      longitude: validatedData.longitude?.trim() ? Number(validatedData.longitude) : null,
      contact_person: validatedData.contactPerson.trim(),
      phone: validatedData.mobileNumber.trim(),
      whatsapp: validatedData.whatsapp?.trim() || null,
      email: validatedData.email.trim(),
      website: validatedData.website?.trim() || null,
      submitter_name: validatedData.submitterName.trim(),
      submitter_email: validatedData.submitterEmail.trim(),
      submitter_phone: validatedData.submitterPhone.trim(),
      submitter_declaration: validatedData.submitterDeclaration,
      status: 'pending',
      sub_district_id: null,
      local_body_id: null,
      settlement_id: null,
      image_url: null,
    }

    const { data: listing, error } = await client.from('listings').insert(insertData).select('id').single()
    if (error) {
      console.error('Listing insert error:', error)
      return NextResponse.json({ error: 'Unable to submit the listing.' }, { status: 500 })
    }

    // Notification delivery must never make a successful public submission fail.
    try {
      const notificationResponse = await fetch(`${url}/functions/v1/notify-admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: secret,
        },
        body: JSON.stringify({ listing_id: listing.id }),
        cache: 'no-store',
      })

      if (!notificationResponse.ok) {
        console.error('Admin notification request failed:', notificationResponse.status, await notificationResponse.text())
      }
    } catch (notificationError) {
      console.error('Admin notification request error:', notificationError)
    }

    return NextResponse.json({ ok: true, listingId: listing.id }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Please review the form fields and try again.', issues: error.issues }, { status: 400 })
    }
    console.error('Listing submission API error:', error)
    return NextResponse.json({ error: 'Unable to submit the listing. Please try again.' }, { status: 500 })
  }
}
