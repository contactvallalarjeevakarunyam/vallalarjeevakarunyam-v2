import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

export const metadata: Metadata = { title: 'Affordable Education', description: 'Find approved free and affordable education providers, schools, colleges, learning centres, coaching and skill-development services listed on Vallalar Jeevakarunyam.' }

export default async function EducationPage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`*, states (name), districts (name)`).eq('listing_type', 'education').eq('status', 'approved').order('created_at', { ascending: false })
  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-8"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Affordable Education</h1><p className="text-gray-600 mt-3 max-w-2xl leading-7">Find free and genuinely affordable schools, colleges, tuition and learning centres, vocational training, skill-development institutes and educational support services.</p></div>
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8"><p className="font-semibold text-gray-900">Education & Verification Notice</p><p className="text-sm text-gray-700 mt-2 leading-6">Listings are published after administrative approval, but may still be awaiting verification by Vallalar Jeevakarunyam. Please contact providers directly to confirm courses, eligibility, admission, fees, scholarships, timings and availability.</p></div>
    {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Affordable Education. Please try again later.</div>}
    {!error && (!listings || listings.length === 0) && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h2 className="text-xl font-semibold text-gray-900">No approved Affordable Education listings yet</h2><p className="text-gray-600 mt-2">Know a free or genuinely affordable education provider? Submit the details for review.</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg">Submit a Listing</Link></div>}
    {!error && listings && listings.length > 0 && <ListingsExplorer listings={listings} badgeLabel="Affordable Education" />}
  </div></main>
}
