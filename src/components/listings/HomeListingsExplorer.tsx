'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

type LocationName = { name: string } | null

export type HomePublicListing = {
  id: string | number
  listing_type: string
  name: string
  description?: string | null
  timing?: string | null
  sub_district_id?: number | null
  taluk?: string | null
  panchayat?: string | null
  village?: string | null
  google_maps_url?: string | null
  website?: string | null
  states?: LocationName
  districts?: LocationName
}

type SubDistrict = {
  id: number
  name: string
  state_id?: number | null
  district_id?: number | null
  states?: LocationName
  districts?: LocationName
}

type Props = { listings: HomePublicListing[]; subDistricts: SubDistrict[] }

const categoryDetails: Record<string, { label: string; icon: string; href: string }> = {
  annadhanam: { label: 'Annadhanam', icon: '🍛', href: '/annadhanam' },
  jeeva_samadhi: { label: 'Jeeva Samadhi', icon: '🕉️', href: '/jeeva-samadhi' },
  temple: { label: 'Temples & Meditation Centres', icon: '🛕', href: '/temple' },
  stay: { label: 'Affordable Stays', icon: '🏠', href: '/stay' },
  medical: { label: 'Affordable Healthcare', icon: '🏥', href: '/medical' },
  education: { label: 'Affordable Education', icon: '🎓', href: '/education' },
  volunteer: { label: 'Volunteer & Community Service', icon: '🤝', href: '/volunteer' },
}

