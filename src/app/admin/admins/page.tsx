import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

function getAdminAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase admin credentials are not configured')
  return createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
}

export default async function AdminManagementPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: currentAdmin } = await supabase.from('admins').select('user_id, role').eq('user_id', user.id).maybeSingle()
  if (!currentAdmin || currentAdmin.role !== 'super_admin') {
    return <main className="max-w-5xl mx-auto p-6"><Link href="/admin" className="text-emerald-700 font-semibold">← Admin Dashboard</Link><div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-xl p-5"><h1 className="text-2xl font-bold">Super Admin Access Required</h1><p className="mt-2">Only the super admin can add or remove portal administrators.</p></div></main>
  }

  async function inviteAdmin(formData: FormData) {
    'use server'
    const email = String(formData.get('email') || '').trim().toLowerCase()
    if (!email) return
    const db = await createClient()
    const { data: { user: actor } } = await db.auth.getUser()
    if (!actor) redirect('/admin/login')
    const { data: actorAdmin } = await db.from('admins').select('role').eq('user_id', actor.id).maybeSingle()
    if (actorAdmin?.role !== 'super_admin') return

    const { data: existingAdmin } = await db.from('admin_invites').select('id').eq('email', email).maybeSingle()
    if (existingAdmin) {
      await db.from('admin_invites').update({ role: 'admin', status: 'pending' }).eq('id', existingAdmin.id)
    } else {
      await db.from('admin_invites').insert({ email, role: 'admin', status: 'pending' })
    }

    const adminAuth = getAdminAuthClient()
    const { error } = await adminAuth.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/admin/accept-invite`,
      data: { invited_as: 'admin' },
    })
    if (error) {
      console.error('Admin invitation email failed:', error.message)
      await db.from('admin_invites').update({ status: 'email_failed' }).eq('email', email)
    }
    revalidatePath('/admin/admins')
  }

  async function revokeInvite(formData: FormData) {
    'use server'
    const id = Number(formData.get('id'))
    if (!Number.isInteger(id)) return
    const db = await createClient()
    const { data: { user: actor } } = await db.auth.getUser()
    if (!actor) redirect('/admin/login')
    const { data: actorAdmin } = await db.from('admins').select('role').eq('user_id', actor.id).maybeSingle()
    if (actorAdmin?.role !== 'super_admin') return
    await db.from('admin_invites').update({ status: 'revoked' }).eq('id', id).in('status', ['pending', 'email_failed'])
    revalidatePath('/admin/admins')
  }

  const { data: admins } = await supabase.from('admins').select('user_id, role, created_at').order('created_at')
  const { data: invites } = await supabase.from('admin_invites').select('id, email, role, status, created_at').order('created_at', { ascending: false })

  return <main className="max-w-5xl mx-auto p-6">
    <Link href="/admin" className="text-emerald-700 font-semibold">← Admin Dashboard</Link>
    <div className="mt-6 mb-8"><p className="text-sm font-semibold text-emerald-700">Super Admin</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Admin Management</h1><p className="text-gray-600 mt-2">Invite trusted administrators by email. Passwords remain private to each administrator.</p></div>
    <form action={inviteAdmin} className="bg-white border border-gray-200 rounded-xl p-5 mb-8"><h2 className="text-lg font-bold text-gray-900">Invite Admin</h2><p className="text-sm text-gray-600 mt-1 mb-4">Enter their email address. They will receive a secure invitation link to create their password and activate admin access.</p><div className="flex flex-col sm:flex-row gap-3"><input name="email" type="email" required placeholder="admin@example.com" className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5"/><button className="bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-emerald-800">Send Admin Invitation</button></div></form>
    <section className="mb-8"><h2 className="text-xl font-bold text-gray-900 mb-4">Active Administrators</h2><div className="space-y-3">{(admins || []).map((admin) => <div key={admin.user_id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-4"><div><p className="font-semibold text-gray-900">Authenticated administrator</p><p className="text-xs text-gray-500 mt-1">User ID: {admin.user_id}</p></div><span className="h-fit px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span></div>)}</div></section>
    <section><h2 className="text-xl font-bold text-gray-900 mb-4">Admin Invitations</h2><div className="space-y-3">{(invites || []).map((invite) => <div key={invite.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-semibold text-gray-900">{invite.email}</p><p className="text-sm text-gray-500 mt-1">Status: {invite.status === 'pending' ? 'Invitation sent / pending acceptance' : invite.status === 'email_failed' ? 'Email could not be sent' : invite.status}</p></div>{['pending','email_failed'].includes(invite.status) && <form action={revokeInvite}><input type="hidden" name="id" value={invite.id}/><button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">Revoke</button></form>}</div>)}</div></section>
  </main>
}
