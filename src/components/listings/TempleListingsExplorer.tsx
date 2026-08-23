'use client'

import ListingsExplorer, { type PublicListing } from '@/components/listings/ListingsExplorer'

type VerifiedListing = PublicListing & {
  verification_status?: string | null
}

export default function TempleListingsExplorer({ listings }: { listings: VerifiedListing[] }) {
  return (
    <ListingsExplorer
      listings={listings}
      badgeLabel="Temple / Meditation Centre"
      showVerificationBadge
    />
  )
}
