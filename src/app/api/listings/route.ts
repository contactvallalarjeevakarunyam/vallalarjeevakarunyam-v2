import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ZodError } from 'zod'
import { listingFormSchema } from '@/lib/validations/listing'

export const runtime = 'nodejs'

const MAX_FILES = 5
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])

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
    const contentType = request.headers.get('content-type') || ''
    let validatedData
    let files: File[] = []

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const payload = formData.get('payload')
      if (typeof payload !== 'string') {
        return NextResponse.json({ error: 'Invalid listing submission.' }, { status: 400 })
      }
      validatedData = listingFormSchema.parse(JSON.parse(payload))
      files = formData.getAll('photos').filter((value): value is File => value instanceof File && value.size > 0)

      if (files.length > MAX_FILES) {
        return NextResponse.json({ error: `You can upload up to ${MAX_FILES} photos or PDF documents.` }, { status: 400 })
      }

      for (const file of files) {
        if (!ALLOWED_MIME_TYPES.has(file.type) || file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: 'Each file must be JPEG, PNG, WebP or PDF and no larger than 5 MB.' }, { status: 400 })
        }
      }
    } else {
      validatedData = listingFormSchema.parse(await request.json())
    }

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

    let uploadedPhotoCount = 0
    let uploadedDocumentCount = 0
    const photoErrors: string[] = []
    const documentErrors: string[] = []

    for (const [index, file] of files.entries()) {
      if (file.type === 'application/pdf') {
        const storagePath = `submissions/${listing.id}/documents/${crypto.randomUUID()}.pdf`
        const { error: uploadError } = await client.storage.from('listing-images').upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

        if (uploadError) {
          console.error('Listing PDF upload error:', uploadError)
          documentErrors.push(file.name)
          continue
        }

        const { data: publicUrlData } = client.storage.from('listing-images').getPublicUrl(storagePath)
        const { error: documentInsertError } = await client.from('listing_documents').insert({
          listing_id: listing.id,
          document_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
          uploaded_by: null,
        })

        if (documentInsertError) {
          console.error('Listing PDF record error:', documentInsertError)
          await client.storage.from('listing-images').remove([storagePath])
          documentErrors.push(file.name)
          continue
        }

        uploadedDocumentCount += 1
        continue
      }

      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
      const storagePath = `submissions/${listing.id}/${crypto.randomUUID()}.${extension}`
      const { error: uploadError } = await client.storage.from('listing-images').upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

      if (uploadError) {
        console.error('Listing photo upload error:', uploadError)
        photoErrors.push(file.name)
        continue
      }

      const { data: publicUrlData } = client.storage.from('listing-images').getPublicUrl(storagePath)
      const imageUrl = publicUrlData.publicUrl

      const { error: imageInsertError } = await client.from('listing_images').insert({
        listing_id: listing.id,
        image_url: imageUrl,
        storage_path: storagePath,
        caption: null,
        sort_order: index,
        uploaded_by: null,
      })

      if (imageInsertError) {
        console.error('Listing photo record error:', imageInsertError)
        await client.storage.from('listing-images').remove([storagePath])
        photoErrors.push(file.name)
        continue
      }

      uploadedPhotoCount += 1

      if (uploadedPhotoCount === 1) {
        await client.from('listings').update({ image_url: imageUrl }).eq('id', listing.id)
      }
    }

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

    return NextResponse.json({
      ok: true,
      listingId: listing.id,
      uploadedPhotoCount,
      uploadedDocumentCount,
      photoErrors,
      documentErrors,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Please review the form fields and try again.', issues: error.issues }, { status: 400 })
    }
    console.error('Listing submission API error:', error)
    return NextResponse.json({ error: 'Unable to submit the listing. Please try again.' }, { status: 500 })
  }
}
