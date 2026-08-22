import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-50">

      <div className="max-w-4xl mx-auto px-4 py-10">

        <Link
          href="/"
          className="inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6"
        >
          ← Back to Home
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-10">

          {/* HEADER */}

          <p className="text-sm font-semibold text-emerald-700 mb-2">
            Vallalar Jeevakarunyam
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            About Us
          </h1>

          <p className="text-gray-600 mt-5 leading-7">
            Vallalar Jeevakarunyam is a public information and
            service platform created to help people discover and
            share useful information related to compassionate
            service and spiritual places.
          </p>

          {/* PURPOSE */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Purpose
            </h2>

            <p className="text-gray-600 leading-7">
              Our aim is to bring useful information together in
              one place so that people can easily find services,
              places and opportunities that support compassion,
              service and care for living beings.
            </p>

          </section>

          {/* CATEGORIES */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              What You Can Find
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* ANNADHANAM */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🍛 Annadhanam
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Information about food service and Annadhanam
                  initiatives.
                </p>

              </div>

              {/* JEEVA SAMADHI */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🕉️ Jeeva Samadhi
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Information about Jeeva Samadhi locations and
                  sacred places.
                </p>

              </div>

              {/* TEMPLE */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🛕 Temples & Meditation Centres
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Temples, meditation centres and spiritual spaces
                  supporting peaceful spiritual practice.
                </p>

              </div>

              {/* STAYS */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🏠 Affordable Stays
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Information about free and affordable
                  accommodation options for pilgrims, travellers
                  and people in need.
                </p>

              </div>

              {/* VOLUNTEER */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🤝 Volunteer Services
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Opportunities to participate in compassionate
                  service activities and initiatives.
                </p>

              </div>

              {/* MEDICAL */}

              <div className="border border-gray-200 rounded-lg p-4">

                <p className="font-semibold text-gray-900">
                  🏥 Affordable Medical Services
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Information about free and affordable medical
                  services, charitable healthcare facilities and
                  community health initiatives.
                </p>

              </div>

            </div>

          </section>

          {/* COMMUNITY INFORMATION */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Community Information
            </h2>

            <p className="text-gray-600 leading-7">
              Listings may be submitted by members of the public.
              Submitted information is reviewed before it is
              published on the platform. Visitors are encouraged
              to verify important details directly with the
              respective organisation or contact person before
              travelling or making arrangements.
            </p>

          </section>

          {/* MEDICAL NOTICE */}

          <section className="mt-8">

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">

              <h2 className="text-xl font-bold text-gray-900">
                Medical Information
              </h2>

              <p className="text-gray-700 mt-3 leading-7">
                Medical service listings are provided for
                informational purposes. Visitors should contact
                the respective healthcare provider directly to
                confirm services, eligibility, charges,
                appointments and availability.
              </p>

            </div>

          </section>

          {/* NO DONATION */}

          <section className="mt-8">

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">

              <h2 className="text-xl font-bold text-emerald-800">
                We Do Not Accept Donations
              </h2>

              <p className="text-gray-700 mt-3 leading-7">
                Vallalar Jeevakarunyam does not collect money,
                solicit donations or accept donations through this
                website. The platform is intended to provide
                information and help connect people with useful
                services and initiatives.
              </p>

            </div>

          </section>

          {/* SUBMIT */}

          <section className="mt-10 text-center">

            <h2 className="text-2xl font-bold text-gray-900">
              Help Us Build Useful Information
            </h2>

            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Know an Annadhanam centre, Jeeva Samadhi,
              temple or meditation centre, affordable stay,
              volunteer service or affordable medical service?
            </p>

            <Link
              href="/submit"
              className="inline-flex mt-5 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              Submit a Listing
            </Link>

          </section>

        </div>

      </div>

    </main>
  )
}