import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/admin/LogoutButton'

// =====================================================
// TYPES
// =====================================================

type AdminPageProps = {
  searchParams: Promise<{
    status?: string
  }>
}

// =====================================================
// DISPLAY LABELS
// =====================================================

function getListingTypeLabel(type: string | null) {
  const labels: Record<string, string> = {
    annadhanam: 'Annadhanam',
    jeeva_samadhi: 'Jeeva Samadhi',
    temple: 'Temples & Meditation Centres',
    stay: 'Affordable Stays',
    medical: 'Affordable Medical Services',
    community_service: 'Community Service',

    // Keeps old records readable if any still exist
    volunteer: 'Volunteer Services',
  }

  return type ? labels[type] || type : '-'
}

function getServiceTypeLabel(type: string | null) {
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

  return type ? labels[type] || type : '-'
}

// =====================================================
// REVALIDATE PUBLIC PAGES
// =====================================================

function revalidateListingPages() {
  revalidatePath('/admin')
  revalidatePath('/')
  revalidatePath('/annadhanam')
  revalidatePath('/jeeva-samadhi')
  revalidatePath('/temple')
  revalidatePath('/stay')
  revalidatePath('/medical')
  revalidatePath('/volunteer')
}

// =====================================================
// PAGE
// =====================================================

