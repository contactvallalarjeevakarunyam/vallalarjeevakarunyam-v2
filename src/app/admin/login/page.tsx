'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setLoading(true); setErrorMessage('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
      if (error) { setErrorMessage(error.message); return }

      const { data: allowed, error: claimError } = await supabase.rpc('claim_admin_access')
      if (claimError || !allowed) {
        await supabase.auth.signOut()
        setErrorMessage('This account is not authorized for administrator access.')
        return
      }

      router.push('/admin'); router.refresh()
    } catch (error) {
      console.error('Admin login error:', error)
      setErrorMessage('Unable to login. Please try again.')
    } finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">Admin Login</h1><p className="text-gray-600 mt-2">Vallalar Jeevakarunyam Administration</p></div>
      {errorMessage && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-red-700 text-sm">{errorMessage}</p></div>}
      <form onSubmit={handleLogin} className="space-y-5">
        <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label><input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Admin email"/></div>
        <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label><input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required autoComplete="current-password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Password"/></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50 disabled:cursor-not-allowed">{loading?'Signing in...':'Login'}</button>
      </form>
      <div className="border-t border-gray-200 mt-7 pt-6 text-center"><p className="text-sm text-gray-600">Approved as a new administrator?</p><Link href="/admin/register" className="inline-block mt-2 text-emerald-700 font-semibold hover:underline">Create your admin account →</Link></div>
    </div>
  </main>
}
