'use client'

import ListingsExplorer, { type PublicListing } from '@/components/listings/ListingsExplorer'

type VerifiedListing = PublicListing & {
  verification_status?: string | null
}

export default function TempleListingsExplorer({ listings }: { listings: VerifiedListing[] }) {
  return <div className="space-y-5">
    <div className="flex flex-wrap gap-3 text-sm">
      <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold">✓ Verified by Vallalar Jeevakarunyam</span>
      <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800 font-semibold">● Yet to be verified by Vallalar Jeevakarunyam</span>
    </div>
    <div className="space-y-8">
      {listings.map((listing) => {
        const verified = listing.verification_status === 'verified'
        return <section key={listing.id} className={`rounded-2xl border-2 p-2 ${verified ? 'border-emerald-200 bg-emerald-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
          <div className="px-3 pt-2 pb-1">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {verified ? '✓ Verified by Vallalar Jeevakarunyam' : '● Yet to be verified by Vallalar Jeevakarunyam'}
            </span>
          </div>
          <ListingsExplorer listings={[listing]} badgeLabel="Temple / Meditation Centre" />
        </section>
      })}
    </div>
  </div>
}
