import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TempleListingsExplorer from '@/components/listings/TempleListingsExplorer'

export const metadata: Metadata = { title: 'Temples & Meditation Centres', description: 'Discover approved temples and meditation centres listed on Vallalar Jeevakarunyam.' }

export default async function TemplePage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`*, states (name), districts (name)`).eq('listing_type', 'temple').eq('status', 'approved').order('created_at', { ascending: false })
  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-8"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Temples & Meditation Centres</h1><p className="text-gray-600 mt-3 max-w-2xl leading-7">Discover approved temples and meditation centres supporting spiritual practice, compassion and service to living beings. Please confirm visiting hours directly before travelling.</p></div>
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8"><p className="font-semibold text-gray-900">Verification Notice</p><p className="text-sm text-gray-700 mt-2">Listings are published after administrative approval, but may still be awaiting verification by Vallalar Jeevakarunyam.</p></div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Temples & Meditation Centres. Please try again later.</div>}
    {!error && (!listings || listings.length === 0) && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No approved Temples & Meditation Centres yet</h2><p className="text-gray-600 mt-2">Know a temple or meditation centre that should be listed? Submit the details for review.</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg">Submit a Listing</Link></div>}
    {!error && listings && listings.length > 0 && <TempleListingsExplorer listings={listings} />}
  </div></main>
}
