import Link from 'next/link'

export default function Navigation() {
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Submit Listing', href: '/submit' },
    { name: 'Annadhanam', href: '/annadhanam' },
    { name: 'Jeeva Samadhi', href: '/jeeva-samadhi' },
    { name: 'Temples & Meditation Centres', href: '/temple' },
    { name: 'Affordable Stays', href: '/stay' },
    { name: 'Volunteer & Community Service', href: '/volunteer' },
    { name: 'Medical Services', href: '/medical' },
    { name: 'Map', href: '/map' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-shrink-0 mr-8">
            <Link href="/" className="text-lg font-bold text-emerald-700 whitespace-nowrap">Vallalar Jeevakarunyam</Link>
          </div>
          <div className="hidden lg:flex flex-1 items-center justify-center gap-4">
            {navItems.map((item) => <Link key={item.name} href={item.href} className="text-gray-700 hover:text-emerald-700 font-medium transition-colors text-sm whitespace-nowrap">{item.name}</Link>)}
          </div>
          <div className="hidden lg:flex flex-shrink-0 ml-6">
            <Link href="/admin" className="inline-flex items-center justify-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition">Admin Login</Link>
          </div>
          <div className="ml-auto lg:hidden">
            <button type="button" className="text-gray-700 hover:text-emerald-700" aria-label="Open navigation menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
