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
  state_id?: number | null
  district_id?: number | null
  sub_district_id?: number | null
  taluk?: string | null
  panchayat?: string | null
  village?: string | null
  google_maps_url?: string | null
  website?: string | null
  states?: LocationName
  districts?: LocationName
}

type SubDistrict = { id: number; name: string; state_id?: number | null; district_id?: number | null }
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

  const selectedDistrictId = useMemo(() => listings.find(l => l.districts?.name === selectedDistrict && (!selectedState || l.states?.name === selectedState))?.district_id ?? null, [listings, selectedState, selectedDistrict])
  const availableSubDistricts = useMemo(() => !selectedDistrictId ? [] : subDistricts.filter(s => s.district_id === selectedDistrictId).sort((a,b) => a.name.localeCompare(b.name)), [subDistricts, selectedDistrictId])
  const selectedSubDistrictRecord = useMemo(() => availableSubDistricts.find(s => String(s.id) === selectedSubDistrict), [availableSubDistricts, selectedSubDistrict])

  const filteredListings = useMemo(() => {
    if (!hasFilters) return []
    const searchText = search.trim().toLowerCase()
    return listings.filter(listing => {
      const details = categoryDetails[listing.listing_type]
      const searchableText = [listing.name, listing.description, details?.label, listing.states?.name, listing.districts?.name, listing.taluk, listing.panchayat, listing.village].filter(Boolean).join(' ').toLowerCase()
      const matchesSubDistrict = !selectedSubDistrictRecord || listing.sub_district_id === selectedSubDistrictRecord.id || listing.taluk?.trim().toLowerCase() === selectedSubDistrictRecord.name.trim().toLowerCase()
      return (!searchText || searchableText.includes(searchText)) && (!category || listing.listing_type === category) && (!selectedState || listing.states?.name === selectedState) && (!selectedDistrict || listing.districts?.name === selectedDistrict) && matchesSubDistrict
    })
  }, [listings, search, category, selectedState, selectedDistrict, selectedSubDistrictRecord, hasFilters])

  function handleCategoryChange(v:string){setCategory(v);setSelectedState('');setSelectedDistrict('');setSelectedSubDistrict('')}
  function handleStateChange(v:string){setSelectedState(v);setSelectedDistrict('');setSelectedSubDistrict('')}
  function handleDistrictChange(v:string){setSelectedDistrict(v);setSelectedSubDistrict('')}
  function clearFilters(){setSearch('');setCategory('');setSelectedState('');setSelectedDistrict('');setSelectedSubDistrict('')}

  return <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50"><div className="max-w-7xl mx-auto">
    <div className="text-center mb-8"><p className="text-sm font-semibold text-emerald-700 mb-2">Search Our Listings</p><h2 className="text-3xl font-bold text-gray-900">Find Services Near You</h2><p className="text-gray-600 mt-3 max-w-2xl mx-auto">Search by category and location using State → District → Taluk / Mandal.</p></div>
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 md:p-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div><label htmlFor="home-search" className="block text-sm font-semibold text-gray-700 mb-2">Search</label><input id="home-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name or location..." className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500" /></div>
      <div><label htmlFor="home-category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label><select id="home-category" value={category} onChange={e=>handleCategoryChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"><option value="">All Categories</option>{Object.entries(categoryDetails).map(([v,d])=><option key={v} value={v}>{d.label}</option>)}</select></div>
      <div><label htmlFor="home-state" className="block text-sm font-semibold text-gray-700 mb-2">State</label><select id="home-state" value={selectedState} onChange={e=>handleStateChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"><option value="">All States</option>{states.map(s=><option key={s}>{s}</option>)}</select></div>
      <div><label htmlFor="home-district" className="block text-sm font-semibold text-gray-700 mb-2">District</label><select id="home-district" value={selectedDistrict} onChange={e=>handleDistrictChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white"><option value="">All Districts</option>{districts.map(d=><option key={d}>{d}</option>)}</select></div>
      <div><label htmlFor="home-subdistrict" className="block text-sm font-semibold text-gray-700 mb-2">Taluk / Mandal</label><select id="home-subdistrict" value={selectedSubDistrict} onChange={e=>setSelectedSubDistrict(e.target.value)} disabled={!selectedDistrictId} className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-400"><option value="">All Taluks / Mandals</option>{availableSubDistricts.map(s=><option key={s.id} value={String(s.id)}>{s.name}</option>)}</select></div>
    </div>{!hasFilters&&<p className="mt-6 border-t pt-6 text-center text-gray-600">Search by service name or select a category and location.</p>}{hasFilters&&<div className="mt-6 border-t pt-5 flex justify-between gap-3"><p className="text-sm text-gray-600">Found <b>{filteredListings.length}</b> {filteredListings.length===1?'listing':'listings'}</p><button onClick={clearFilters} className="text-sm font-semibold text-emerald-700">Clear Search & Filters</button></div>}</div>
    {hasFilters&&filteredListings.length===0&&<div className="mt-6 bg-white border rounded-xl p-8 text-center"><h3 className="text-xl font-semibold">No matching services found</h3><p className="text-gray-600 mt-2">Try another search term, category or location.</p></div>}
    {hasFilters&&filteredListings.length>0&&<div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{filteredListings.map(l=>{const d=categoryDetails[l.listing_type];return <article key={l.id} className="bg-white border rounded-xl p-5 shadow-sm"><h3 className="text-lg font-bold">{l.name}</h3>{d&&<p className="text-xs font-semibold text-emerald-700 mt-2">{d.icon} {d.label}</p>}{l.description&&<p className="text-sm text-gray-600 mt-3 line-clamp-3">{l.description}</p>}<div className="mt-4 text-sm space-y-1">{l.states?.name&&<p><b>State:</b> {l.states.name}</p>}{l.districts?.name&&<p><b>District:</b> {l.districts.name}</p>}{l.taluk&&<p><b>Taluk / Mandal:</b> {l.taluk}</p>}{l.village&&<p><b>Place:</b> {l.village}</p>}</div><div className="mt-5 flex gap-2">{d&&<Link href={d.href} className="px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg">View Category</Link>}{l.google_maps_url&&<a href={l.google_maps_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border rounded-lg text-sm font-semibold">📍 Google Maps</a>}</div></article>})}</div>}
  </div></section>
}
