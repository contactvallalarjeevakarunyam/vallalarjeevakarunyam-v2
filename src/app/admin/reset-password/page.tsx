'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const prepareRecovery = async () => {
      try {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const tokenHash = url.searchParams.get('token_hash')
        const type = url.searchParams.get('type')

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
          window.history.replaceState({}, '', '/admin/reset-password')
        } else if (tokenHash && type === 'recovery') {
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          })
          if (verifyError) throw verifyError
          window.history.replaceState({}, '', '/admin/reset-password')
        }

        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return

        if (session) {
          setRecoveryReady(true)
          setError('')
        } else {
          setError('Reset session is missing or the link has expired. Please request a new password reset email.')
        }
      } catch (err) {
        console.error('Password recovery session error:', err)
        if (mounted) setError('This reset link is invalid or has expired. Please request a new password reset email.')
      } finally {
        if (mounted) setChecking(false)
      }
    }

    prepareRecovery()
    return () => { mounted = false }
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!recoveryReady) {
      setError('Reset session is missing. Please request a new password reset email.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      setDone(true)
      await supabase.auth.signOut()
      setTimeout(() => router.push('/admin/login'), 1500)
    } catch {
      setError('Unable to reset password. Please request a new reset email and try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <h1 className="text-3xl font-bold text-gray-900">Create New Password</h1>
      <p className="text-gray-600 mt-2 mb-7">Choose a new password for your admin account.</p>
      {checking && <div className="mb-5 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">Verifying your secure reset link…</div>}
      {done && <div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">Password updated successfully. Returning to Admin Login…</div>}
      {error && <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      {!done && !checking && recoveryReady && <form onSubmit={submit} className="space-y-5">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">New Password</label><div className="relative"><input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"/><button type="button" onClick={() => setShow(v => !v)} className="absolute inset-y-0 right-0 px-4 text-sm font-semibold text-emerald-700">{show ? 'Hide' : 'Show'}</button></div></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label><input type={show ? 'text' : 'password'} required value={confirm} onChange={e => setConfirm(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"/></div>
        <button disabled={loading} className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 disabled:opacity-50">{loading ? 'Updating...' : 'Update Password'}</button>
      </form>}
      {!checking && !recoveryReady && !done && <div className="text-center"><Link href="/admin/forgot-password" className="text-emerald-700 font-semibold hover:underline">Request a new reset email</Link></div>}
      <div className="mt-6 text-center"><Link href="/admin/login" className="text-emerald-700 font-semibold hover:underline">← Admin Login</Link></div>
    </div>
  </main>
}
