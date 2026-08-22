import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`id, name, listing_type, google_maps_url, village, taluk, states(name), districts(name)`)
    .eq('status', 'approved')
    .not('google_maps_url', 'is', null)
    .order('name')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold text-emerald-700 hover:underline">← Back to Home</Link>
          <p className="text-sm font-semibold text-emerald-700 mt-5 mb-2">Vallalar Jeevakarunyam</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Explore Locations</h1>
          <p className="text-gray-600 mt-3 max-w-3xl leading-7">Find approved Annadhanam centres, Jeeva Samadhis, temples, affordable stays, medical services and community service groups that have a map location.</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-8">
          <p className="font-semibold text-emerald-900">🗺️ Map Directory — Phase 1</p>
          <p className="text-sm text-emerald-800 mt-1">Open any approved location directly in Google Maps. A combined interactive map can be added after location coordinates are stored consistently for every listing.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load map locations.</div>}

        {!error && (!listings || listings.length === 0) && (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900">No mapped locations yet</h2>
            <p className="text-gray-600 mt-2">Approved listings with a Google Maps link will appear here automatically.</p>
            <Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800">Submit a Listing</Link>
          </div>
        )}

        {!error && listings && listings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {listings.map((listing) => (
              <article key={listing.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{typeLabels[listing.listing_type] || listing.listing_type}</span>
                    <h2 className="text-xl font-bold text-gray-900 mt-3">{listing.name}</h2>
                    <p className="text-sm text-gray-600 mt-2">{[listing.village, listing.taluk, listing.districts?.name, listing.states?.name].filter(Boolean).join(', ') || 'Location details available on map'}</p>
                  </div>
                  <div className="text-3xl">📍</div>
                </div>
                <a href={listing.google_maps_url!} target="_blank" rel="noopener noreferrer" className="inline-flex mt-5 px-4 py-2.5 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">Open in Google Maps →</a>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
