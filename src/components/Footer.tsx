import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

          {/* ABOUT */}

          <div>
            <h3 className="text-xl font-bold text-emerald-400 mb-4">
              Vallalar Jeevakarunyam
            </h3>

            <p className="text-gray-400 leading-relaxed">
              A public information platform connecting people with
              Annadhanam, Jeeva Samadhi, Temples & Meditation
              Centres, Affordable Stays, Affordable Healthcare,
              Affordable Education, Volunteer & Community Service,
              and an Interactive Map.
            </p>
          </div>

          {/* QUICK LINKS */}

          <div>
            <h4 className="text-lg font-semibold mb-4">
              Quick Links
            </h4>

            <ul className="space-y-2 text-gray-400">

              <li>
                <Link
                  href="/about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="/contact"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="/submit"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Submit Listing
                </Link>
              </li>

            </ul>
          </div>

          {/* EXPLORE */}

          <div>
            <h4 className="text-lg font-semibold mb-4">
              Explore
            </h4>

            <ul className="space-y-2 text-gray-400">

              <li>
                <Link
                  href="/annadhanam"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Annadhanam
                </Link>
              </li>

              <li>
                <Link
                  href="/jeeva-samadhi"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Jeeva Samadhi
                </Link>
              </li>

              <li>
                <Link
                  href="/temple"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Temples & Meditation Centres
                </Link>
              </li>

              <li>
                <Link
                  href="/stay"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Affordable Stays
                </Link>
              </li>

              <li>
                <Link
                  href="/medical"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Affordable Healthcare
                </Link>
              </li>

              <li>
                <Link
                  href="/education"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Affordable Education
                </Link>
              </li>

              <li>
                <Link
                  href="/volunteer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Volunteer & Community Service
                </Link>
              </li>

              <li>
                <Link
                  href="/map"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Interactive Map
                </Link>
              </li>

            </ul>
          </div>

        </div>

        {/* NO DONATIONS */}

        <div className="border-t border-gray-800 pt-6 pb-6">

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">

            <p className="text-emerald-400 font-semibold">
              We do not accept donations.
            </p>

            <p className="text-gray-400 text-sm mt-1">
              Vallalar Jeevakarunyam is an information and service
              platform. We do not collect money or solicit donations
              through this website.
            </p>

          </div>

        </div>

        {/* COPYRIGHT */}

        <div className="border-t border-gray-800 pt-6">

          <p className="text-center text-gray-400 text-sm">
            &copy; {currentYear} Vallalar Jeevakarunyam.
            All rights reserved.
          </p>

        </div>

      </div>

    </footer>
  )
}
