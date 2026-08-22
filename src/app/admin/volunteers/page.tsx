import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type Props = { searchParams: Promise<{ status?: string }> }

export default async function VolunteerApplicationsAdmin({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: admin } = await supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
  if (!admin) return <main className="max-w-6xl mx-auto p-6"><h1 className="text-3xl font-bold mb-4">Access Denied</h1><div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">You do not have permission to access the admin area.</div></main>

  const params = await searchParams
  const statuses = ['pending', 'approved', 'rejected']
  const activeStatus = statuses.includes(params.status || '') ? params.status! : 'pending'

  async function updateApplication(formData: FormData) {
    'use server'
    const id = Number(formData.get('applicationId'))
    const status = String(formData.get('status') || '')
    if (!Number.isInteger(id) || !['approved', 'rejected'].includes(status)) return

    const db = await createClient()
    const { data: { user } } = await db.auth.getUser()
    if (!user) redirect('/admin/login')
    const { data: admin } = await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle()
    if (!admin) return

    const { error } = await db.from('volunteer_applications').update({ status }).eq('id', id).eq('status', 'pending')
    if (error) console.error('Volunteer application update error:', error)
    revalidatePath('/admin/volunteers')
  }

  const [pending, approved, rejected] = await Promise.all([
    supabase.from('volunteer_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('volunteer_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('volunteer_applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
  ])

  const { data: applications, error } = await supabase.from('volunteer_applications').select('*').eq('status', activeStatus).order('created_at', { ascending: false })

  return <main className="max-w-6xl mx-auto p-6">
    <div className="mb-8"><Link href="/admin" className="text-sm font-semibold text-emerald-700 hover:underline">← Back to Listings Admin</Link><h1 className="text-3xl font-bold text-gray-900 mt-4">Volunteer Applications</h1><p className="text-gray-600 mt-2">Review people who have registered to help Vallalar Jeevakarunyam.</p></div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {[['pending', pending.count ?? 0], ['approved', approved.count ?? 0], ['rejected', rejected.count ?? 0]].map(([status, count]) => <Link key={String(status)} href={`/admin/volunteers?status=${status}`} className={`rounded-xl border p-5 ${activeStatus === status ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}><p className="text-sm font-medium text-gray-600 capitalize">{status}</p><p className="text-3xl font-bold mt-2">{count}</p></Link>)}
    </div>

    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load volunteer applications: {error.message}</div>}
    {!error && (!applications || applications.length === 0) && <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700">No {activeStatus} volunteer applications.</div>}

    {!error && applications && applications.length > 0 && <div className="space-y-5">{applications.map((application) => <article key={application.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:justify-between gap-4"><div><h2 className="text-xl font-bold text-gray-900">{application.name}</h2><p className="text-sm text-gray-500 mt-1">Submitted {new Date(application.created_at).toLocaleString('en-IN')}</p></div><span className="capitalize w-fit px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">{application.status}</span></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 text-sm text-gray-700">
        <p><span className="font-semibold">Mobile:</span> <a className="text-emerald-700 hover:underline" href={`tel:${application.phone}`}>{application.phone}</a></p>
        <p><span className="font-semibold">WhatsApp:</span> {application.whatsapp || '-'}</p>
        <p><span className="font-semibold">Email:</span> {application.email || '-'}</p>
        <p><span className="font-semibold">Location:</span> {application.city}, {application.state}</p>
      </div>
      <div className="mt-5"><p className="font-semibold text-gray-900 text-sm mb-2">Interested in helping with</p><div className="flex flex-wrap gap-2">{(application.interests || []).map((interest: string) => <span key={interest} className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-800">{interest}</span>)}</div></div>
      {application.message && <div className="mt-5 bg-gray-50 rounded-lg p-4"><p className="text-sm font-semibold text-gray-900 mb-1">Message</p><p className="text-gray-700 whitespace-pre-line">{application.message}</p></div>}
      {activeStatus === 'pending' && <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-gray-100"><form action={updateApplication}><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="status" value="approved" /><button className="px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800">Approve</button></form><form action={updateApplication}><input type="hidden" name="applicationId" value={application.id} /><input type="hidden" name="status" value="rejected" /><button className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Reject</button></form></div>}
    </article>)}</div>}
  </main>
}
