import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

// Admin invitation emails must always point to the live site. Do not fall back to
// localhost in production, because the invite is opened on the recipient's device.
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://vallalarjeevakarunyam-v2.vercel.app').replace(/\/$/, '')
const adminInviteRedirectUrl = `${siteUrl}/admin/accept-invite`

function getAdminAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase admin credentials are not configured')
  return createAdminClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function requireSuperAdmin() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: admin } = await db.from('admins').select('role').eq('user_id', user.id).maybeSingle()
  if (admin?.role !== 'super_admin') throw new Error('Super admin access required')
  return db
}

async function findAuthUserByEmail(email: string) {
  const adminAuth = getAdminAuthClient()
  let page = 1
  while (page <= 20) {
    const { data, error } = await adminAuth.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const match = data.users.find(user => user.email?.toLowerCase() === email.toLowerCase())
    if (match) return match
    if (data.users.length < 100) return null
    page += 1
  }
  return null
}

function inviteFailureStatus(error: { status?: number; code?: string; message?: string }) {
  const message = (error.message || '').toLowerCase()
  if (error.status === 429 || error.code === 'over_email_send_rate_limit' || message.includes('rate limit')) return 'rate_limited'
  return 'email_failed'
}

function statusLabel(status: string) {
  if (status === 'pending') return 'Invitation sent / pending acceptance'
  if (status === 'resent') return 'Invitation resent / pending acceptance'
  if (status === 'rate_limited') return 'Email limit reached — please try again later'
  if (status === 'email_failed') return 'Email could not be sent — please try again later'
  if (status === 'revoked') return 'Revoked'
  if (status === 'active' || status === 'claimed') return 'Active'
  return status
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
    const db = await requireSuperAdmin()
    const adminAuth = getAdminAuthClient()

    const existingAuthUser = await findAuthUserByEmail(email)
    if (existingAuthUser) {
      const { data: activeAdmin } = await db.from('admins').select('user_id').eq('user_id', existingAuthUser.id).maybeSingle()
      if (activeAdmin) {
        await db.from('admin_invites').update({ status: 'active' }).eq('email', email)
        revalidatePath('/admin/admins')
        return
      }
      const { error: deleteError } = await adminAuth.auth.admin.deleteUser(existingAuthUser.id)
      if (deleteError) {
        console.error('Unable to clear previous invited Auth user:', deleteError.message)
        await db.from('admin_invites').update({ status: 'email_failed' }).eq('email', email)
        revalidatePath('/admin/admins')
        return
      }
    }

    const { data: existingInvite } = await db.from('admin_invites').select('id').eq('email', email).maybeSingle()
    if (existingInvite) await db.from('admin_invites').update({ role: 'admin', status: 'pending' }).eq('id', existingInvite.id)
    else await db.from('admin_invites').insert({ email, role: 'admin', status: 'pending' })

    const { error } = await adminAuth.auth.admin.inviteUserByEmail(email, { redirectTo: adminInviteRedirectUrl, data: { invited_as: 'admin' } })
    if (error) {
      console.error('Admin invitation email failed:', error.message)
      await db.from('admin_invites').update({ status: inviteFailureStatus(error) }).eq('email', email)
    }
    revalidatePath('/admin/admins')
  }

  async function revokeInvite(formData: FormData) {
    'use server'
    const id = Number(formData.get('id'))
    if (!Number.isInteger(id)) return
    const db = await requireSuperAdmin()
    const { data: invite } = await db.from('admin_invites').select('id, email, status').eq('id', id).maybeSingle()
    if (!invite || !['pending', 'resent', 'email_failed', 'rate_limited'].includes(invite.status)) return

    const authUser = await findAuthUserByEmail(invite.email)
    if (authUser) {
      const { data: activeAdmin } = await db.from('admins').select('user_id').eq('user_id', authUser.id).maybeSingle()
      if (!activeAdmin) {
        const { error } = await getAdminAuthClient().auth.admin.deleteUser(authUser.id)
        if (error) {
          console.error('Unable to revoke invited Auth user:', error.message)
          return
        }
      }
    }
    await db.from('admin_invites').update({ status: 'revoked' }).eq('id', id)
    revalidatePath('/admin/admins')
  }

  async function resendInvite(formData: FormData) {
    'use server'
    const id = Number(formData.get('id'))
    if (!Number.isInteger(id)) return
    const db = await requireSuperAdmin()
    const { data: invite } = await db.from('admin_invites').select('email').eq('id', id).maybeSingle()
    if (!invite) return
    const email = invite.email.toLowerCase()
    const adminAuth = getAdminAuthClient()
    const authUser = await findAuthUserByEmail(email)

    if (authUser) {
      const { data: activeAdmin } = await db.from('admins').select('user_id').eq('user_id', authUser.id).maybeSingle()
      if (activeAdmin) {
        await db.from('admin_invites').update({ status: 'active' }).eq('id', id)
        revalidatePath('/admin/admins')
        return
      }
      const { error: deleteError } = await adminAuth.auth.admin.deleteUser(authUser.id)
      if (deleteError) {
        await db.from('admin_invites').update({ status: 'email_failed' }).eq('id', id)
        revalidatePath('/admin/admins')
        return
      }
    }

    const { error } = await adminAuth.auth.admin.inviteUserByEmail(email, { redirectTo: adminInviteRedirectUrl, data: { invited_as: 'admin' } })
    if (error) {
      console.error('Admin invitation resend failed:', error.message)
      await db.from('admin_invites').update({ status: inviteFailureStatus(error) }).eq('id', id)
    } else {
      await db.from('admin_invites').update({ status: 'resent' }).eq('id', id)
    }
    revalidatePath('/admin/admins')
  }

  const { data: admins } = await supabase.from('admins').select('user_id, role, created_at').order('created_at')
  const { data: invites } = await supabase.from('admin_invites').select('id, email, role, status, created_at').order('created_at', { ascending: false })

  return <main className="max-w-5xl mx-auto p-6">
    <Link href="/admin" className="text-emerald-700 font-semibold">← Admin Dashboard</Link>
    <div className="mt-6 mb-8"><p className="text-sm font-semibold text-emerald-700">Super Admin</p><h1 className="text-3xl font-bold text-gray-900 mt-1">Admin Management</h1><p className="text-gray-600 mt-2">Invite trusted administrators by email. Passwords remain private to each administrator.</p></div>
    <form action={inviteAdmin} className="bg-white border border-gray-200 rounded-xl p-5 mb-8"><h2 className="text-lg font-bold text-gray-900">Invite Admin</h2><p className="text-sm text-gray-600 mt-1 mb-4">Enter their email address. They will receive a secure invitation link to create their password and activate admin access.</p><div className="flex flex-col sm:flex-row gap-3"><input name="email" type="email" required placeholder="admin@example.com" className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5"/><button className="bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-emerald-800">Send Admin Invitation</button></div></form>
    <section className="mb-8"><h2 className="text-xl font-bold text-gray-900 mb-4">Active Administrators</h2><div className="space-y-3">{(admins || []).map((admin) => <div key={admin.user_id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between gap-4"><div><p className="font-semibold text-gray-900">Authenticated administrator</p><p className="text-xs text-gray-500 mt-1">User ID: {admin.user_id}</p></div><span className="h-fit px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span></div>)}</div></section>
    <section><h2 className="text-xl font-bold text-gray-900 mb-4">Admin Invitations</h2><div className="space-y-3">{(invites || []).map((invite) => <div key={invite.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-semibold text-gray-900">{invite.email}</p><p className={`text-sm mt-1 ${invite.status === 'rate_limited' || invite.status === 'email_failed' ? 'text-red-600 font-medium' : 'text-gray-500'}`}>Status: {statusLabel(invite.status)}</p></div><div className="flex gap-2">{['pending','resent','email_failed','rate_limited','revoked'].includes(invite.status) && <form action={resendInvite}><input type="hidden" name="id" value={invite.id}/><button className="border border-emerald-300 text-emerald-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-50">Resend Invitation</button></form>}{['pending','resent','email_failed','rate_limited'].includes(invite.status) && <form action={revokeInvite}><input type="hidden" name="id" value={invite.id}/><button className="border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50">Revoke</button></form>}</div></div>)}</div></section>
  </main>
}
