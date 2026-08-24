'use client'

import dynamic from 'next/dynamic'

type MapListing = {
  id: number
  name: string
  listing_type: string
  latitude: number
  longitude: number
  google_maps_url: string | null
  village: string | null
  taluk: string | null
  state_name: string | null
  district_name: string | null
}

const InteractiveListingsMap = dynamic(
  () => import('./InteractiveListingsMap'),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white border border-gray-200 rounded-xl p-8 text-center mb-10">
        <h2 className="text-xl font-semibold text-gray-900">Loading Interactive Map…</h2>
        <p className="text-gray-600 mt-2">Preparing mapped service locations.</p>
      </div>
    ),
  }
)

export default function InteractiveListingsMapLoader({ listings }: { listings: MapListing[] }) {
  return <InteractiveListingsMap listings={listings} />
}
