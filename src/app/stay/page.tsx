import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

export const metadata: Metadata = {
  title: 'Affordable Stays',
  description: 'Find approved free and affordable accommodation options listed on Vallalar Jeevakarunyam.',
}

export default async function StayPage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`*, states (name), districts (name)`).eq('listing_type', 'stay').eq('status', 'approved').order('created_at', { ascending: false })

  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-8"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Affordable Stays</h1><p className="text-gray-600 mt-3 max-w-2xl leading-7">Find approved free and affordable accommodation options for pilgrims, travellers and people in need. Please confirm charges, eligibility, facilities and availability directly before travelling.</p></div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Affordable Stays. Please try again later.</div>}
    {!error && (!listings || listings.length === 0) && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No approved Affordable Stays yet</h2><p className="text-gray-600 mt-2">Know a free or affordable stay? Submit the details for review.</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition">Submit a Listing</Link></div>}
    {!error && listings && listings.length > 0 && <ListingsExplorer listings={listings} badgeLabel="Affordable Stay" />}
    {!error && listings && listings.length > 0 && <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center"><p className="font-semibold text-gray-900">Know another free or affordable stay?</p><p className="text-sm text-gray-600 mt-1">Help others by submitting accurate public information for review.</p><Link href="/submit" className="inline-flex mt-4 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-white transition">Submit a Listing</Link></div>}
  </div></main>
}
