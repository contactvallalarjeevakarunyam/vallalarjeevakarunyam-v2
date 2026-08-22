import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import InteractiveListingsMap from '@/components/map/InteractiveListingsMap'

export const metadata: Metadata = {
  title: 'Map',
  description: 'Explore approved Vallalar Jeevakarunyam service locations on an interactive map and open directions in Google Maps.',
}

const typeLabels: Record<string, string> = {
  annadhanam: 'Annadhanam',
  jeeva_samadhi: 'Jeeva Samadhi',
  temple: 'Temple & Meditation Centre',
  stay: 'Affordable Stay',
  community_service: 'Community Service',
  medical: 'Medical Service',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`id, name, listing_type, google_maps_url, latitude, longitude, village, taluk, states(name), districts(name)`).eq('status', 'approved').order('name')
  const allListings = listings || []
  const markerListings = allListings.filter(listing => listing.latitude !== null && listing.longitude !== null).map(listing => ({ id: listing.id, name: listing.name, listing_type: listing.listing_type, latitude: listing.latitude as number, longitude: listing.longitude as number, google_maps_url: listing.google_maps_url, village: listing.village, taluk: listing.taluk, state_name: listing.states?.name || null, district_name: listing.districts?.name || null }))
  const directoryListings = allListings.filter(listing => listing.google_maps_url)

  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-8"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Locations</h1><p className="text-gray-600 mt-3 max-w-3xl leading-7">Explore approved Annadhanam centres, Jeeva Samadhis, temples and meditation centres, affordable stays, medical services and community service groups on one map.</p></div>
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-8"><p className="font-semibold text-gray-900">Before you travel</p><p className="text-sm text-gray-700 mt-1 leading-6">Map locations and directions are provided for convenience. Please confirm the exact location, timings, services and availability directly with the listed contact before travelling.</p></div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load map locations. Please try again later.</div>}
    {!error && <InteractiveListingsMap listings={markerListings} />}
    {!error && <section><div className="mb-5"><h2 className="text-2xl font-bold text-gray-900">Location Directory</h2><p className="text-gray-600 mt-1">Listings with a Google Maps link are kept here for easy directions, including older listings that do not yet have coordinates.</p></div>{directoryListings.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No mapped locations yet</h2><p className="text-gray-600 mt-2">Approved listings with map information will appear here automatically.</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800">Submit a Listing</Link></div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{directoryListings.map(listing => <article key={listing.id} className="bg-white border border-gray-200 rounded-xl p-5 md:p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{typeLabels[listing.listing_type] || listing.listing_type}</span><h3 className="text-xl font-bold text-gray-900 mt-3">{listing.name}</h3><p className="text-sm text-gray-600 mt-2">{[listing.village, listing.taluk, listing.districts?.name, listing.states?.name].filter(Boolean).join(', ') || 'Location details available on map'}</p>{listing.latitude !== null && listing.longitude !== null && <p className="text-xs text-emerald-700 font-semibold mt-2">📍 Available on interactive map</p>}</div><div className="text-3xl">📍</div></div><a href={listing.google_maps_url!} target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 px-4 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">Open in Google Maps →</a></article>)}</div>}</section>}
  </div></main>
}
