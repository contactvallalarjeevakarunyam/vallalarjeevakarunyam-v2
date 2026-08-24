import Hero from '@/components/Hero'
import FeatureCard from '@/components/FeatureCard'
import HomeListingsExplorer from '@/components/listings/HomeListingsExplorer'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase
    .from('listings')
    .select(`*, states (name), districts (name)`)
    .eq('status', 'approved')
    .in('listing_type', ['annadhanam','jeeva_samadhi','temple','stay','community_service','medical','education'])
    .order('created_at', { ascending: false })

  const features = [
    { title: 'Annadhanam', description: 'Connect with communities providing food assistance and nourishment to all beings.', icon: '🍛', href: '/annadhanam' },
    { title: 'Jeeva Samadhi', description: 'Discover sacred spaces dedicated to spiritual practice and meditation.', icon: '🕉️', href: '/jeeva-samadhi' },
    { title: 'Temples & Meditation Centres', description: 'Explore temples, meditation centres and spiritual spaces dedicated to compassion and peaceful practice.', icon: '🛕', href: '/temple' },
    { title: 'Affordable Stays', description: 'Find free and affordable accommodation options for pilgrims, travellers and people in need.', icon: '🏠', href: '/stay' },
    { title: 'Volunteer & Community Service', description: 'Volunteer with Vallalar Jeevakarunyam or connect with community groups carrying out compassionate, environmental and social service.', icon: '🤝', href: '/volunteer', actionLabel: 'Explore & Volunteer' },
    { title: 'Affordable Medical Services', description: 'Find free and affordable medical services, charitable healthcare facilities and community health initiatives.', icon: '🏥', href: '/medical' },
    { title: 'Affordable Educational Institutes', description: 'Find free and genuinely affordable educational institutes, learning centres, coaching and skill-development services.', icon: '🎓', href: '/education' },
    { title: 'Map', description: 'Explore approved locations and initiatives through their verified map links.', icon: '🗺️', href: '/map', actionLabel: 'Explore Locations' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <Hero />
        {!error && <HomeListingsExplorer listings={listings || []} />}
        {error && <section className="bg-gray-50 px-4 py-10"><div className="max-w-7xl mx-auto"><div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-center">Unable to load search listings at the moment.</div></div></section>}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-emerald-700 mb-2">Explore</p>
              <h2 className="text-3xl font-bold text-gray-900">Our Services & Listings</h2>
              <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Browse our categories to find compassionate services, spiritual places and community initiatives.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => <FeatureCard key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} href={feature.href} actionLabel={feature.actionLabel} />)}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
