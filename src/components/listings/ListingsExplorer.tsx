'use client'

import { useMemo, useState } from 'react'

// =====================================================
// TYPES
// =====================================================

type LocationName = {
  name: string
} | null

export type PublicListing = {
  id: string | number
  name: string
  description?: string | null
  timing?: string | null

  // Community Service
  service_type?: string | null

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

  // Enable only for Community Service page
  showServiceTypeFilter?: boolean
}

// =====================================================
// COMMUNITY SERVICE LABELS
// =====================================================

function getServiceTypeLabel(type?: string | null) {
  const labels: Record<string, string> = {
    ulavara_pani: 'Ulavara Pani',
    water_body_restoration: 'Water Body Restoration',
    tree_planting: 'Tree Planting',
    environmental_conservation: 'Environmental Conservation',
    temple_service: 'Temple Service',
    heritage_conservation: 'Heritage Conservation',
    food_service: 'Annadhanam / Food Service',
    animal_welfare: 'Animal Welfare',
    community_social_service: 'Community / Social Service',
    other: 'Other',
  }

  if (!type) {
    return ''
  }

  return labels[type] || type
}

// =====================================================
// COMMUNITY SERVICE ICONS
// =====================================================

function getServiceTypeIcon(type?: string | null) {
  const icons: Record<string, string> = {
    ulavara_pani: '🧹',
    water_body_restoration: '💧',
    tree_planting: '🌳',
    environmental_conservation: '🌱',
    temple_service: '🛕',
    heritage_conservation: '🏛️',
    food_service: '🍛',
    animal_welfare: '🐾',
    community_social_service: '🤝',
    other: '🌿',
  }

  if (!type) {
    return '🌿'
  }

  return icons[type] || '🌿'
}

// =====================================================
// COMPONENT
// =====================================================

