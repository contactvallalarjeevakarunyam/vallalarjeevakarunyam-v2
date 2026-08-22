'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/admin/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href="/admin/volunteers"
        className="inline-flex items-center justify-center px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm font-semibold hover:bg-emerald-800 transition"
      >
        🤝 Volunteer Applications
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  )
}