export default function HomeListingsExplorer({ listings, subDistricts }: Props) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedSubDistrict, setSelectedSubDistrict] = useState('')

  const hasFilters = Boolean(search.trim() || category || selectedState || selectedDistrict || selectedSubDistrict)

  const states = useMemo(() => Array.from(new Set(listings.filter(l => !category || l.listing_type === category).map(l => l.states?.name).filter((n): n is string => Boolean(n)))).sort((a,b) => a.localeCompare(b)), [listings, category])

  const districts = useMemo(() => Array.from(new Set(listings.filter(l => (!category || l.listing_type === category) && (!selectedState || l.states?.name === selectedState)).map(l => l.districts?.name).filter((n): n is string => Boolean(n)))).sort((a,b) => a.localeCompare(b)), [listings, category, selectedState])

  const availableSubDistricts = useMemo(() => {
    if (!selectedDistrict) return []
    return subDistricts
      .filter(s => (!selectedState || s.states?.name === selectedState) && s.districts?.name === selectedDistrict)
      .sort((a,b) => a.name.localeCompare(b.name))
  }, [subDistricts, selectedState, selectedDistrict])

  const selectedSubDistrictRecord = useMemo(() => availableSubDistricts.find(s => String(s.id) === selectedSubDistrict), [availableSubDistricts, selectedSubDistrict])

  const filteredListings = useMemo(() => {
    if (!hasFilters) return []
    const searchText = search.trim().toLowerCase()
    return listings.filter(listing => {
      const categoryInfo = categoryDetails[listing.listing_type]
      const searchableText = [listing.name, listing.description, categoryInfo?.label, listing.states?.name, listing.districts?.name, listing.taluk, listing.panchayat, listing.village].filter(Boolean).join(' ').toLowerCase()
      const matchesSubDistrict = !selectedSubDistrictRecord || listing.sub_district_id === selectedSubDistrictRecord.id || (listing.taluk && listing.taluk.trim().toLowerCase() === selectedSubDistrictRecord.name.trim().toLowerCase())
      return (!searchText || searchableText.includes(searchText)) && (!category || listing.listing_type === category) && (!selectedState || listing.states?.name === selectedState) && (!selectedDistrict || listing.districts?.name === selectedDistrict) && matchesSubDistrict
    })
  }, [listings, search, category, selectedState, selectedDistrict, selectedSubDistrictRecord, hasFilters])

  function handleCategoryChange(value: string) { setCategory(value); setSelectedState(''); setSelectedDistrict(''); setSelectedSubDistrict('') }
  function handleStateChange(value: string) { setSelectedState(value); setSelectedDistrict(''); setSelectedSubDistrict('') }
  function handleDistrictChange(value: string) { setSelectedDistrict(value); setSelectedSubDistrict('') }
  function clearFilters() { setSearch(''); setCategory(''); setSelectedState(''); setSelectedDistrict(''); setSelectedSubDistrict('') }

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-sm font-semibold text-emerald-700 mb-2">Search Our Listings</p>
          <h2 className="text-3xl font-bold text-gray-900">Find Services Near You</h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Search by category and location using State → District → Taluk / Mandal.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div><label htmlFor="home-search" className="block text-sm font-semibold text-gray-700 mb-2">Search</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span><input id="home-search" type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or location..." className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" /></div></div>
            <div><label htmlFor="home-category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label><select id="home-category" value={category} onChange={e => handleCategoryChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"><option value="">All Categories</option>{Object.entries(categoryDetails).map(([value,d]) => <option key={value} value={value}>{d.label}</option>)}</select></div>
            <div><label htmlFor="home-state" className="block text-sm font-semibold text-gray-700 mb-2">State</label><select id="home-state" value={selectedState} onChange={e => handleStateChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"><option value="">All States</option>{states.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label htmlFor="home-district" className="block text-sm font-semibold text-gray-700 mb-2">District</label><select id="home-district" value={selectedDistrict} onChange={e => handleDistrictChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500"><option value="">All Districts</option>{districts.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
            <div><label htmlFor="home-subdistrict" className="block text-sm font-semibold text-gray-700 mb-2">Taluk / Mandal</label><select id="home-subdistrict" value={selectedSubDistrict} onChange={e => setSelectedSubDistrict(e.target.value)} disabled={!selectedDistrict} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 disabled:text-gray-400"><option value="">All Taluks / Mandals</option>{availableSubDistricts.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}</select></div>
          </div>

          {!hasFilters && <div className="mt-6 border-t border-gray-100 pt-6 text-center"><p className="text-gray-600">Search by service name or select a category and location.</p></div>}
          {hasFilters && <div className="mt-6 border-t border-gray-100 pt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-gray-600">Found <span className="font-semibold text-gray-900">{filteredListings.length}</span> {filteredListings.length === 1 ? 'listing' : 'listings'}</p><button type="button" onClick={clearFilters} className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Clear Search & Filters</button></div>}
        </div>

        {hasFilters && filteredListings.length === 0 && <div className="mt-6 bg-white border border-gray-200 rounded-xl p-8 text-center"><h3 className="text-xl font-semibold text-gray-900">No matching services found</h3><p className="text-gray-600 mt-2">Try another search term, category or location.</p></div>}
        {hasFilters && filteredListings.length > 0 && <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredListings.map(listing => { const details = categoryDetails[listing.listing_type]; return <article key={listing.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold text-gray-900">{listing.name}</h3>{details && <span className="text-xl shrink-0">{details.icon}</span>}</div>{details && <p className="text-xs font-semibold text-emerald-700 mt-2">{details.label}</p>}{listing.description && <p className="text-sm text-gray-600 mt-3 line-clamp-3">{listing.description}</p>}<div className="mt-4 text-sm text-gray-700 space-y-1">{listing.states?.name && <p><span className="font-semibold">State:</span> {listing.states.name}</p>}{listing.districts?.name && <p><span className="font-semibold">District:</span> {listing.districts.name}</p>}{listing.taluk && <p><span className="font-semibold">Taluk / Mandal:</span> {listing.taluk}</p>}{listing.village && <p><span className="font-semibold">Place:</span> {listing.village}</p>}</div><div className="mt-5 flex flex-wrap gap-2">{details && <Link href={details.href} className="inline-flex px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition">View Category</Link>}{listing.google_maps_url && <a href={listing.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition">📍 Google Maps</a>}</div></article>})}</div>}
      </div>
    </section>
  )
}