export default async function AdminPage({
  searchParams,
}: AdminPageProps) {
  const supabase = await createClient()

  // =====================================================
  // LOGIN CHECK
  // =====================================================

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // =====================================================
  // ADMIN CHECK
  // =====================================================

  const { data: admin } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) {
    return (
      <main className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-4">
          Access Denied
        </h1>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          You do not have permission to access the admin area.
        </div>

      </main>
    )
  }

  // =====================================================
  // ACTIVE TAB
  // =====================================================

  const params = await searchParams

  const allowedStatuses = [
    'pending',
    'approved',
    'rejected',
  ]

  const activeStatus = allowedStatuses.includes(
    params.status || ''
  )
    ? params.status!
    : 'pending'

  // =====================================================
  // APPROVE LISTING
  // =====================================================

  async function approveListing(formData: FormData) {
    'use server'

    const listingId = Number(
      formData.get('listingId')
    )

    if (!Number.isInteger(listingId)) {
      return
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/admin/login')
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin) {
      return
    }

    const { error } = await supabase
      .from('listings')
      .update({
        status: 'approved',
      })
      .eq('id', listingId)
      .eq('status', 'pending')

    if (error) {
      console.error(
        'Approve listing error:',
        error
      )

      return
    }

    revalidateListingPages()
  }

  // =====================================================
  // REJECT LISTING
  // =====================================================

  async function rejectListing(formData: FormData) {
    'use server'

    const listingId = Number(
      formData.get('listingId')
    )

    if (!Number.isInteger(listingId)) {
      return
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect('/admin/login')
    }

    const { data: admin } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!admin) {
      return
    }

    const { error } = await supabase
      .from('listings')
      .update({
        status: 'rejected',
      })
      .eq('id', listingId)
      .eq('status', 'pending')

    if (error) {
      console.error(
        'Reject listing error:',
        error
      )

      return
    }

    revalidateListingPages()
  }

  // =====================================================
  // COUNTS
  // =====================================================

  const [
    pendingResult,
    approvedResult,
    rejectedResult,
  ] = await Promise.all([

    supabase
      .from('listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'pending'),

    supabase
      .from('listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'approved'),

    supabase
      .from('listings')
      .select('*', {
        count: 'exact',
        head: true,
      })
      .eq('status', 'rejected'),

  ])

  const pendingCount =
    pendingResult.count ?? 0

  const approvedCount =
    approvedResult.count ?? 0

  const rejectedCount =
    rejectedResult.count ?? 0

  // =====================================================
  // GET LISTINGS FOR SELECTED TAB
  // =====================================================

  const { data: listings, error } =
    await supabase
      .from('listings')
      .select(`
        *,
        states (
          name
        ),
        districts (
          name
        )
      `)
      .eq('status', activeStatus)
      .order('created_at', {
        ascending: false,
      })

  if (error) {
    return (
      <main className="max-w-6xl mx-auto p-6">

        <h1 className="text-3xl font-bold mb-4">
          Admin Dashboard
        </h1>

        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          Unable to load listings: {error.message}
        </div>

      </main>
    )
  }

  // =====================================================
  // PAGE TITLE
  // =====================================================

  const title =
    activeStatus === 'pending'
      ? 'Pending Listings'
      : activeStatus === 'approved'
        ? 'Approved Listings'
        : 'Rejected Listings'

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="max-w-6xl mx-auto p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Vallalar Jeevakarunyam Listings
          </p>

        </div>

        <LogoutButton />

      </div>

      {/* =================================================
          DASHBOARD COUNTS
      ================================================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

        {/* PENDING */}

        <Link
          href="/admin?status=pending"
          className={`rounded-xl border p-5 transition ${
            activeStatus === 'pending'
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >

          <p className="text-sm font-medium text-gray-600">
            Pending
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {pendingCount}
          </p>

        </Link>

        {/* APPROVED */}

        <Link
          href="/admin?status=approved"
          className={`rounded-xl border p-5 transition ${
            activeStatus === 'approved'
              ? 'border-emerald-500 bg-emerald-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >

          <p className="text-sm font-medium text-gray-600">
            Approved
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {approvedCount}
          </p>

        </Link>

        {/* REJECTED */}

        <Link
          href="/admin?status=rejected"
          className={`rounded-xl border p-5 transition ${
            activeStatus === 'rejected'
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 bg-white hover:bg-gray-50'
          }`}
        >

          <p className="text-sm font-medium text-gray-600">
            Rejected
          </p>

          <p className="text-3xl font-bold text-gray-900 mt-2">
            {rejectedCount}
          </p>

        </Link>

      </div>

      {/* =================================================
          CURRENT SECTION
      ================================================= */}

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-900">
          {title}
        </h2>

      </div>

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {!listings || listings.length === 0 ? (

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">

          <p className="text-gray-700">
            No {activeStatus} listings.
          </p>

        </div>

      ) : (

        /* =================================================
           LISTINGS
        ================================================= */

        <div className="space-y-5">

          {listings.map((listing) => (

            <div
              key={listing.id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >

              {/* ===========================================
                  LISTING HEADER
              =========================================== */}

              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">

                <div>

                  <h3 className="text-xl font-semibold text-gray-900">
                    {listing.name}
                  </h3>

                  {/* HUMAN READABLE LISTING TYPE */}

                  <p className="text-sm text-emerald-700 font-medium mt-1">
                    {getListingTypeLabel(
                      listing.listing_type
                    )}
                  </p>

                  {/* COMMUNITY SERVICE TYPE */}

                  {listing.listing_type ===
                    'community_service' &&
                    listing.service_type && (

                    <p className="text-sm text-gray-600 mt-1">

                      <span className="font-semibold">
                        Service Type:
                      </span>{' '}

                      {getServiceTypeLabel(
                        listing.service_type
                      )}

                    </p>

                  )}

                </div>

                {/* STATUS BADGE */}

                {activeStatus === 'pending' && (

                  <span className="inline-flex w-fit px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>

                )}

                {activeStatus === 'approved' && (

                  <span className="inline-flex w-fit px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>

                )}

                {activeStatus === 'rejected' && (

                  <span className="inline-flex w-fit px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                    Rejected
                  </span>

                )}

              </div>

              {/* ===========================================
                  DESCRIPTION
              =========================================== */}

              {listing.description && (

                <p className="text-gray-700 mt-4">
                  {listing.description}
                </p>

              )}

              {/* ===========================================
                  TIMING / SCHEDULE
              =========================================== */}

              {listing.timing && (

                <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4">

                  <p className="text-sm font-semibold text-emerald-800 mb-1">
                    🕐 Timing / Schedule
                  </p>

                  <p className="text-gray-800 whitespace-pre-line">
                    {listing.timing}
                  </p>

                </div>

              )}

              {/* ===========================================
                  LOCATION
              =========================================== */}

              <div className="mt-6">

                <h4 className="font-semibold text-gray-900 mb-3">
                  Location
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

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

                  <p>
                    <span className="font-semibold">
                      Taluk / Sub-District:
                    </span>{' '}

                    {listing.taluk || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Panchayat / Municipality:
                    </span>{' '}

                    {listing.panchayat || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Village / Town:
                    </span>{' '}

                    {listing.village || '-'}
                  </p>

                </div>

                {/* GOOGLE MAP */}

                {listing.google_maps_url && (

                  <div className="mt-4">

                    <a
                      href={listing.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline font-medium"
                    >
                      📍 Open Google Maps
                    </a>

                  </div>

                )}

              </div>

              {/* ===========================================
                  CONTACT INFORMATION
              =========================================== */}

              <div className="border-t border-gray-200 mt-6 pt-5">

                <h4 className="font-semibold text-gray-900 mb-3">
                  Contact Information
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">

                  <p>
                    <span className="font-semibold">
                      Contact:
                    </span>{' '}

                    {listing.contact_person || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Phone:
                    </span>{' '}

                    {listing.phone || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Email:
                    </span>{' '}

                    {listing.email || '-'}
                  </p>

                  <p>
                    <span className="font-semibold">
                      WhatsApp:
                    </span>{' '}

                    {listing.whatsapp || '-'}
                  </p>

                  {listing.website && (

                    <p>

                      <span className="font-semibold">
                        Website:
                      </span>{' '}

                      <a
                        href={listing.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline"
                      >
                        {listing.website}
                      </a>

                    </p>

                  )}

                </div>

              </div>

              {/* ===========================================
                  ADMIN ACTIONS
                  ONLY PENDING LISTINGS
              =========================================== */}

              {activeStatus === 'pending' && (

                <div className="border-t border-gray-200 mt-6 pt-5 flex flex-col sm:flex-row gap-3">

                  {/* APPROVE */}

                  <form action={approveListing}>

                    <input
                      type="hidden"
                      name="listingId"
                      value={listing.id}
                    />

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
                    >
                      ✓ Approve
                    </button>

                  </form>

                  {/* REJECT */}

                  <form action={rejectListing}>

                    <input
                      type="hidden"
                      name="listingId"
                      value={listing.id}
                    />

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                      ✕ Reject
                    </button>

                  </form>

                </div>

              )}

            </div>

          ))}

        </div>

      )}

    </main>
  )
}