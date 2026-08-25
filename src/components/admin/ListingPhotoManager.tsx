'use client'

import { useEffect, useState } from 'react'

type ListingImage = {
  id: number
  image_url: string
  storage_path?: string | null
  caption?: string | null
  sort_order?: number
  created_at?: string
}

export default function ListingPhotoManager({ listingId, initialCoverImageUrl }: { listingId: number; initialCoverImageUrl?: string | null }) {
  const [images, setImages] = useState<ListingImage[]>([])
  const [cover, setCover] = useState(initialCoverImageUrl || null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  async function loadImages() {
    setLoading(true)
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { cache: 'no-store' })
    if (response.ok) {
      const data = await response.json()
      setImages(data.images || [])
      setCover(data.coverImageUrl || null)
    }
    setLoading(false)
  }

  useEffect(() => { void loadImages() }, [listingId])

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const form = event.currentTarget
    const data = new FormData(form)
    const file = data.get('file') as File | null
    if (!file || !file.size) { setMessage('Choose an image first.'); return }
    setUploading(true)
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'POST', body: data })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || 'Unable to upload image.')
    else {
      setImages(current => [...current, result.image])
      setCover(result.coverImageUrl || result.image?.image_url || null)
      setMessage('Photo added. It is now the public cover photo.')
      form.reset()
    }
    setUploading(false)
  }

  async function remove(imageId: number) {
    if (!window.confirm('Remove this photo from the listing?')) return
    setMessage('')
    const response = await fetch(`/api/admin/listings/${listingId}/photos`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ imageId }) })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) setMessage(result.error || 'Unable to remove image.')
    else {
      setImages(current => current.filter(image => image.id !== imageId))
      setCover(result.coverImageUrl || null)
      setMessage('Photo removed.')
    }
  }

  return <section className="mt-6 rounded-xl border border-violet-200 bg-violet-50/50 p-5">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
      <div><h4 className="font-semibold text-gray-900">📷 Listing Photos</h4><p className="text-xs text-gray-600 mt-1">Photos can be added or removed at any time, including after approval. The newest upload becomes the public cover photo.</p></div>
      {cover && <span className="text-xs font-semibold text-violet-700">Cover photo active</span>}
    </div>

    {loading ? <p className="text-sm text-gray-600 mt-4">Loading photos…</p> : images.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">{images.map(image => <div key={image.id} className="relative rounded-lg overflow-hidden border border-violet-200 bg-white">
      <img src={image.image_url} alt={image.caption || 'Listing photo'} className="w-full h-28 object-cover" loading="lazy" />
      <div className="p-2"><p className="text-xs text-gray-600 truncate">{image.caption || 'Listing photo'}{cover === image.image_url ? ' · Cover' : ''}</p><button type="button" onClick={() => void remove(image.id)} className="text-xs font-semibold text-red-700 mt-1 hover:underline">Remove</button></div>
    </div>)}</div> : <p className="text-sm text-gray-600 mt-4">No photos added yet.</p>}

    <form onSubmit={upload} className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
      <div><label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor={`photo-${listingId}`}>Add photo</label><input id={`photo-${listingId}`} name="file" type="file" accept="image/jpeg,image/png,image/webp" required className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-800" /></div>
      <div><label className="block text-sm font-semibold text-gray-800 mb-1" htmlFor={`caption-${listingId}`}>Caption (optional)</label><input id={`caption-${listingId}`} name="caption" maxLength={250} placeholder="Example: Main entrance / Samadhi shrine" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" /></div>
      <button type="submit" disabled={uploading} className="px-4 py-2.5 bg-violet-700 text-white text-sm font-semibold rounded-lg hover:bg-violet-800 disabled:opacity-60">{uploading ? 'Uploading…' : 'Add Photo'}</button>
    </form>
    <p className="text-xs text-gray-500 mt-2">JPEG, PNG or WebP · maximum 5 MB.</p>
    {message && <p className="text-sm font-medium text-gray-800 mt-3">{message}</p>}
  </section>
}
