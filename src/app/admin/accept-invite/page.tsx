'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AcceptAdminInvitePage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [inviteReady, setInviteReady] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function prepareInviteSession() {
      try {
        // Supabase invite verification can redirect with an implicit-flow session
        // in the URL hash. Browser clients normally consume it automatically,
        // but explicitly handle it here so invite acceptance works reliably.
        const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
        const accessToken = hash.get('access_token')
        const refreshToken = hash.get('refresh_token')

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          window.history.replaceState({}, '', '/admin/accept-invite')
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          setInviteReady(true)
          setErrorMessage('')
        } else {
          setErrorMessage('The invitation session is missing or expired. Please ask the super admin to send a new invitation.')
        }
      } catch (error) {
        console.error('Prepare admin invitation session error:', error)
        if (mounted) setErrorMessage('The invitation session could not be verified. Please ask the super admin to send a new invitation.')
      } finally {
        if (mounted) setChecking(false)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || !session?.user) return
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setInviteReady(true)
        setErrorMessage('')
        setChecking(false)
      }
    })

    prepareInviteSession()
    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function acceptInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMessage('')
    if (!inviteReady) { setErrorMessage('The invitation session is missing or expired. Please ask the super admin to send a new invitation.'); return }
    if (password.length < 8) { setErrorMessage('Password must contain at least 8 characters.'); return }
    if (password !== confirmPassword) { setErrorMessage('Passwords do not match.'); return }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setInviteReady(false)
        setErrorMessage('The invitation session is missing or expired. Please ask the super admin to send a new invitation.')
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) { setErrorMessage(error.message); return }
      const { data: allowed, error: claimError } = await supabase.rpc('claim_admin_access')
      if (claimError || !allowed) {
        setErrorMessage('Your account was created, but administrator access could not be activated. Please contact the super admin.')
        return
      }
      router.push('/admin')
      router.refresh()
    } catch (error) {
      console.error('Accept admin invitation error:', error)
      setErrorMessage('Unable to activate the administrator account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <p className="text-sm font-semibold text-emerald-700">Vallalar Jeevakarunyam</p>
      <h1 className="text-3xl font-bold text-gray-900 mt-1">Accept Admin Invitation</h1>
      <p className="text-gray-600 mt-2 mb-7">Create your private password to activate your administrator account.</p>
      {checking && <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm">Verifying your secure invitation…</div>}
      {errorMessage && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errorMessage}</div>}
      {!checking && inviteReady && <form onSubmit={acceptInvite} className="space-y-5">
        <div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Create Password</label><div className="relative"><input id="password" type={showPassword ? 'text' : 'password'} required minLength={8} value={password} onChange={(e)=>setPassword(e.target.value)} autoComplete="new-password" className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Minimum 8 characters"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-emerald-700">{showPassword ? 'Hide' : 'Show'}</button></div></div>
        <div><label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label><input id="confirmPassword" type={showPassword ? 'text' : 'password'} required minLength={8} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} autoComplete="new-password" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Re-enter password"/></div>
        <button type="submit" disabled={loading} className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 disabled:opacity-50">{loading ? 'Activating...' : 'Activate Admin Account'}</button>
      </form>}
    </div>
  </main>
}
