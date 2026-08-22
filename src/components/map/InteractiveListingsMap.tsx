'use client'

import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

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

const typeLabels: Record<string, string> = {
  annadhanam: 'Annadhanam',
  jeeva_samadhi: 'Jeeva Samadhi',
  temple: 'Temple & Meditation Centre',
  stay: 'Affordable Stay',
  community_service: 'Community Service',
  medical: 'Medical Service',
}

const markerIcon = L.divIcon({
  className: '',
  html: '<div style="width:30px;height:30px;border-radius:9999px;background:#047857;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:white;font-size:15px">●</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -16],
})

function FitMarkers({ listings }: { listings: MapListing[] }) {
  const map = useMap()
  useEffect(() => {
    if (!listings.length) return
    if (listings.length === 1) {
      map.setView([listings[0].latitude, listings[0].longitude], 13)
      return
    }
    map.fitBounds(L.latLngBounds(listings.map((item) => [item.latitude, item.longitude] as [number, number])), { padding: [35, 35] })
  }, [listings, map])
  return null
}

export default function InteractiveListingsMap({ listings }: { listings: MapListing[] }) {
  const categories = useMemo(() => Array.from(new Set(listings.map((item) => item.listing_type))), [listings])
  const [category, setCategory] = useState('all')
  const filtered = category === 'all' ? listings : listings.filter((item) => item.listing_type === category)

  if (!listings.length) {
    return <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No coordinate-based markers yet</h2><p className="text-gray-600 mt-2">Approved listings will appear on the interactive map once latitude and longitude are available.</p></div>
  }

  return (
    <section className="mb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
        <div><h2 className="text-2xl font-bold text-gray-900">Interactive Map</h2><p className="text-sm text-gray-600 mt-1">Showing {filtered.length} of {listings.length} mapped locations.</p></div>
        <div className="min-w-60"><label htmlFor="map-category" className="block text-sm font-semibold text-gray-700 mb-1">Filter by category</label><select id="map-category" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{typeLabels[item] || item}</option>)}</select></div>
      </div>
      <div className="h-[520px] rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMarkers listings={filtered} />
          {filtered.map((listing) => (
            <Marker key={listing.id} position={[listing.latitude, listing.longitude]} icon={markerIcon}>
              <Popup>
                <div className="min-w-52"><p className="text-xs font-semibold text-emerald-700">{typeLabels[listing.listing_type] || listing.listing_type}</p><p className="font-bold text-base mt-1">{listing.name}</p><p className="text-sm text-gray-600 mt-1">{[listing.village, listing.taluk, listing.district_name, listing.state_name].filter(Boolean).join(', ')}</p>{listing.google_maps_url && <a href={listing.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 font-semibold text-emerald-700">Open in Google Maps →</a>}</div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  )
}
