import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

export const metadata: Metadata = {
  title: 'Jeeva Samadhi',
  description: 'Discover approved Jeeva Samadhi locations listed on Vallalar Jeevakarunyam.',
}

export default async function JeevaSamadhiPage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`*, states (name), districts (name)`).eq('listing_type', 'jeeva_samadhi').eq('status', 'approved').eq('verification_status', 'verified').order('created_at', { ascending: false })

  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-8"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Jeeva Samadhi</h1><p className="text-gray-600 mt-3 max-w-2xl leading-7">Discover approved Jeeva Samadhi locations and sacred spaces for spiritual practice and meditation. Please confirm visiting hours and access details directly before travelling.</p></div>

    <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5 md:p-6">
      <p className="text-sm font-semibold text-amber-900">Public reference directory</p>
      <h2 className="text-lg font-bold text-gray-900 mt-1">Sidhdhars.com Jeeva Samadhi Directory</h2>
      <p className="text-sm text-gray-700 mt-2 leading-6">We are using this third-party public directory as one research source to expand Jeeva Samadhi locations. Imported entries remain marked <strong>Yet to be verified by Vallalar Jeevakarunyam</strong> until our admins directly confirm them.</p>
      <a href="https://sidhdhars.com/jeevasamadhi.php" target="_blank" rel="noreferrer" className="inline-flex mt-4 px-4 py-2 border border-amber-700 text-amber-800 font-semibold rounded-lg bg-white hover:bg-amber-100 transition">Open Sidhdhars.com Directory ↗</a>
    </div>

    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Jeeva Samadhi listings. Please try again later.</div>}
    {!error && (!listings || listings.length === 0) && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No approved Jeeva Samadhi listings yet</h2><p className="text-gray-600 mt-2">Know a Jeeva Samadhi? Submit the details for review.</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg hover:bg-emerald-800 transition">Submit a Listing</Link></div>}
    {!error && listings && listings.length > 0 && <ListingsExplorer listings={listings} badgeLabel="Jeeva Samadhi" />}
    {!error && listings && listings.length > 0 && <div className="mt-10 bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-center"><p className="font-semibold text-gray-900">Know another Jeeva Samadhi?</p><p className="text-sm text-gray-600 mt-1">Help others by submitting accurate public information for review.</p><Link href="/submit" className="inline-flex mt-4 px-5 py-2.5 border border-emerald-700 text-emerald-700 font-semibold rounded-lg hover:bg-white transition">Submit a Listing</Link></div>}
  </div></main>
}
