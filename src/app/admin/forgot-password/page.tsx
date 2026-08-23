'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email,setEmail]=useState('')
  const [loading,setLoading]=useState(false)
  const [message,setMessage]=useState('')
  const [error,setError]=useState('')

  const submit=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault(); setLoading(true); setError(''); setMessage('')
    try {
      const supabase=createClient()
      const redirectTo=`${window.location.origin}/admin/reset-password`
      const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(),{redirectTo})
      if(resetError){setError(resetError.message);return}
      setMessage('Password reset email sent. Please open the newest email and follow the secure link.')
    } catch { setError('Unable to send reset email. Please try again.') }
    finally { setLoading(false) }
  }

  return <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4"><div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8">
    <h1 className="text-3xl font-bold text-gray-900">Reset Admin Password</h1><p className="text-gray-600 mt-2 mb-7">Enter your administrator email address.</p>
    {message&&<div className="mb-5 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">{message}</div>}
    {error&&<div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
    <form onSubmit={submit} className="space-y-5"><div><label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="email">Email</label><input id="email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600" placeholder="Admin email"/></div><button disabled={loading} className="w-full bg-emerald-700 text-white font-semibold py-3 rounded-lg hover:bg-emerald-800 disabled:opacity-50">{loading?'Sending...':'Send Password Reset Email'}</button></form>
    <div className="mt-6 text-center"><Link href="/admin/login" className="text-emerald-700 font-semibold hover:underline">← Back to Admin Login</Link></div>
  </div></main>
}
