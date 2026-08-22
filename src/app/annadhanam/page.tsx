import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

export default async function AnnadhanamPage() {
  const supabase = await createClient()

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

        {/* NO LISTINGS */}

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

        {/* SEARCH + FILTERS + LISTINGS */}

        {!error &&
          listings &&
          listings.length > 0 && (

            <ListingsExplorer
              listings={listings}
              badgeLabel="Annadhanam"
            />

          )}

        {/* SUBMIT */}

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