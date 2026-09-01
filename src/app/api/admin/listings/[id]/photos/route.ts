import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

const BUCKET = 'listing-images'
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const PDF_TYPE = 'application/pdf'
const MAX_BYTES = 5 * 1024 * 1024

function revalidateListingPages() {
  for (const path of ['/admin','/','/annadhanam','/jeeva-samadhi','/temple','/stay','/medical','/education','/volunteer','/map']) revalidatePath(path)
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase server credentials are not configured')
  return createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function authorizeListing(listingId: number) {
  const session = await createClient()
  const { data: { user } } = await session.auth.getUser()
  if (!user) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: admin } = await session.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  const { data: listing } = await session.from('listings').select('id,status,image_url').eq('id', listingId).maybeSingle()
  if (!listing) return { error: NextResponse.json({ error: 'Listing not found or outside your admin scope' }, { status: 404 }) }
  return { user, listing }
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listingId = Number(id)
  if (!Number.isInteger(listingId)) return NextResponse.json({ error: 'Invalid listing' }, { status: 400 })
  const auth = await authorizeListing(listingId)
  if ('error' in auth) return auth.error
  const db = serviceClient()
  const [{ data: images, error: imageError }, { data: documents, error: documentError }] = await Promise.all([
    db.from('listing_images').select('id,image_url,storage_path,caption,sort_order,created_at').eq('listing_id', listingId).order('sort_order').order('created_at'),
    db.from('listing_documents').select('id,document_url,storage_path,file_name,mime_type,file_size,created_at').eq('listing_id', listingId).order('created_at', { ascending: false }),
  ])
  if (imageError) return NextResponse.json({ error: imageError.message }, { status: 500 })
  if (documentError) return NextResponse.json({ error: documentError.message }, { status: 500 })
  return NextResponse.json({ images: images || [], documents: documents || [], coverImageUrl: auth.listing.image_url || null })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listingId = Number(id)
  if (!Number.isInteger(listingId)) return NextResponse.json({ error: 'Invalid listing' }, { status: 400 })
  const auth = await authorizeListing(listingId)
  if ('error' in auth) return auth.error

  const form = await request.formData()
  const file = form.get('file')
  const caption = String(form.get('caption') || '').trim().slice(0, 250) || null
  if (!(file instanceof File)) return NextResponse.json({ error: 'Choose a photo or PDF to upload' }, { status: 400 })
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: 'File must be 5 MB or smaller' }, { status: 400 })
  if (!IMAGE_TYPES.has(file.type) && file.type !== PDF_TYPE) return NextResponse.json({ error: 'Only JPEG, PNG, WebP images and PDF documents are allowed' }, { status: 400 })

  const db = serviceClient()
  if (file.type === PDF_TYPE) {
    const storagePath = `${listingId}/documents/${Date.now()}-${crypto.randomUUID()}.pdf`
    const { error: uploadError } = await db.storage.from(BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: PDF_TYPE, cacheControl: '31536000', upsert: false })
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
    const { data: publicUrlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
    const { data: document, error: insertError } = await db.from('listing_documents').insert({ listing_id: listingId, document_url: publicUrlData.publicUrl, storage_path: storagePath, file_name: file.name, mime_type: PDF_TYPE, file_size: file.size, uploaded_by: auth.user.id }).select('id,document_url,storage_path,file_name,mime_type,file_size,created_at').single()
    if (insertError) {
      await db.storage.from(BUCKET).remove([storagePath])
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
    await db.from('admin_activity_log').insert({ actor_user_id: auth.user.id, listing_id: listingId, action: 'listing_document_added', details: { document_id: document.id, file_name: file.name } })
    revalidateListingPages()
    return NextResponse.json({ kind: 'document', document }, { status: 201 })
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const storagePath = `${listingId}/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await db.storage.from(BUCKET).upload(storagePath, new Uint8Array(await file.arrayBuffer()), { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
  const { data: publicUrlData } = db.storage.from(BUCKET).getPublicUrl(storagePath)
  const imageUrl = publicUrlData.publicUrl
  const { data: last } = await db.from('listing_images').select('sort_order').eq('listing_id', listingId).order('sort_order', { ascending: false }).limit(1).maybeSingle()
  const sortOrder = (last?.sort_order ?? -1) + 1
  const { data: image, error: insertError } = await db.from('listing_images').insert({ listing_id: listingId, image_url: imageUrl, storage_path: storagePath, caption, sort_order: sortOrder, uploaded_by: auth.user.id }).select('id,image_url,storage_path,caption,sort_order,created_at').single()
  if (insertError) {
    await db.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }
  await db.from('listings').update({ image_url: imageUrl }).eq('id', listingId)
  await db.from('admin_activity_log').insert({ actor_user_id: auth.user.id, listing_id: listingId, action: 'listing_photo_added', details: { image_id: image.id } })
  revalidateListingPages()
  return NextResponse.json({ kind: 'image', image, coverImageUrl: imageUrl }, { status: 201 })
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const listingId = Number(id)
  if (!Number.isInteger(listingId)) return NextResponse.json({ error: 'Invalid listing' }, { status: 400 })
  const auth = await authorizeListing(listingId)
  if ('error' in auth) return auth.error
  const body = await request.json().catch(() => ({})) as { imageId?: number; documentId?: number }
  const db = serviceClient()

  if (body.documentId !== undefined) {
    const documentId = Number(body.documentId)
    if (!Number.isInteger(documentId)) return NextResponse.json({ error: 'Invalid document' }, { status: 400 })
    const { data: document } = await db.from('listing_documents').select('id,storage_path').eq('id', documentId).eq('listing_id', listingId).maybeSingle()
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    if (document.storage_path) await db.storage.from(BUCKET).remove([document.storage_path])
    const { error } = await db.from('listing_documents').delete().eq('id', documentId).eq('listing_id', listingId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    await db.from('admin_activity_log').insert({ actor_user_id: auth.user.id, listing_id: listingId, action: 'listing_document_removed', details: { document_id: documentId } })
    revalidateListingPages()
    return NextResponse.json({ ok: true })
  }

  const imageId = Number(body.imageId)
  if (!Number.isInteger(imageId)) return NextResponse.json({ error: 'Invalid image' }, { status: 400 })
  const { data: image } = await db.from('listing_images').select('id,image_url,storage_path').eq('id', imageId).eq('listing_id', listingId).maybeSingle()
  if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  if (image.storage_path) await db.storage.from(BUCKET).remove([image.storage_path])
  const { error } = await db.from('listing_images').delete().eq('id', imageId).eq('listing_id', listingId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  let coverImageUrl = auth.listing.image_url || null
  if (coverImageUrl === image.image_url) {
    const { data: replacement } = await db.from('listing_images').select('image_url').eq('listing_id', listingId).order('sort_order', { ascending: false }).order('created_at', { ascending: false }).limit(1).maybeSingle()
    coverImageUrl = replacement?.image_url || null
    await db.from('listings').update({ image_url: coverImageUrl }).eq('id', listingId)
  }
  await db.from('admin_activity_log').insert({ actor_user_id: auth.user.id, listing_id: listingId, action: 'listing_photo_removed', details: { image_id: imageId } })
  revalidateListingPages()
  return NextResponse.json({ ok: true, coverImageUrl })
}
