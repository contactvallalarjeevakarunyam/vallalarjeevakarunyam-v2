import Link from 'next/link'

export default function ContactPage() {
  const email = 'contactvallalarjeevakarunyam@gmail.com'

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

          <p className="text-sm font-semibold text-emerald-700 mb-2">
            Vallalar Jeevakarunyam
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Contact Us
          </h1>

          <p className="text-gray-600 mt-4 leading-7">
            We welcome your feedback, corrections and suggestions
            to help improve Vallalar Jeevakarunyam and keep the
            information useful for everyone.
          </p>

          {/* EMAIL */}

          <section className="mt-8">

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">

              <h2 className="text-xl font-bold text-gray-900">
                📧 Email Us
              </h2>

              <p className="text-gray-600 mt-2">
                For general enquiries, feedback and website-related
                communication:
              </p>

              <a
                href={`mailto:${email}`}
                className="inline-block mt-4 text-emerald-700 font-semibold hover:underline break-all"
              >
                {email}
              </a>

            </div>

          </section>

          {/* CONTACT REASONS */}

          <section className="mt-10">

            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              You Can Contact Us For
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900">
                  ✏️ Listing Correction
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Tell us if a listing contains incorrect or
                  outdated information.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900">
                  💡 Suggestions
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Share ideas that could make the platform more
                  useful and easier to use.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900">
                  🛠️ Technical Issues
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Report broken links, errors or other problems
                  you experience while using the website.
                </p>
              </div>

              <div className="border border-gray-200 rounded-lg p-5">
                <h3 className="font-semibold text-gray-900">
                  📍 Missing Information
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Let us know about useful places or services that
                  should be included on the platform.
                </p>
              </div>

            </div>

          </section>

          {/* SUBMIT LISTING */}

          <section className="mt-10 border-t border-gray-200 pt-8">

            <h2 className="text-xl font-bold text-gray-900">
              Want to Add a Place or Service?
            </h2>

            <p className="text-gray-600 mt-2">
              Please use our listing submission form instead of
              sending the complete listing details by email.
            </p>

            <Link
              href="/submit"
              className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition"
            >
              Submit a Listing
            </Link>

          </section>

          {/* DONATION NOTICE */}

          <section className="mt-10">

            <div className="border border-amber-200 bg-amber-50 rounded-xl p-5">

              <h2 className="font-bold text-gray-900">
                Important Notice
              </h2>

              <p className="text-gray-700 mt-2 leading-7">
                Vallalar Jeevakarunyam does not collect money,
                solicit donations or accept donations through this
                website.
              </p>

            </div>

          </section>

        </div>

      </div>
    </main>
  )
}