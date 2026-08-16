export default function Navigation() {
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Submit Listing', href: '/submit' },
    { name: 'Annadhanam', href: '#' },
    { name: 'Jeeva Samadhi', href: '#' },
    { name: 'Temples', href: '#' },
    { name: 'Stay', href: '#' },
    { name: 'Volunteer', href: '#' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-emerald-700">Vallalar Jeevakarunyam</h1>
          </div>
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-emerald-700 font-medium transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-emerald-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
