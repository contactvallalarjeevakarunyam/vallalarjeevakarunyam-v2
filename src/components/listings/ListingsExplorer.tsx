'use client'

import { useMemo, useState } from 'react'

type LocationName = { name: string } | null

export type PublicListing = {
  id: string | number
  name: string
  description?: string | null
  timing?: string | null
  service_type?: string | null
  verification_status?: string | null
  image_url?: string | null
  taluk?: string | null
  panchayat?: string | null
  village?: string | null
  contact_person?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  google_maps_url?: string | null
  website?: string | null
  states?: LocationName
  districts?: LocationName
}

type ListingsExplorerProps = {
  listings: PublicListing[]
  badgeLabel: string
  showServiceTypeFilter?: boolean
  showVerificationBadge?: boolean
}

function getServiceTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    ulavara_pani: 'Ulavara Pani', water_body_restoration: 'Water Body Restoration', tree_planting: 'Tree Planting', environmental_conservation: 'Environmental Conservation', temple_service: 'Temple Service', heritage_conservation: 'Heritage Conservation', food_service: 'Annadhanam / Food Service', animal_welfare: 'Animal Welfare', community_social_service: 'Community / Social Service', other: 'Other',
  }
  return type ? labels[type] || type : ''
}

function getServiceTypeIcon(type?: string | null) {
  const icons: Record<string, string> = { ulavara_pani: '🧹', water_body_restoration: '💧', tree_planting: '🌳', environmental_conservation: '🌱', temple_service: '🛕', heritage_conservation: '🏛️', food_service: '🍛', animal_welfare: '🐾', community_social_service: '🤝', other: '🌿' }
  return type ? icons[type] || '🌿' : '🌿'
}

