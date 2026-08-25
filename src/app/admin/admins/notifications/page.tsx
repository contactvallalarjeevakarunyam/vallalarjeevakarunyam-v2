import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) throw new Error('Supabase admin credentials are not configured')
  return createServiceClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
}

async function requireSuperAdmin() {
  const db = await createClient()
  const { data: { user } } = await db.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: admin } = await db.from('admins').select('role').eq('user_id', user.id).maybeSingle()
  if (admin?.role !== 'super_admin') redirect('/admin')
  return user
}

async function listAllAuthUsers() {
  const service = getServiceClient()
  const users: { id: string; email?: string | null }[] = []
  let page = 1
  while (page <= 20) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    users.push(...data.users.map(user => ({ id: user.id, email: user.email })))
    if (data.users.length < 100) break
    page += 1
  }
  return users
}

export default async function AdminNotificationSettingsPage() {
  await requireSuperAdmin()
  const service = getServiceClient()

  async function savePreferences(formData: FormData) {
    'use server'
    const actor = await requireSuperAdmin()
    const adminClient = getServiceClient()
    const userId = String(formData.get('userId') || '').trim()
    if (!userId) return

    const { data: targetAdmin } = await adminClient.from('admins').select('user_id').eq('user_id', userId).maybeSingle()
    if (!targetAdmin) return

    const notifyPendingListings = formData.get('notifyPendingListings') === 'on'
    const emailEnabled = formData.get('emailEnabled') === 'on'
    const whatsappEnabled = formData.get('whatsappEnabled') === 'on'
    const notificationEmail = String(formData.get('notificationEmail') || '').trim().toLowerCase() || null
    const whatsappNumber = String(formData.get('whatsappNumber') || '').trim() || null

    if (notificationEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notificationEmail)) return
    if (whatsappEnabled && (!whatsappNumber || whatsappNumber.replace(/\D/g, '').length < 11)) return

    await adminClient.from('admin_notification_preferences').upsert({
      user_id: userId,
      notify_pending_listings: notifyPendingListings,
      email_enabled: emailEnabled,
      notification_email: notificationEmail,
      whatsapp_enabled: whatsappEnabled,
      whatsapp_number: whatsappNumber,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    await adminClient.from('admin_activity_log').insert({
      actor_user_id: actor.id,
      action: 'notification_preferences_updated',
      details: {
        target_user_id: userId,
        notify_pending_listings: notifyPendingListings,
        email_enabled: emailEnabled,
        whatsapp_enabled: whatsappEnabled,
      },
    })

    revalidatePath('/admin/admins/notifications')
  }

  const [{ data: admins }, { data: preferences }, authUsers] = await Promise.all([
    service.from('admins').select('user_id, role, created_at').order('created_at'),
    service.from('admin_notification_preferences').select('user_id, notify_pending_listings, email_enabled, notification_email, whatsapp_enabled, whatsapp_number'),
    listAllAuthUsers(),
  ])

  const emailByUserId = new Map(authUsers.map(user => [user.id, user.email || '']))
  const preferenceByUserId = new Map((preferences || []).map(preference => [preference.user_id, preference]))

  return <main className="max-w-5xl mx-auto p-6">
    <div className="flex flex-wrap gap-4">
      <Link href="/admin" className="text-emerald-700 font-semibold">← Admin Dashboard</Link>
      <Link href="/admin/admins/scopes" className="text-emerald-700 font-semibold">District & Category Scopes →</Link>
    </div>

    <div className="mt-6 mb-8">
      <p className="text-sm font-semibold text-emerald-700">Super Admin</p>
      <h1 className="text-3xl font-bold text-gray-900 mt-1">Admin Alert Settings</h1>
      <p className="text-gray-600 mt-2 leading-6">Choose how each administrator should be alerted when a new listing is submitted and is pending approval. Alerts are automatically limited to the administrator&apos;s assigned state, district and category scope.</p>
    </div>

    <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 leading-6">
      <strong>Email:</strong> enabled by default and sent to the admin&apos;s login email unless an override is entered. <strong>WhatsApp:</strong> opt-in and requires the administrator&apos;s number with country code. Provider credentials are stored only in Supabase Edge Function secrets, never in this page or the browser.
    </div>

    <div className="space-y-6">
      {(admins || []).map(admin => {
        const preference = preferenceByUserId.get(admin.user_id)
        const loginEmail = emailByUserId.get(admin.user_id) || ''
        const notifyPendingListings = preference?.notify_pending_listings ?? true
        const emailEnabled = preference?.email_enabled ?? true
        const whatsappEnabled = preference?.whatsapp_enabled ?? false

        return <section key={admin.user_id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">{loginEmail || 'Administrator'}</p>
              <p className="text-xs text-gray-500 mt-1">{admin.user_id}</p>
            </div>
            <span className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${admin.role === 'super_admin' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>{admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}</span>
          </div>

          <form action={savePreferences} className="mt-5 space-y-5">
            <input type="hidden" name="userId" value={admin.user_id}/>

            <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 cursor-pointer">
              <input type="checkbox" name="notifyPendingListings" defaultChecked={notifyPendingListings} className="mt-1 h-4 w-4 accent-emerald-700"/>
              <span><strong className="text-gray-900">Alert for new pending listings</strong><span className="block text-sm text-gray-600 mt-1">Only listings matching this admin&apos;s assigned scope will trigger an alert.</span></span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-gray-200 p-4">
                <label className="flex items-center gap-2 font-semibold text-gray-900"><input type="checkbox" name="emailEnabled" defaultChecked={emailEnabled} className="h-4 w-4 accent-emerald-700"/> Email alert</label>
                <label className="block text-xs font-semibold text-gray-700 mt-4 mb-1">Notification email override</label>
                <input name="notificationEmail" type="email" defaultValue={preference?.notification_email || ''} placeholder={loginEmail || 'admin@example.com'} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
                <p className="text-xs text-gray-500 mt-2">Leave blank to use the administrator&apos;s login email.</p>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <label className="flex items-center gap-2 font-semibold text-gray-900"><input type="checkbox" name="whatsappEnabled" defaultChecked={whatsappEnabled} className="h-4 w-4 accent-emerald-700"/> WhatsApp alert</label>
                <label className="block text-xs font-semibold text-gray-700 mt-4 mb-1">WhatsApp number</label>
                <input name="whatsappNumber" type="tel" defaultValue={preference?.whatsapp_number || ''} placeholder="+919876543210" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"/>
                <p className="text-xs text-gray-500 mt-2">Include country code. The number must have opted in to receive business alerts.</p>
              </div>
            </div>

            <button className="bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-emerald-800">Save Alert Settings</button>
          </form>
        </section>
      })}
    </div>
  </main>
}
