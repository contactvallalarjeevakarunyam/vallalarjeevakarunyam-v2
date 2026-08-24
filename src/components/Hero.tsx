import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        {/* PHILOSOPHICAL QUOTES - DESKTOP */}

        <div className="hidden lg:flex absolute top-8 left-8 right-8 justify-between pointer-events-none">

          <div className="max-w-xs text-left">
            <p className="text-emerald-700 font-semibold text-lg leading-relaxed">
              “யான் பெற்ற இன்பம்
              <br />
              பெறுக இவ்வையகம்”
            </p>
          </div>

          <div className="max-w-xs text-right">
            <p className="text-emerald-700 font-semibold text-lg leading-relaxed">
              “யாதும் ஊரே
              <br />
              யாவரும் கேளிர்”
            </p>
          </div>

        </div>

        {/* PHILOSOPHICAL QUOTES - MOBILE / TABLET */}

        <div className="lg:hidden mb-10 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-white/70 border border-emerald-100 rounded-xl px-4 py-3 text-center">
            <p className="text-emerald-700 font-semibold leading-relaxed">
              “யான் பெற்ற இன்பம் பெறுக இவ்வையகம்”
            </p>
          </div>

          <div className="bg-white/70 border border-emerald-100 rounded-xl px-4 py-3 text-center">
            <p className="text-emerald-700 font-semibold leading-relaxed">
              “யாதும் ஊரே யாவரும் கேளிர்”
            </p>
          </div>

        </div>

        {/* MAIN HERO CONTENT */}

        <div className="max-w-4xl mx-auto text-center">

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Vallalar Jeevakarunyam
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A common platform for people who practice Jeevakarunyam
            and righteous conduct, serving all living beings without
            causing harm.
          </p>

          {/* CONTRIBUTION MESSAGE */}

          <p className="text-gray-600 mt-8 max-w-2xl mx-auto">
            Know an Annadhanam centre, Jeeva Samadhi,
            Temple or Meditation Centre, Affordable Stay,
            Affordable Healthcare service, Affordable Education provider or
            Community Service Group? Help others by sharing the details.
          </p>

          {/* SUBMIT LISTING */}

          <div className="mt-6 flex justify-center">

            <Link
              href="/submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition shadow-sm"
            >
              ＋ Submit a Listing
            </Link>

          </div>

          {/* TRUST NOTE */}

          <p className="text-sm text-gray-500 mt-5">
            Public submissions are reviewed before appearing on the platform.
          </p>

        </div>

      </div>

    </section>
  )
}