export default function ListingsExplorer({ listings, badgeLabel, showServiceTypeFilter = false, showVerificationBadge = true }: ListingsExplorerProps) {
  const [search, setSearch] = useState('')
  const [selectedServiceType, setSelectedServiceType] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const serviceTypes = useMemo(() => Array.from(new Set(listings.map(l => l.service_type).filter((x): x is string => Boolean(x)))).sort((a,b) => getServiceTypeLabel(a).localeCompare(getServiceTypeLabel(b))), [listings])
  const states = useMemo(() => Array.from(new Set(listings.map(l => l.states?.name).filter((x): x is string => Boolean(x)))).sort((a,b) => a.localeCompare(b)), [listings])
  const districts = useMemo(() => Array.from(new Set(listings.filter(l => !selectedState || l.states?.name === selectedState).map(l => l.districts?.name).filter((x): x is string => Boolean(x)))).sort((a,b) => a.localeCompare(b)), [listings, selectedState])

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase()
    return listings.filter(listing => {
      const text = [listing.name, listing.description, getServiceTypeLabel(listing.service_type), listing.states?.name, listing.districts?.name, listing.taluk, listing.panchayat, listing.village].filter(Boolean).join(' ').toLowerCase()
      return (!q || text.includes(q)) && (!showServiceTypeFilter || !selectedServiceType || listing.service_type === selectedServiceType) && (!selectedState || listing.states?.name === selectedState) && (!selectedDistrict || listing.districts?.name === selectedDistrict)
    })
  }, [listings, search, selectedServiceType, selectedState, selectedDistrict, showServiceTypeFilter])

  const hasFilters = search !== '' || selectedState !== '' || selectedDistrict !== '' || (showServiceTypeFilter && selectedServiceType !== '')
  function clearFilters() { setSearch(''); setSelectedServiceType(''); setSelectedState(''); setSelectedDistrict('') }
  function handleStateChange(value: string) { setSelectedState(value); setSelectedDistrict('') }
  function getWhatsAppLink(number: string) { return `https://wa.me/${number.replace(/\D/g, '')}` }

  return <div>
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
      <div className={`grid grid-cols-1 gap-4 ${showServiceTypeFilter ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        <div><label htmlFor="listing-search" className="block text-sm font-semibold text-gray-700 mb-2">Search</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span><input id="listing-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={showServiceTypeFilter ? 'Search group, service or location...' : 'Search name or location...'} className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" /></div></div>
        {showServiceTypeFilter && <div><label htmlFor="service-type-filter" className="block text-sm font-semibold text-gray-700 mb-2">Service Type</label><select id="service-type-filter" value={selectedServiceType} onChange={e => setSelectedServiceType(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white"><option value="">All Service Types</option>{serviceTypes.map(t => <option key={t} value={t}>{getServiceTypeLabel(t)}</option>)}</select></div>}
        <div><label htmlFor="state-filter" className="block text-sm font-semibold text-gray-700 mb-2">State</label><select id="state-filter" value={selectedState} onChange={e => handleStateChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white"><option value="">All States</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label htmlFor="district-filter" className="block text-sm font-semibold text-gray-700 mb-2">District</label><select id="district-filter" value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white"><option value="">All Districts</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
      </div>
      <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div className="flex flex-wrap items-center gap-3"><p className="text-sm text-gray-600">Showing <span className="font-semibold text-gray-900">{filteredListings.length}</span> {filteredListings.length === 1 ? 'listing' : 'listings'}</p>{hasFilters && <button type="button" onClick={clearFilters} className="text-sm font-semibold text-emerald-700">Clear Filters</button>}</div><div className="inline-flex border border-gray-300 rounded-lg overflow-hidden self-start"><button type="button" onClick={() => setViewMode('grid')} className={`px-4 py-2 text-sm font-semibold ${viewMode === 'grid' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-700'}`}>▦ Grid</button><button type="button" onClick={() => setViewMode('list')} className={`px-4 py-2 text-sm font-semibold border-l border-gray-300 ${viewMode === 'list' ? 'bg-emerald-700 text-white' : 'bg-white text-gray-700'}`}>☰ List</button></div></div>
    </div>

    {filteredListings.length === 0 && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No matching listings found</h2><p className="text-gray-600 mt-2">Try another search term or change the filters.</p>{hasFilters && <button type="button" onClick={clearFilters} className="inline-flex mt-5 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg">Clear Filters</button>}</div>}

    {filteredListings.length > 0 && <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'flex flex-col gap-4'}>{filteredListings.map(listing => {
      const verified = listing.verification_status === 'verified'
      return <article key={listing.id} className={`bg-white border rounded-xl shadow-sm overflow-hidden ${showVerificationBadge ? (verified ? 'border-emerald-200' : 'border-amber-200') : 'border-gray-200'}`}>
        {listing.image_url && <div className={`${viewMode === 'grid' ? 'h-56' : 'h-48'} w-full bg-gray-100`}><img src={listing.image_url} alt={`${listing.name} photo`} className="w-full h-full object-cover" loading="lazy" /></div>}
        <div className={viewMode === 'grid' ? 'p-6' : 'p-5'}>
          <div className="mb-4"><div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><h2 className="text-xl font-bold text-gray-900">{listing.name}</h2>{showServiceTypeFilter && listing.service_type && <div className="mt-2"><span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full">{getServiceTypeIcon(listing.service_type)} {getServiceTypeLabel(listing.service_type)}</span></div>}</div><div className="flex flex-col items-start sm:items-end gap-2"><span className="self-start sm:self-auto shrink-0 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">{badgeLabel}</span>{showVerificationBadge && <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-full border ${verified ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>{verified ? '✓ Verified by Vallalar Jeevakarunyam' : '● Yet to be verified by Vallalar Jeevakarunyam'}</span>}</div></div>{listing.description && <p className="text-gray-600 mt-3">{listing.description}</p>}</div>
          {listing.timing && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-5"><p className="text-sm font-semibold text-emerald-800 mb-1">🕐 Timing / Schedule</p><p className="text-gray-800 whitespace-pre-line">{listing.timing}</p></div>}
          <div className={viewMode === 'list' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : ''}>
            <div className="border-t border-gray-100 pt-4"><h3 className="font-semibold text-gray-900 mb-3">Location</h3><div className="space-y-2 text-sm text-gray-700"><p><span className="font-semibold">State:</span> {listing.states?.name || '-'}</p><p><span className="font-semibold">District:</span> {listing.districts?.name || '-'}</p>{listing.taluk && <p><span className="font-semibold">Taluk / Sub-District:</span> {listing.taluk}</p>}{listing.panchayat && <p><span className="font-semibold">Panchayat / Municipality:</span> {listing.panchayat}</p>}{listing.village && <p><span className="font-semibold">Village / Town:</span> {listing.village}</p>}</div></div>
            <div className={`border-t border-gray-100 pt-4 ${viewMode === 'grid' ? 'mt-5' : ''}`}><h3 className="font-semibold text-gray-900 mb-3">Contact</h3><div className="space-y-2 text-sm text-gray-700">{listing.contact_person && <p><span className="font-semibold">Contact Person:</span> {listing.contact_person}</p>}{listing.phone && <p><span className="font-semibold">Phone:</span> <a href={`tel:${listing.phone}`} className="text-emerald-700 hover:underline">{listing.phone}</a></p>}{listing.whatsapp && <p><span className="font-semibold">WhatsApp:</span> <a href={getWhatsAppLink(listing.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">{listing.whatsapp}</a></p>}{listing.email && <p><span className="font-semibold">Email:</span> <a href={`mailto:${listing.email}`} className="text-emerald-700 hover:underline">{listing.email}</a></p>}</div></div>
          </div>
          {(listing.phone || listing.whatsapp || listing.google_maps_url || listing.website) && <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap gap-3">{listing.phone && <a href={`tel:${listing.phone}`} className="inline-flex items-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg">📞 Call</a>}{listing.whatsapp && <a href={getWhatsAppLink(listing.whatsapp)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg">💬 WhatsApp</a>}{listing.google_maps_url && <a href={listing.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg">📍 Open Map</a>}{listing.website && <a href={listing.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg">🌐 Visit Website</a>}</div>}
        </div>
      </article>
    })}</div>}
  </div>
}
