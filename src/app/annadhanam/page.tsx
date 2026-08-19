import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function AnnadhanamPage() {
  const supabase = await createClient()

  // Only approved Annadhanam listings are shown publicly
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
    .eq('listing_type', 'annadhanam')
    .eq('status', 'approved')
    .order('created_at', {
      ascending: false,
    })

  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* HEADER */}

        <div className="mb-8">

          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-5"
          >
            ← Back to Home
          </Link>

          <p className="text-sm font-semibold text-emerald-700 mb-2">
            Vallalar Jeevakarunyam
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Annadhanam
          </h1>

          <p className="text-gray-600 mt-3 max-w-2xl">
            Find approved Annadhanam centres and food
            service initiatives.
          </p>

        </div>

        {/* ERROR */}

        {error && (

          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">
            Unable to load Annadhanam listings.
          </div>

        )}

        {/* EMPTY */}

        {!error &&
          (!listings || listings.length === 0) && (

            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

              <h2 className="text-xl font-semibold text-gray-900">
                No approved Annadhanam listings yet
              </h2>

              <p className="text-gray-600 mt-2">
                Know an Annadhanam centre? You can submit
                it for review.
              </p>

              <Link
                href="/submit"
                className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
              >
                Submit a Listing
              </Link>

            </div>

          )}

        {/* LISTINGS */}

        {!error &&
          listings &&
          listings.length > 0 && (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {listings.map((listing) => (

                <article
                  key={listing.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
                >

                  {/* NAME + TYPE */}

                  <div className="mb-4">

                    <div className="flex items-start justify-between gap-4">

                      <h2 className="text-xl font-bold text-gray-900">
                        {listing.name}
                      </h2>

                      <span className="shrink-0 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                        Annadhanam
                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    {listing.description && (

                      <p className="text-gray-600 mt-3">
                        {listing.description}
                      </p>

                    )}

                  </div>

                  {/* TIMING / SCHEDULE */}

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

                  {/* LOCATION */}

                  <div className="border-t border-gray-100 pt-4">

                    <h3 className="font-semibold text-gray-900 mb-3">
                      Location
                    </h3>

                    <div className="space-y-2 text-sm text-gray-700">

                      {/* STATE */}

                      <p>

                        <span className="font-semibold">
                          State:
                        </span>{' '}

                        {listing.states?.name || '-'}

                      </p>

                      {/* DISTRICT */}

                      <p>

                        <span className="font-semibold">
                          District:
                        </span>{' '}

                        {listing.districts?.name || '-'}

                      </p>

                      {/* TALUK */}

                      {listing.taluk && (

                        <p>

                          <span className="font-semibold">
                            Taluk / Sub-District:
                          </span>{' '}

                          {listing.taluk}

                        </p>

                      )}

                      {/* PANCHAYAT */}

                      {listing.panchayat && (

                        <p>

                          <span className="font-semibold">
                            Panchayat / Municipality:
                          </span>{' '}

                          {listing.panchayat}

                        </p>

                      )}

                      {/* VILLAGE */}

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

                  {/* CONTACT */}

                  <div className="border-t border-gray-100 mt-5 pt-4">

                    <h3 className="font-semibold text-gray-900 mb-3">
                      Contact
                    </h3>

                    <div className="space-y-2 text-sm text-gray-700">

                      {/* CONTACT PERSON */}

                      {listing.contact_person && (

                        <p>

                          <span className="font-semibold">
                            Contact Person:
                          </span>{' '}

                          {listing.contact_person}

                        </p>

                      )}

                      {/* PHONE */}

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

                      {/* WHATSAPP */}

                      {listing.whatsapp && (

                        <p>

                          <span className="font-semibold">
                            WhatsApp:
                          </span>{' '}

                          {listing.whatsapp}

                        </p>

                      )}

                      {/* EMAIL */}

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

                  {/* MAP + WEBSITE */}

                  {(listing.google_maps_url ||
                    listing.website) && (

                    <div className="border-t border-gray-100 mt-5 pt-5 flex flex-wrap gap-3">

                      {/* MAP */}

                      {listing.google_maps_url && (

                        <a
                          href={listing.google_maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex px-4 py-2 bg-emerald-700 text-white text-sm font-semibold rounded-lg hover:bg-emerald-800 transition"
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
                          className="inline-flex px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition"
                        >
                          Visit Website
                        </a>

                      )}

                    </div>

                  )}

                </article>

              ))}

            </div>

          )}

        {/* SUBMIT ANOTHER LISTING */}

        {!error &&
          listings &&
          listings.length > 0 && (

            <div className="mt-10 text-center">

              <p className="text-gray-600">
                Know another Annadhanam centre?
              </p>

              <Link
                href="/submit"
                className="inline-flex mt-3 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-50 transition"
              >
                Submit a Listing
              </Link>

            </div>

          )}

      </div>

    </main>
  )
}