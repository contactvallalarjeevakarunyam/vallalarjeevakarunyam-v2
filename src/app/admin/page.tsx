import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LogoutButton from '@/components/admin/LogoutButton'

type AdminPageProps = { searchParams: Promise<{ status?: string }> }

function getListingTypeLabel(type: string | null) {
  const labels: Record<string,string> = { annadhanam:'Annadhanam', jeeva_samadhi:'Jeeva Samadhi', temple:'Temples & Meditation Centres', stay:'Affordable Stays', medical:'Affordable Medical Services', community_service:'Community Service', volunteer:'Volunteer Services' }
  return type ? labels[type] || type : '-'
}
function getServiceTypeLabel(type: string | null) {
  const labels: Record<string,string> = { ulavara_pani:'Ulavara Pani', water_body_restoration:'Water Body Restoration', tree_planting:'Tree Planting', environmental_conservation:'Environmental Conservation', temple_service:'Temple Service', heritage_conservation:'Heritage Conservation', food_service:'Annadhanam / Food Service', animal_welfare:'Animal Welfare', community_social_service:'Community / Social Service', other:'Other' }
  return type ? labels[type] || type : '-'
}
function revalidateListingPages(){['/admin','/','/annadhanam','/jeeva-samadhi','/temple','/stay','/medical','/volunteer','/map'].forEach((path)=>revalidatePath(path))}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const supabase = await createClient()
  const { data:{ user } } = await supabase.auth.getUser()
  if(!user) redirect('/admin/login')
  const { data:admin } = await supabase.from('admins').select('user_id, role').eq('user_id',user.id).maybeSingle()
  if(!admin) return <main className="max-w-6xl mx-auto p-6"><h1 className="text-3xl font-bold mb-4">Access Denied</h1><div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">You do not have permission to access the admin area.</div></main>

  const params=await searchParams
  const allowedStatuses=['pending','approved','rejected']
  const activeStatus=allowedStatuses.includes(params.status||'') ? params.status! : 'pending'

  async function changeStatus(formData:FormData,status:'approved'|'rejected'){
    'use server'
    const listingId=Number(formData.get('listingId')); if(!Number.isInteger(listingId)) return
    const db=await createClient(); const {data:{user:actor}}=await db.auth.getUser(); if(!actor) redirect('/admin/login')
    const {data:actorAdmin}=await db.from('admins').select('user_id').eq('user_id',actor.id).maybeSingle(); if(!actorAdmin) return
    const {error}=await db.from('listings').update({status}).eq('id',listingId).eq('status','pending'); if(error){console.error('Listing status update error:',error);return}
    revalidateListingPages()
  }
  async function approveListing(formData:FormData){'use server';await changeStatus(formData,'approved')}
  async function rejectListing(formData:FormData){'use server';await changeStatus(formData,'rejected')}

  const [pendingResult,approvedResult,rejectedResult]=await Promise.all([
    supabase.from('listings').select('*',{count:'exact',head:true}).eq('status','pending'),
    supabase.from('listings').select('*',{count:'exact',head:true}).eq('status','approved'),
    supabase.from('listings').select('*',{count:'exact',head:true}).eq('status','rejected')
  ])
  const counts={pending:pendingResult.count??0,approved:approvedResult.count??0,rejected:rejectedResult.count??0}
  const {data:listings,error}=await supabase.from('listings').select('*, states(name), districts(name)').eq('status',activeStatus).order('created_at',{ascending:false})
  if(error) return <main className="max-w-6xl mx-auto p-6"><h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1><div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">Unable to load listings: {error.message}</div></main>
  const title=activeStatus==='pending'?'Pending Listings':activeStatus==='approved'?'Approved Listings':'Rejected Listings'

  return <main className="max-w-6xl mx-auto p-4 sm:p-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1><p className="text-gray-600 mt-2">Vallalar Jeevakarunyam Listings</p>{admin.role==='super_admin'&&<Link href="/admin/admins" className="inline-flex mt-3 text-sm font-semibold text-emerald-700 hover:underline">Manage Administrators →</Link>}</div><LogoutButton/></div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {(['pending','approved','rejected'] as const).map(status=><Link key={status} href={`/admin?status=${status}`} className={`rounded-xl border p-5 transition ${activeStatus===status?(status==='pending'?'border-yellow-400 bg-yellow-50':status==='approved'?'border-emerald-500 bg-emerald-50':'border-red-400 bg-red-50'):'border-gray-200 bg-white hover:bg-gray-50'}`}><p className="text-sm font-medium text-gray-600 capitalize">{status}</p><p className="text-3xl font-bold text-gray-900 mt-2">{counts[status]}</p></Link>)}
    </div>
    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
    {!listings||listings.length===0?<div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700">No {activeStatus} listings.</div>:<div className="space-y-5">{listings.map(listing=><article key={listing.id} className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"><div><h3 className="text-xl font-semibold text-gray-900">{listing.name}</h3><p className="text-sm text-emerald-700 font-medium mt-1">{getListingTypeLabel(listing.listing_type)}</p>{listing.listing_type==='community_service'&&listing.service_type&&<p className="text-sm text-gray-600 mt-1"><strong>Service Type:</strong> {getServiceTypeLabel(listing.service_type)}</p>}</div><span className={`inline-flex w-fit px-3 py-1 text-sm font-medium rounded-full ${activeStatus==='pending'?'bg-yellow-100 text-yellow-800':activeStatus==='approved'?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{activeStatus[0].toUpperCase()+activeStatus.slice(1)}</span></div>
      {listing.description&&<p className="text-gray-700 mt-4">{listing.description}</p>}
      {listing.timing&&<div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-lg p-4"><p className="text-sm font-semibold text-emerald-800 mb-1">🕐 Timing / Schedule</p><p className="text-gray-800 whitespace-pre-line">{listing.timing}</p></div>}
      <section className="mt-6"><h4 className="font-semibold text-gray-900 mb-3">Location</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><p><strong>State:</strong> {listing.states?.name||'-'}</p><p><strong>District:</strong> {listing.districts?.name||'-'}</p><p><strong>Taluk / Sub-District:</strong> {listing.taluk||'-'}</p><p><strong>Panchayat / Municipality:</strong> {listing.panchayat||'-'}</p><p><strong>Village / Town:</strong> {listing.village||'-'}</p></div>{listing.google_maps_url&&<a href={listing.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex mt-4 text-emerald-700 hover:underline font-medium">📍 Open Google Maps</a>}</section>
      <section className="border-t border-gray-200 mt-6 pt-5"><h4 className="font-semibold text-gray-900 mb-1">Place / Organisation Contact</h4><p className="text-xs text-gray-500 mb-3">Public-facing contact information</p><div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><p><strong>Contact:</strong> {listing.contact_person||'-'}</p><p><strong>Phone:</strong> {listing.phone||'-'}</p><p><strong>Email:</strong> {listing.email||'-'}</p><p><strong>WhatsApp:</strong> {listing.whatsapp||'-'}</p>{listing.website&&<p className="md:col-span-2 break-all"><strong>Website:</strong> <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">{listing.website}</a></p>}</div></section>
      <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50/60 p-5"><div className="flex flex-wrap items-center justify-between gap-2 mb-3"><div><h4 className="font-semibold text-gray-900">🔒 Private Submitter Details</h4><p className="text-xs text-gray-600 mt-1">For administrator verification only — never displayed publicly.</p></div>{listing.submitter_declaration&&<span className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">✓ Declaration confirmed</span>}</div>{listing.submitter_name||listing.submitter_email||listing.submitter_phone?<div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm"><p><strong>Name:</strong> {listing.submitter_name||'-'}</p><p className="break-all"><strong>Email:</strong> {listing.submitter_email||'-'}</p><p><strong>Mobile:</strong> {listing.submitter_phone||'-'}</p></div>:<p className="text-sm text-gray-600">No submitter details were captured for this older listing.</p>}</section>
      {activeStatus==='pending'&&<div className="border-t border-gray-200 mt-6 pt-5 flex flex-col sm:flex-row gap-3"><form action={approveListing}><input type="hidden" name="listingId" value={listing.id}/><button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800">✓ Approve</button></form><form action={rejectListing}><input type="hidden" name="listingId" value={listing.id}/><button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">✕ Reject</button></form></div>}
    </article>)}</div>}
  </main>
}
