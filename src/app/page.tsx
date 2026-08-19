import Navigation from '@/components/Navigation'
import Hero from '@/components/Hero'
import FeatureCard from '@/components/FeatureCard'
import Footer from '@/components/Footer'

export default function Home() {
  const features = [
    {
      title: 'Annadhanam',
      description:
        'Connect with communities providing food assistance and nourishment to all beings.',
      icon: '🍛',
      href: '/annadhanam',
    },
    {
      title: 'Jeeva Samadhi',
      description:
        'Discover sacred spaces dedicated to spiritual practice and meditation.',
      icon: '🕉️',
      href: '/jeeva-samadhi',
    },
    {
      title: 'Temple',
      description:
        'Explore temples and spiritual centers practicing non-violence and compassion.',
      icon: '🛕',
      href: '/temple',
    },
    {
      title: 'Stay',
      description:
        'Find free and low-cost accommodations for pilgrims, travellers and people in need.',
      icon: '🏠',
      href: '/stay',
    },
    {
      title: 'Volunteer',
      description:
        'Join volunteer opportunities dedicated to serving all living beings.',
      icon: '🤝',
      href: '/volunteer',
    },
    {
      title: 'Map',
      description:
        'Explore locations and initiatives across the globe on our interactive map.',
      icon: '🗺️',
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">

      <Navigation />

      <main className="flex-grow">

        <Hero />

        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">

          <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  href={feature.href}
                />
              ))}

            </div>

          </div>

        </section>

      </main>

      <Footer />

    </div>
  )
}