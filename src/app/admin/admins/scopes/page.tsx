import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

const categories = [
  ['annadhanam', 'Annadhanam'],
  ['jeeva_samadhi', 'Jeeva Samadhi'],
  ['temple', 'Temples & Meditation Centres'],
  ['stay', 'Affordable Stays'],
  ['medical', 'Affordable Healthcare'],
  ['education', 'Affordable Education'],
  ['community_service', 'Volunteer & Community Service'],
] as const

function categoryLabel(value: string | null) {
  if (!value) return 'All categories'
  return categories.find(([key]) => key === value)?.[1] || value
}

function relationName(value: { name: string }[] | { name: string } | null | undefined) {
  if (Array.isArray(value)) return value[0]?.name
  return value?.name
}

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

export default async function AdminScopesPage() {
  await requireSuperAdmin()
  const service = getServiceClient()

  async function saveScope(formData: FormData) {
    'use server'
    const actor = await requireSuperAdmin()
    const adminClient = getServiceClient()
    const userId = String(formData.get('userId') || '').trim()
    const requestedState = String(formData.get('stateId') || '').trim()
    const requestedDistrict = String(formData.get('districtId') || '').trim()
    const requestedCategory = String(formData.get('listingType') || '').trim()
    if (!userId) return

    const { data: targetAdmin } = await adminClient.from('admins').select('user_id, role').eq('user_id', userId).maybeSingle()
    if (!targetAdmin || targetAdmin.role === 'super_admin') return

    let stateId = requestedState ? Number(requestedState) : null
    const districtId = requestedDistrict ? Number(requestedDistrict) : null
    const listingType = requestedCategory || null
    if ((stateId !== null && !Number.isInteger(stateId)) || (districtId !== null && !Number.isInteger(districtId))) return

    if (districtId !== null) {
      const { data: district } = await adminClient.from('districts').select('id, state_id').eq('id', districtId).maybeSingle()
      if (!district) return
      stateId = district.state_id
    }

    let existingQuery = adminClient.from('admin_scopes').select('id').eq('user_id', userId)
    existingQuery = stateId === null ? existingQuery.is('state_id', null) : existingQuery.eq('state_id', stateId)
    existingQuery = districtId === null ? existingQuery.is('district_id', null) : existingQuery.eq('district_id', districtId)
    existingQuery = listingType === null ? existingQuery.is('listing_type', null) : existingQuery.eq('listing_type', listingType)
    const { data: existing } = await existingQuery.maybeSingle()

    if (existing) {
      await adminClient.from('admin_scopes').update({
        is_active: true,
        can_review: true,
        can_verify: true,
        can_edit: false,
        created_by: actor.id,
      }).eq('id', existing.id)
    } else {
      await adminClient.from('admin_scopes').insert({
        user_id: userId,
        state_id: stateId,
        district_id: districtId,
        listing_type: listingType,
        can_review: true,
        can_verify: true,
        can_edit: false,
        is_active: true,
        created_by: actor.id,
      })
    }

    await adminClient.from('admin_activity_log').insert({
      actor_user_id: actor.id,
      action: 'scope_assigned',
      details: { target_user_id: userId, state_id: stateId, district_id: districtId, listing_type: listingType },
    })
    revalidatePath('/admin/admins/scopes')
    revalidatePath('/admin')
  }

  async function deactivateScope(formData: FormData) {
    'use server'
    const actor = await requireSuperAdmin()
    const adminClient = getServiceClient()
    const id = Number(formData.get('scopeId'))
    if (!Number.isInteger(id)) return
    const { data: scope } = await adminClient.from('admin_scopes').select('id, user_id, state_id, district_id, listing_type').eq('id', id).maybeSingle()
    if (!scope) return
    await adminClient.from('admin_scopes').update({ is_active: false }).eq('id', id)
    await adminClient.from('admin_activity_log').insert({
      actor_user_id: actor.id,
      action: 'scope_deactivated',
      details: {
        scope_id: scope.id,
        target_user_id: scope.user_id,
        state_id: scope.state_id,
        district_id: scope.district_id,
        listing_type: scope.listing_type,
      },
    })
    revalidatePath('/admin/admins/scopes')
    revalidatePath('/admin')
  }

  const [{ data: admins }, { data: scopes }, { data: states }, { data: districts }, authUsers] = await Promise.all([
    service.from('admins').select('user_id, role, created_at').order('created_at'),
    service.from('admin_scopes').select('id, user_id, state_id, district_id, listing_type, can_review, can_verify, can_edit, is_active, created_at, states(name), districts(name)').order('created_at'),
    service.from('states').select('id, name').order('name'),
    service.from('districts').select('id, name, state_id').order('name'),
    listAllAuthUsers(),
  ])

  const emailByUserId = new Map(authUsers.map(user => [user.id, user.email || user.id]))
  const stateById = new Map((states || []).map(state => [state.id, state.name]))

  return <main className="max-w-5xl mx-auto p-6">
    <Link href="/admin" className="text-emerald-700 font-semibold">← Admin Dashboard</Link>
    <div className="mt-6 mb-8">
      <p className="text-sm font-semibold text-emerald-700">Super Admin</p>
      <h1 className="text-3xl font-bold text-gray-900 mt-1">District & Category Admin Scopes</h1>
      <p className="text-gray-600 mt-2 leading-6">Assign each administrator only the geography and listing category they should manage. A district selection automatically uses that district&apos;s state.</p>
    </div>

    <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900 leading-6">
      <strong>Existing admins are protected:</strong> they currently have a legacy <strong>All states · All districts · All categories</strong> scope so today&apos;s workflow is unchanged. To restrict one, first add the desired scope(s), then deactivate that legacy global scope.
    </div>

    <div className="space-y-6">
      {(admins || []).map(admin => {
        const adminScopes = (scopes || []).filter(scope => scope.user_id === admin.user_id)
        const activeScopes = adminScopes.filter(scope => scope.is_active)
        return <section key={admin.user_id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-bold text-gray-900">{emailByUserId.get(admin.user_id) || 'Administrator'}</p>
              <p className="text-xs text-gray-500 mt-1">{admin.user_id}</p>
            </div>
            <span className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${admin.role === 'super_admin' ? 'bg-purple-50 text-purple-700' : 'bg-emerald-50 text-emerald-700'}`}>{admin.role === 'super_admin' ? 'Super Admin · Global access' : 'Admin'}</span>
          </div>

          {admin.role !== 'super_admin' && <>
            <div className="mt-5">
              <h2 className="font-semibold text-gray-900">Active scopes</h2>
              {activeScopes.length === 0 ? <p className="mt-2 text-sm text-amber-700">No active scope. This admin cannot manage pending/rejected listings until a scope is assigned.</p> : <div className="mt-3 space-y-2">
                {activeScopes.map(scope => {
                  const stateName = scope.state_id ? relationName(scope.states) || stateById.get(scope.state_id) || `State ${scope.state_id}` : 'All states'
                  const districtName = scope.district_id ? relationName(scope.districts) || `District ${scope.district_id}` : 'All districts'
                  return <div key={scope.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="text-sm text-gray-800"><strong>{stateName}</strong> · {districtName} · {categoryLabel(scope.listing_type)}</div>
                    <form action={deactivateScope}><input type="hidden" name="scopeId" value={scope.id}/><button className="text-sm font-semibold text-red-700 border border-red-200 bg-white rounded-lg px-3 py-1.5 hover:bg-red-50">Deactivate</button></form>
                  </div>
                })}
              </div>}
            </div>

            <form action={saveScope} className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
              <input type="hidden" name="userId" value={admin.user_id}/>
              <h3 className="font-semibold text-gray-900">Add / reactivate a scope</h3>
              <p className="text-xs text-gray-600 mt-1">Examples: Karnataka + Davanagere + Affordable Education, or Tamil Nadu + All districts + Annadhanam.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">State</label><select name="stateId" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm"><option value="">All states</option>{(states || []).map(state => <option key={state.id} value={state.id}>{state.name}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">District</label><select name="districtId" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm"><option value="">All districts</option>{(districts || []).map(district => <option key={district.id} value={district.id}>{district.name} — {stateById.get(district.state_id) || 'State'}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Category</label><select name="listingType" className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2 text-sm"><option value="">All categories</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
              </div>
              <button className="mt-4 bg-emerald-700 text-white font-semibold rounded-lg px-5 py-2.5 hover:bg-emerald-800">Save Scope</button>
            </form>
          </>}
        </section>
      })}
    </div>
  </main>
}