export default function ListingsExplorer({
  listings,
  badgeLabel,
  showServiceTypeFilter = false,
}: ListingsExplorerProps) {

  // ===================================================
  // STATE
  // ===================================================

  const [search, setSearch] = useState('')

  const [selectedServiceType, setSelectedServiceType] =
    useState('')

  const [selectedState, setSelectedState] =
    useState('')

  const [selectedDistrict, setSelectedDistrict] =
    useState('')

  const [viewMode, setViewMode] =
    useState<'grid' | 'list'>('grid')

  // ===================================================
  // UNIQUE SERVICE TYPES
  // ===================================================

  const serviceTypes = useMemo(() => {
    return Array.from(
      new Set(
        listings
          .map((listing) => listing.service_type)
          .filter(
            (type): type is string =>
              Boolean(type)
          )
      )
    ).sort((a, b) =>
      getServiceTypeLabel(a).localeCompare(
        getServiceTypeLabel(b)
      )
    )
  }, [listings])

  // ===================================================
  // UNIQUE STATES
  // ===================================================

  const states = useMemo(() => {
    return Array.from(
      new Set(
        listings
          .map((listing) => listing.states?.name)
          .filter(
            (name): name is string =>
              Boolean(name)
          )
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    )
  }, [listings])

  // ===================================================
  // DISTRICTS BASED ON SELECTED STATE
  // ===================================================

  const districts = useMemo(() => {
    return Array.from(
      new Set(
        listings
          .filter((listing) => {

            if (!selectedState) {
              return true
            }

            return (
              listing.states?.name ===
              selectedState
            )
          })
          .map(
            (listing) =>
              listing.districts?.name
          )
          .filter(
            (name): name is string =>
              Boolean(name)
          )
      )
    ).sort((a, b) =>
      a.localeCompare(b)
    )
  }, [listings, selectedState])

  // ===================================================
  // SEARCH + FILTER
  // ===================================================

  const filteredListings = useMemo(() => {

    const searchText =
      search.trim().toLowerCase()

    return listings.filter((listing) => {

      const serviceTypeLabel =
        getServiceTypeLabel(
          listing.service_type
        )

      // -----------------------------------------------
      // SEARCHABLE TEXT
      // -----------------------------------------------

      const searchableText = [
        listing.name,
        listing.description,
        serviceTypeLabel,
        listing.states?.name,
        listing.districts?.name,
        listing.taluk,
        listing.panchayat,
        listing.village,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      // -----------------------------------------------
      // SEARCH
      // -----------------------------------------------

      const matchesSearch =
        !searchText ||
        searchableText.includes(
          searchText
        )

      // -----------------------------------------------
      // SERVICE TYPE
      // -----------------------------------------------

      const matchesServiceType =
        !showServiceTypeFilter ||
        !selectedServiceType ||
        listing.service_type ===
          selectedServiceType

      // -----------------------------------------------
      // STATE
      // -----------------------------------------------

      const matchesState =
        !selectedState ||
        listing.states?.name ===
          selectedState

      // -----------------------------------------------
      // DISTRICT
      // -----------------------------------------------

      const matchesDistrict =
        !selectedDistrict ||
        listing.districts?.name ===
          selectedDistrict

      return (
        matchesSearch &&
        matchesServiceType &&
        matchesState &&
        matchesDistrict
      )
    })

  }, [
    listings,
    search,
    selectedServiceType,
    selectedState,
    selectedDistrict,
    showServiceTypeFilter,
  ])

  // ===================================================
  // ACTIVE FILTER CHECK
  // ===================================================

  const hasFilters =
    search !== '' ||
    selectedState !== '' ||
    selectedDistrict !== '' ||
    (
      showServiceTypeFilter &&
      selectedServiceType !== ''
    )

  // ===================================================
  // CLEAR FILTERS
  // ===================================================

  function clearFilters() {

    setSearch('')

    setSelectedServiceType('')

    setSelectedState('')

    setSelectedDistrict('')

  }

  // ===================================================
  // STATE CHANGE
  // ===================================================

  function handleStateChange(
    value: string
  ) {

    setSelectedState(value)

    // Reset district whenever state changes
    setSelectedDistrict('')

  }

  // ===================================================
  // WHATSAPP LINK
  // ===================================================

  function getWhatsAppLink(
    number: string
  ) {

    const cleanNumber =
      number.replace(/\D/g, '')

    return `https://wa.me/${cleanNumber}`

  }

  // ===================================================
  // PAGE
  // ===================================================

  return (
    <div>

      {/* ===============================================
          SEARCH + FILTER PANEL
      =============================================== */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">

        <div
          className={`grid grid-cols-1 gap-4 ${
            showServiceTypeFilter
              ? 'md:grid-cols-2 lg:grid-cols-4'
              : 'md:grid-cols-3'
          }`}
        >

          {/* ===========================================
              SEARCH
          =========================================== */}

          <div>

            <label
              htmlFor="listing-search"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Search
            </label>

            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔎
              </span>

              <input
                id="listing-search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder={
                  showServiceTypeFilter
                    ? 'Search group, service or location...'
                    : 'Search name or location...'
                }
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />

            </div>

          </div>

          {/* ===========================================
              SERVICE TYPE
              COMMUNITY SERVICE ONLY
          =========================================== */}

          {showServiceTypeFilter && (

            <div>

              <label
                htmlFor="service-type-filter"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Service Type
              </label>

              <select
                id="service-type-filter"
                value={
                  selectedServiceType
                }
                onChange={(event) =>
                  setSelectedServiceType(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >

                <option value="">
                  All Service Types
                </option>

                {serviceTypes.map(
                  (serviceType) => (

                    <option
                      key={serviceType}
                      value={serviceType}
                    >
                      {getServiceTypeLabel(
                        serviceType
                      )}
                    </option>

                  )
                )}

              </select>

            </div>

          )}

          {/* ===========================================
              STATE
          =========================================== */}

          <div>

            <label
              htmlFor="state-filter"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              State
            </label>

            <select
              id="state-filter"
              value={selectedState}
              onChange={(event) =>
                handleStateChange(
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >

              <option value="">
                All States
              </option>

              {states.map((state) => (

                <option
                  key={state}
                  value={state}
                >
                  {state}
                </option>

              ))}

            </select>

          </div>

          {/* ===========================================
              DISTRICT
          =========================================== */}

          <div>

            <label
              htmlFor="district-filter"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              District
            </label>

            <select
              id="district-filter"
              value={selectedDistrict}
              onChange={(event) =>
                setSelectedDistrict(
                  event.target.value
                )
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 bg-white outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >

              <option value="">
                All Districts
              </option>

              {districts.map(
                (district) => (

                  <option
                    key={district}
                    value={district}
                  >
                    {district}
                  </option>

                )
              )}

            </select>

          </div>

        </div>

        {/* =============================================
            RESULT COUNT + CONTROLS
        ============================================= */}

        <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div className="flex flex-wrap items-center gap-3">

            <p className="text-sm text-gray-600">

              Showing{' '}

              <span className="font-semibold text-gray-900">
                {filteredListings.length}
              </span>{' '}

              {filteredListings.length === 1
                ? 'listing'
                : 'listings'}

            </p>

            {hasFilters && (

              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Clear Filters
              </button>

            )}

          </div>

          {/* ===========================================
              GRID / LIST
          =========================================== */}

          <div className="inline-flex border border-gray-300 rounded-lg overflow-hidden self-start">

            <button
              type="button"
              onClick={() =>
                setViewMode('grid')
              }
              className={`px-4 py-2 text-sm font-semibold transition ${
                viewMode === 'grid'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ▦ Grid
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode('list')
              }
              className={`px-4 py-2 text-sm font-semibold border-l border-gray-300 transition ${
                viewMode === 'list'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              ☰ List
            </button>

          </div>

        </div>

      </div>

      {/* ===============================================
          NO FILTER RESULTS
      =============================================== */}

      {filteredListings.length === 0 && (

        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

          <h2 className="text-xl font-semibold text-gray-900">
            No matching listings found
          </h2>

          <p className="text-gray-600 mt-2">
            Try another search term or change the filters.
          </p>

          {hasFilters && (

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex mt-5 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition"
            >
              Clear Filters
            </button>

          )}

        </div>

      )}

      {/* ===============================================
          LISTINGS
      =============================================== */}

      {filteredListings.length > 0 && (

        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
              : 'flex flex-col gap-4'
          }
        >

          {filteredListings.map(
            (listing) => (

              <article
                key={listing.id}
                className={`bg-white border border-gray-200 rounded-xl shadow-sm ${
                  viewMode === 'grid'
                    ? 'p-6'
                    : 'p-5'
                }`}
              >

                {/* =====================================
                    NAME + BADGES
                ===================================== */}

                <div className="mb-4">

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                    <div>

                      <h2 className="text-xl font-bold text-gray-900">
                        {listing.name}
                      </h2>

                      {/* SERVICE TYPE */}

                      {showServiceTypeFilter &&
                        listing.service_type && (

                          <div className="mt-2">

                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full">

                              <span>
                                {getServiceTypeIcon(
                                  listing.service_type
                                )}
                              </span>

                              <span>
                                {getServiceTypeLabel(
                                  listing.service_type
                                )}
                              </span>

                            </span>

                          </div>

                        )}

                    </div>

                    {/* GENERAL BADGE */}

                    <span className="self-start shrink-0 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                      {badgeLabel}
                    </span>

                  </div>

                  {/* DESCRIPTION */}

                  {listing.description && (

                    <p className="text-gray-600 mt-3">
                      {listing.description}
                    </p>

                  )}

                </div>

                {/* =====================================
                    TIMING
                ===================================== */}

                {listing.timing && (

                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-5">

                    <p className="text-sm font-semibold text-emerald-800 mb-1">
                      🕐 Timing / Schedule
                    </p>

                    <p className="text-gray-800 whitespace-pre-line">
                      {listing.timing}
                    </p>

                  </div>

                )}

                {/* =====================================
                    LOCATION + CONTACT
                ===================================== */}

                <div
                  className={
                    viewMode === 'list'
                      ? 'grid grid-cols-1 lg:grid-cols-2 gap-6'
                      : ''
                  }
                >

                  {/* ===================================
                      LOCATION
                  =================================== */}

                  <div className="border-t border-gray-100 pt-4">

                    <h3 className="font-semibold text-gray-900 mb-3">
                      Location
                    </h3>

                    <div className="space-y-2 text-sm text-gray-700">

                      <p>

                        <span className="font-semibold">
                          State:
                        </span>{' '}

                        {listing.states?.name || '-'}

                      </p>

                      <p>

                        <span className="font-semibold">
                          District:
                        </span>{' '}

                        {listing.districts?.name || '-'}

                      </p>

                      {listing.taluk && (

                        <p>

                          <span className="font-semibold">
                            Taluk / Sub-District:
                          </span>{' '}

                          {listing.taluk}

                        </p>

                      )}

                      {listing.panchayat && (

                        <p>

                          <span className="font-semibold">
                            Panchayat / Municipality:
                          </span>{' '}

                          {listing.panchayat}

                        </p>

                      )}

                      {listing.village && (

                        <p>

                          <span className="font-semibold">
                            Village / Town:
                          </span>{' '}

                          {listing.village}

                        </p>

                      )}

                    </div>

                  </div>

                  {/* ===================================
                      CONTACT
                  =================================== */}

                  <div
                    className={`border-t border-gray-100 pt-4 ${
                      viewMode === 'grid'
                        ? 'mt-5'
                        : ''
                    }`}
                  >

                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contact
                    </h3>

                    <div className="space-y-2 text-sm text-gray-700">

                      {listing.contact_person && (

                        <p>

                          <span className="font-semibold">
                            Contact Person:
                          </span>{' '}

                          {listing.contact_person}

                        </p>

                      )}

                      {listing.phone && (

                        <p>

                          <span className="font-semibold">
                            Phone:
                          </span>{' '}

                          <a
                            href={`tel:${listing.phone}`}
                            className="text-emerald-700 hover:underline"
                          >
                            {listing.phone}
                          </a>

                        </p>

                      )}

                      {listing.whatsapp && (

                        <p>

                          <span className="font-semibold">
                            WhatsApp:
                          </span>{' '}

                          <a
                            href={getWhatsAppLink(
                              listing.whatsapp
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:underline"
                          >
                            {listing.whatsapp}
                          </a>

                        </p>

                      )}

                      {listing.email && (

                        <p>

                          <span className="font-semibold">
                            Email:
                          </span>{' '}

                          <a
                            href={`mailto:${listing.email}`}
                            className="text-emerald-700 hover:underline"
                          >
                            {listing.email}
                          </a>

                        </p>

                      )}

                    </div>

                  </div>

                </div>

                {/* =====================================
                    QUICK ACTIONS / LINKS
                ===================================== */}

                {(listing.phone ||
                  listing.whatsapp ||
                  listing.google_maps_url ||
                  listing.website) && (

                  <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap gap-3">

                    {/* CALL */}

                    {listing.phone && (

                      <a
                        href={`tel:${listing.phone}`}
                        className="inline-flex items-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition"
                      >
                        📞 Call
                      </a>

                    )}

                    {/* WHATSAPP */}

                    {listing.whatsapp && (

                      <a
                        href={getWhatsAppLink(
                          listing.whatsapp
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition"
                      >
                        💬 WhatsApp
                      </a>

                    )}

                    {/* MAP */}

                    {listing.google_maps_url && (

                      <a
                        href={
                          listing.google_maps_url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
                      >
                        📍 Open Map
                      </a>

                    )}

                    {/* WEBSITE */}

                    {listing.website && (

                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                      >
                        🌐 Visit Website
                      </a>

                    )}

                  </div>

                )}

              </article>

            )
          )}

        </div>

      )}

    </div>
  )
}