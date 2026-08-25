import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ListingPhotoManager from '@/components/admin/ListingPhotoManager'

type PageProps = { searchParams: Promise<{ q?: string; status?: string; category?: string }> }

const categories = [
  ['annadhanam', 'Annadhanam'],
  ['jeeva_samadhi', 'Jeeva Samadhi'],
  ['temple', 'Temples & Meditation Centres'],
  ['stay', 'Affordable Stays'],
  ['medical', 'Affordable Healthcare'],
  ['education', 'Affordable Education'],
  ['community_service', 'Community Service'],
] as const

function categoryLabel(type: string | null) {
  return categories.find(([value]) => value === type)?.[1] || type || '-'
}

export default async function ListingPhotosPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) redirect('/admin')

  const params = await searchParams
  const q = (params.q || '').trim()
  const status = ['pending', 'approved', 'rejected'].includes(params.status || '') ? params.status! : ''
  const category = categories.some(([value]) => value === params.category) ? params.category! : ''

  let query = supabase.from('listings').select('id,name,status,listing_type,image_url,created_at').order('created_at', { ascending: false }).limit(300)
  if (q) query = query.ilike('name', `%${q}%`)
  if (status) query = query.eq('status', status)
  if (category) query = query.eq('listing_type', category)
  const { data: listings, error } = await query

  return <main className="max-w-6xl mx-auto p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-7">
      <div><Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">← Admin Dashboard</Link><h1 className="text-3xl font-bold text-gray-900 mt-3">Listing Photos</h1><p className="text-gray-600 mt-2">Add or manage photos for any listing in your assigned admin scope. Approval status does not lock photo updates.</p></div>
    </div>

    <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-gray-200 rounded-xl p-4 mb-6">
      <input name="q" defaultValue={q} placeholder="Search listing name…" className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm" />
      <select name="status" defaultValue={status} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"><option value="">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
      <select name="category" defaultValue={category} className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm bg-white"><option value="">All categories</option>{categories.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select>
      <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2.5 text-white text-sm font-semibold hover:bg-emerald-800">Filter Listings</button>
    </form>

    {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">Unable to load listings: {error.message}</div> : !listings?.length ? <div className="rounded-xl border border-gray-200 bg-white p-6 text-gray-600">No matching listings.</div> : <div className="space-y-4">{listings.map(listing => <article key={listing.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><h2 className="text-lg font-bold text-gray-900">{listing.name}</h2><p className="text-sm text-gray-600 mt-1">{categoryLabel(listing.listing_type)} · <span className="capitalize">{listing.status}</span></p></div>{listing.image_url && <img src={listing.image_url} alt={`${listing.name} cover`} className="w-24 h-16 object-cover rounded-lg border border-gray-200" loading="lazy" />}</div>
      <ListingPhotoManager listingId={Number(listing.id)} initialCoverImageUrl={listing.image_url} />
    </article>)}</div>}
  </main>
}
