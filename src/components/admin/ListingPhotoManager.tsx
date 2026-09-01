'use client'

import { useState } from 'react'

type ListingImage = { id: number; image_url: string; storage_path?: string | null; caption?: string | null; sort_order?: number; created_at?: string }
type ListingDocument = { id: number; document_url: string; storage_path?: string | null; file_name: string; mime_type?: string | null; file_size?: number | null; created_at?: string }

export default function ListingPhotoManager({ listingId, initialCoverImageUrl }: { listingId: number; initialCoverImageUrl?: string | null }) {
  const [images, setImages] = useState<ListingImage[]>([])
  const [documents, setDocuments] = useState<ListingDocument[]>([])
  const [cover, setCover] = useState(initialCoverImageUrl || null)
  const [opened, setOpened] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function loadMedia() {
    if (loaded) return
    setLoading(true)
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      setImages(data.images || [])
      setDocuments(data.documents || [])
      setCover(data.coverImageUrl || null)
      setLoaded(true)
    } else setMessage('Unable to load listing photos and documents.')
    setLoading(false)
  }

  async function toggle() {
    const next = !opened
    setOpened(next)
    if (next) await loadMedia()
  }

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const form = event.currentTarget
    const data = new FormData(form)
    const file = data.get('file') as File | null
    if (!file || !file.size) { setMessage('Choose a photo or PDF first.'); return }
    setUploading(true)
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'POST', body: data })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || 'Unable to upload file.')
    else if (result.kind === 'document') {
      setDocuments(current => [...current, result.document])
      setMessage('PDF document added.')
      form.reset()
    } else {
      setImages(current => [...current, result.image])
      setCover(result.coverImageUrl || result.image?.image_url || null)
      setMessage('Photo added. It is now the public cover photo.')
      form.reset()
    }
    setUploading(false)
  }

  async function removeImage(imageId: number) {
    if (!window.confirm('Remove this photo from the listing?')) return
    setMessage('')
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || 'Unable to remove image.')
    else { setImages(current => current.filter(image => image.id !== imageId)); setCover(result.coverImageUrl || null); setMessage('Photo removed.') }
  }

  async function removeDocument(documentId: number) {
    if (!window.confirm('Remove this PDF document from the listing?')) return
    setMessage('')
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ documentId }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || 'Unable to remove document.')
    else { setDocuments(current => current.filter(document => document.id !== documentId)); setMessage('PDF document removed.') }
  }

  return <section className="mt-4 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h4 className="font-semibold text-gray-900">📷 Listing Photos & Documents</h4><p className="text-xs text-gray-600 mt-1">Manage photos and supporting PDF documents before or after approval.</p></div>
      <button type="button" onClick={() => void toggle()} className="px-3 py-2 border border-violet-300 bg-white text-violet-800 text-sm font-semibold rounded-lg hover:bg-violet-50">{opened ? 'Close' : cover || documents.length ? 'Manage Media' : 'Add Photos / PDF'}</button>
    </div>

    {opened && <div className="mt-4">
      {loading ? <p className="text-sm text-gray-600">Loading media…</p> : <>
        <div><h5 className="text-sm font-semibold text-gray-800 mb-3">Photos</h5>{images.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{images.map(image => <div key={image.id} className="relative rounded-lg overflow-hidden border border-violet-200 bg-white"><img src={image.image_url} alt={image.caption || 'Listing photo'} className="w-full h-28 object-cover" loading="lazy" /><div className="p-2"><p className="text-xs text-gray-600 truncate">{image.caption || 'Listing photo'}{cover === image.image_url ? ' · Cover' : ''}</p><button type="button" onClick={() => void removeImage(image.id)} className="text-xs font-semibold text-red-700 mt-1 hover:underline">Remove</button></div></div>)}</div> : <p className="text-sm text-gray-600">No photos added yet.</p>}</div>
        <div className="mt-5"><h5 className="text-sm font-semibold text-gray-800 mb-3">PDF Documents</h5>{documents.length > 0 ? <div className="space-y-2">{documents.map(document => <div key={document.id} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"><a href={document.document_url} target="_blank" rel="noopener noreferrer" className="min-w-0 text-sm font-medium text-blue-700 hover:underline truncate">📄 {document.file_name}</a><button type="button" onClick={() => void removeDocument(document.id)} className="shrink-0 text-xs font-semibold text-red-700 hover:underline">Remove</button></div>)}</div> : <p className="text-sm text-gray-600">No PDF documents added yet.</p>}</div>
        <form onSubmit={upload} className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end"><div><label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor={`media-${listingId}`}>Add photo or PDF</label><input id={`media-${listingId}`} name="file" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" required className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-800" /></div><div><label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor={`caption-${listingId}`}>Photo caption (optional)</label><input id={`caption-${listingId}`} name="caption" maxLength={250} placeholder="Used for photos" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" /></div><button type="submit" disabled={uploading} className="px-4 py-2.5 bg-violet-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-800 disabled:opacity-60">{uploading ? 'Uploading…' : 'Add File'}</button></form>
        <p className="text-xs text-gray-500 mt-2">Photos: JPEG, PNG or WebP · PDFs: PDF · maximum 5 MB each.</p>
      </>}
      {message && <p className="text-sm font-medium text-gray-800 mt-3">{message}</p>}
    </div>}
  </section>
}
