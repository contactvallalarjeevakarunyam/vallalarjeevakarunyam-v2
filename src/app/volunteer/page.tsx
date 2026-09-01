import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ListingsExplorer from '@/components/listings/ListingsExplorer'

export const metadata: Metadata = { title: 'Volunteer & Community Service', description: 'Volunteer with Vallalar Jeevakarunyam and discover approved compassionate, environmental and community service groups.' }

export default async function VolunteerPage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase.from('listings').select(`*, states (name), districts (name)`).eq('listing_type', 'community_service').eq('status', 'approved').order('created_at', { ascending: false })
  return <main className="min-h-screen bg-gray-50"><div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
    <div className="mb-10"><Link href="/" className="inline-flex text-sm font-semibold text-emerald-700 hover:underline mb-5">← Back to Home</Link><p className="text-sm font-semibold text-emerald-700 mb-2">Vallalar Jeevakarunyam</p><h1 className="text-3xl md:text-4xl font-bold text-gray-900">Volunteer & Community Service</h1><p className="text-gray-600 mt-3 max-w-3xl leading-7">Contribute to Vallalar Jeevakarunyam or connect with organisations and groups carrying out compassionate, environmental and community service.</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-14"><section className="bg-white border border-emerald-200 rounded-2xl p-6 md:p-7 shadow-sm"><div className="text-4xl mb-4">🤝</div><h2 className="text-2xl font-bold text-gray-900">Volunteer With Us</h2><p className="text-gray-600 mt-3 leading-7">Help identify useful services, verify information submitted by the public and keep our listings accurate and useful for everyone.</p><Link href="/volunteer/register" className="inline-flex mt-7 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg">Register as Volunteer →</Link><p className="text-xs text-gray-500 mt-3">Volunteer registration does not provide admin access. Final listing approval remains with the Vallalar Jeevakarunyam administrators.</p></section><section className="bg-white border border-emerald-200 rounded-2xl p-6 md:p-7 shadow-sm"><div className="text-4xl mb-4">🌱</div><h2 className="text-2xl font-bold text-gray-900">Join Community Service</h2><p className="text-gray-600 mt-3 leading-7">Find organisations and groups already carrying out social, environmental and compassionate service.</p><a href="#community-services" className="inline-flex mt-7 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg">Find Community Services ↓</a></section></div>
    <section id="community-services" className="scroll-mt-24"><div className="mb-7"><p className="text-sm font-semibold text-emerald-700 mb-2">Community Directory</p><h2 className="text-2xl md:text-3xl font-bold text-gray-900">Community Service Groups</h2><p className="text-gray-600 mt-3 max-w-3xl leading-7">Discover approved organisations, groups and service initiatives. Approved listings may still be awaiting verification by Vallalar Jeevakarunyam.</p></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5">Unable to load Community Service listings. Please try again later.</div>}
      {!error && (!listings || listings.length === 0) && <div className="bg-white border border-gray-200 rounded-xl p-8 text-center"><h3 className="text-xl font-semibold text-gray-900">No approved Community Service groups yet</h3><p className="text-gray-600 mt-2">Know an organisation or group doing community service?</p><Link href="/submit" className="inline-flex mt-5 px-5 py-2.5 bg-emerald-700 text-white font-semibold rounded-lg">＋ Submit a Community Service Group</Link></div>}
      {!error && listings && listings.length > 0 && <ListingsExplorer listings={listings} badgeLabel="Community Service" showServiceTypeFilter={true} />}
    </section>
  </div></main>
}
