'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminRegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setErrorMessage('')
    if (password.length < 8) { setErrorMessage('Password must contain at least 8 characters.'); return }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const normalizedEmail = email.trim().toLowerCase()
      const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password })
      if (error) { setErrorMessage(error.message); return }
      if (!data.session) {
        setMessage('Account created. Please check your email and confirm your address. After confirmation, return to Admin Login and sign in. Your approved admin access will be activated automatically.')
        return
      }
      const { data: allowed, error: claimError } = await supabase.rpc('claim_admin_access')
      if (claimError || !allowed) {
        await supabase.auth.signOut()
        setErrorMessage('This email is not currently approved for administrator access.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Admin registration error:', error)
      setErrorMessage('Unable to create the administrator account. Please try again.')
    } finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-7"><p className="text-sm font-semibold text-emerald-700">Invitation only</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Create Admin Account</h1><p className="text-gray-600 mt-2">Use the same email address that was approved by the Vallalar Jeevakarunyam super admin.</p></div>
      {message && <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm">{message}</div>}
      {errorMessage && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorMessage}</div>}
      <form onSubmit={handleRegister} className="space-y-5">
        <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Approved Email</label><input id="email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required autoComplete="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="your@email.com"/></div>
        <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Create Password</label><input id="password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Minimum 8 characters"/></div>
        <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label><input id="confirmPassword" type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Re-enter password"/></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 transition disabled:opacity-50">{loading ? 'Creating account...' : 'Create Admin Account'}</button>
      </form>
      <p className="text-sm text-gray-600 mt-6 text-center">Already registered? <Link href="/admin/login" className="text-emerald-700 font-semibold hover:underline">Admin Login</Link></p>
    </div>
  </main>
}
