import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function VolunteerPage() {
  const supabase = await createClient()

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      states (name),
      districts (name)
    `)
    .eq('listing_type', 'community_service')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-10">
          <Link href="/" className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-5">← Back to Home</Link>
          <p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Volunteer & Community Service</h1>
          <p className="text-gray-600 mt-3 max-w-3xl">Volunteer with Vallalar Jeevakarunyam or connect with groups carrying out compassionate, environmental and social service.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <section className="bg-white border border-emerald-200 rounded-2xl p-7 shadow-sm">
            <div className="text-4xl mb-4">🤝</div>
            <h2 className="text-2xl font-bold text-gray-900">Volunteer With Us</h2>
            <p className="text-gray-600 mt-3 leading-7">Help identify useful listings, verify public submissions and report outdated information so the platform stays accurate.</p>
            <Link href="/volunteer/register" className="inline-flex mt-6 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition">Register as Volunteer →</Link>
          </section>

          <section className="bg-white border border-emerald-200 rounded-2xl p-7 shadow-sm">
            <div className="text-4xl mb-4">🌱</div>
            <h2 className="text-2xl font-bold text-gray-900">Join Community Service</h2>
            <p className="text-gray-600 mt-3 leading-7">Find organisations and groups already carrying out social, environmental and compassionate service and contact them directly.</p>
            <a href="#community-services" className="inline-flex mt-6 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition">Find Community Services ↓</a>
          </section>
        </div>

        <section id="community-services" className="scroll-mt-24">
          <p className="text-sm font-semibold text-emerald-700 mb-2">Community Directory</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Community Service Groups</h2>
          <p className="text-gray-600 mt-3 mb-7 max-w-3xl">Discover approved organisations and service initiatives and contact them directly to participate.</p>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Community Service listings.</div>}

          {!error && (!listings || listings.length === 0) && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900">No approved Community Service groups yet</h3>
              <p className="text-gray-600 mt-2">Know a community service organisation? Submit the details for review.</p>
              <Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition">Submit a Listing</Link>
            </div>
          )}

          {!error && listings && listings.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {listings.map((listing) => (
                <article key={listing.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-900">{listing.name}</h3>
                    <span className="shrink-0 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">Community Service</span>
                  </div>
                  {listing.service_type && <p className="text-sm font-semibold text-emerald-700 mt-2">{listing.service_type.replaceAll('_', ' ')}</p>}
                  {listing.description && <p className="text-gray-600 mt-3">{listing.description}</p>}
                  {listing.timing && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-5"><p className="text-sm font-semibold text-emerald-800">🕐 Timing / Schedule</p><p className="text-gray-800 mt-1 whitespace-pre-line">{listing.timing}</p></div>}
                  <div className="border-t border-gray-100 mt-5 pt-4 text-sm text-gray-700 space-y-2">
                    <p><span className="font-semibold">State:</span> {listing.states?.name || '-'}</p>
                    <p><span className="font-semibold">District:</span> {listing.districts?.name || '-'}</p>
                    {listing.village && <p><span className="font-semibold">Village / Town:</span> {listing.village}</p>}
                    {listing.phone && <p><span className="font-semibold">Phone:</span> <a href={`tel:${listing.phone}`} className="text-emerald-700 hover:underline">{listing.phone}</a></p>}
                  </div>
                  {(listing.google_maps_url || listing.website) && <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap gap-3">
                    {listing.google_maps_url && <a href={listing.google_maps_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg">📍 Open Map</a>}
                    {listing.website && <a href={listing.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg">Visit Website</a>}
                  </div>}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
