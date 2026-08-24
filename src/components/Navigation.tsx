'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'Submit Listing', href: '/submit' },
  { name: 'Annadhanam', href: '/annadhanam' },
  { name: 'Jeeva Samadhi', href: '/jeeva-samadhi' },
  { name: 'Temples & Meditation Centres', href: '/temple' },
  { name: 'Affordable Stays', href: '/stay' },
  { name: 'Affordable Healthcare', href: '/medical' },
  { name: 'Affordable Education', href: '/education' },
  { name: 'Volunteer & Community Service', href: '/volunteer' },
  { name: 'Interactive Map', href: '/map' },
]

export default function Navigation() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm lg:shadow-none">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          <div className="flex-shrink-0 mr-8">
            <Link href="/" className="text-base sm:text-lg font-bold text-emerald-700 whitespace-nowrap">Vallalar Jeevakarunyam</Link>
          </div>

          <div className="hidden lg:flex flex-1 items-center justify-center gap-4">
            {navItems.map((item) => {
              const active = pathname === item.href
              return <Link key={item.name} href={item.href} className={`${active ? 'text-emerald-700' : 'text-gray-700'} hover:text-emerald-700 font-medium transition-colors text-sm whitespace-nowrap`}>{item.name}</Link>
            })}
          </div>

          <div className="hidden lg:flex flex-shrink-0 ml-6">
            <Link href="/admin" className="inline-flex items-center justify-center px-4 py-2 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition">Admin Login</Link>
          </div>

          <div className="ml-auto lg:hidden">
            <button type="button" onClick={() => setOpen((value) => !value)} className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-gray-700 hover:text-emerald-700 hover:bg-emerald-50" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open}>
              {open ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-gray-100 pb-5 pt-3">
            <div className="max-h-[calc(100vh-6rem)] overflow-y-auto space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return <Link key={item.name} href={item.href} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${active ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50 hover:text-emerald-700'}`}>{item.name}</Link>
              })}
              <div className="pt-3 mt-3 border-t border-gray-100">
                <Link href="/admin" className="flex items-center justify-center w-full px-4 py-2.5 border border-emerald-700 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50">Admin Login</Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
