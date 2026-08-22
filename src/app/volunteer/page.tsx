import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

// =====================================================
// SERVICE TYPE LABELS
// =====================================================

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
// PAGE
// =====================================================

export default async function VolunteerPage() {
  const supabase = await createClient()

  // Only approved Community Service listings
  // are shown publicly on this page.

  const { data: listings, error } = await supabase
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
    .eq('listing_type', 'community_service')
    .eq('status', 'approved')
    .order('created_at', {
      ascending: false,
    })

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-10">

          <p className="text-sm font-semibold text-emerald-700 mb-2">
            Vallalar Jeevakarunyam
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Volunteer & Community Service
          </h1>

          <p className="text-gray-600 mt-3 max-w-3xl leading-7">
            Find ways to contribute to Vallalar Jeevakarunyam
            or connect with organisations and groups carrying out
            compassionate, environmental and community service.
          </p>

        </div>

        {/* =================================================
            TWO VOLUNTEER PATHS
        ================================================= */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14">

          {/* =================================================
              VOLUNTEER WITH US
          ================================================= */}

          <section className="bg-white border border-emerald-200 rounded-2xl p-7 shadow-sm">

            <div className="text-4xl mb-4">
              🤝
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Volunteer With Us
            </h2>

            <p className="text-gray-600 mt-3 leading-7">
              Help Vallalar Jeevakarunyam identify useful services,
              verify information submitted by the public and keep
              our listings accurate and useful for everyone.
            </p>

            <div className="mt-6 space-y-3 text-sm text-gray-700">

              {/* IDENTIFY SPIRITUAL / SERVICE LOCATIONS */}

              <div className="flex gap-3">

                <span className="text-emerald-700 font-bold">
                  ✓
                </span>

                <p>
                  Identify Annadhanam centres, Jeeva Samadhis,
                  temples and meditation centres.
                </p>

              </div>

              {/* IDENTIFY OTHER SERVICES */}

              <div className="flex gap-3">

                <span className="text-emerald-700 font-bold">
                  ✓
                </span>

                <p>
                  Identify affordable stays, medical services
                  and community service organisations.
                </p>

              </div>

              {/* VERIFY LISTINGS */}

              <div className="flex gap-3">

                <span className="text-emerald-700 font-bold">
                  ✓
                </span>

                <p>
                  Help verify information submitted by members
                  of the public.
                </p>

              </div>

              {/* REPORT OUTDATED INFORMATION */}

              <div className="flex gap-3">

                <span className="text-emerald-700 font-bold">
                  ✓
                </span>

                <p>
                  Report outdated timings, locations or contact
                  information so listings can remain accurate.
                </p>

              </div>

            </div>

            {/* =================================================
                VOLUNTEER REGISTRATION - COMING NEXT
            ================================================= */}

            <div className="mt-7 bg-emerald-50 border border-emerald-100 rounded-xl p-4">

              <p className="text-sm text-emerald-900 font-medium">
                Volunteer registration will be available soon.
              </p>

              <p className="text-sm text-emerald-800 mt-1">
                Volunteers will assist with identification and
                verification. Final listing approval will remain
                with the Vallalar Jeevakarunyam administrator.
              </p>

            </div>

          </section>

          {/* =================================================
              JOIN COMMUNITY SERVICE
          ================================================= */}

          <section className="bg-white border border-emerald-200 rounded-2xl p-7 shadow-sm">

            <div className="text-4xl mb-4">
              🌱
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Join Community Service
            </h2>

            <p className="text-gray-600 mt-3 leading-7">
              Find organisations and groups already carrying out
              social, environmental and compassionate service.
              Contact them directly and participate in their
              activities.
            </p>

            {/* SERVICE TYPES */}

            <div className="mt-6 flex flex-wrap gap-2">

              {[
                'Ulavara Pani',
                'Water Body Restoration',
                'Tree Planting',
                'Environmental Conservation',
                'Temple Service',
                'Heritage Conservation',
                'Food Service',
                'Animal Welfare',
                'Social Service',
              ].map((service) => (

                <span
                  key={service}
                  className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-sm text-gray-700"
                >
                  {service}
                </span>

              ))}

            </div>

            {/* FIND COMMUNITY SERVICES */}

            <a
              href="#community-services"
              className="inline-flex mt-7 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              Find Community Services ↓
            </a>

          </section>

        </div>

        {/* =================================================
            COMMUNITY SERVICE DIRECTORY
        ================================================= */}

        <section
          id="community-services"
          className="scroll-mt-24"
        >

          {/* DIRECTORY HEADER */}

          <div className="mb-7">

            <p className="text-sm font-semibold text-emerald-700 mb-2">
              Community Directory
            </p>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              Community Service Groups
            </h2>

            <p className="text-gray-600 mt-3 max-w-3xl leading-7">
              Discover approved organisations, groups and service
              initiatives. Contact them directly to learn about
              upcoming activities and opportunities to participate.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
              Unable to load Community Service listings.
            </div>

          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!error &&
            (!listings || listings.length === 0) && (

              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

                <h3 className="text-xl font-semibold text-gray-900">
                  No approved Community Service groups yet
                </h3>

                <p className="text-gray-600 mt-2 max-w-xl mx-auto">
                  Know an organisation or group doing Ulavara Pani,
                  environmental conservation, water-body restoration
                  or another form of community service?
                </p>

                <Link
                  href="/submit"
                  className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
                >
                  ＋ Submit a Community Service Group
                </Link>

              </div>

            )}

          {/* =================================================
              AVAILABLE SERVICE TYPES
          ================================================= */}

          {!error &&
            listings &&
            listings.length > 0 && (

              <div className="mb-6 flex flex-wrap gap-2">

                {Array.from(
                  new Set(
                    listings
                      .map(
                        (listing) =>
                          listing.service_type
                      )
                      .filter(
                        (
                          value
                        ): value is string =>
                          Boolean(value)
                      )
                  )
                ).map((serviceType) => (

                  <span
                    key={serviceType}
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium"
                  >
                    {getServiceTypeLabel(
                      serviceType
                    )}
                  </span>

                ))}

              </div>

            )}

          {/* =================================================
              SEARCH + SERVICE TYPE + STATE + DISTRICT
              GRID / LIST VIEW
          ================================================= */}

          {!error &&
            listings &&
            listings.length > 0 && (

              <ListingsExplorer
                listings={listings}
                badgeLabel="Community Service"
                showServiceTypeFilter={true}
              />

            )}

          {/* =================================================
              SUBMIT ANOTHER COMMUNITY SERVICE GROUP
          ================================================= */}

          {!error &&
            listings &&
            listings.length > 0 && (

              <div className="mt-10 text-center bg-white border border-gray-200 rounded-xl p-7">

                <h3 className="text-lg font-semibold text-gray-900">
                  Know another community service group?
                </h3>

                <p className="text-gray-600 mt-2">
                  Help others discover organisations doing
                  meaningful service in their area.
                </p>

                <Link
                  href="/submit"
                  className="inline-flex mt-4 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition"
                >
                  ＋ Submit a Listing
                </Link>

              </div>

            )}

        </section>

      </div>

    </main>
  )
}