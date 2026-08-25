import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://sidhdhars.com/jeevasamadhi.php'

type ParsedEntry = { name: string; place: string; address: string; mapUrl: string | null }

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

function text(value: string) {
  return decodeHtml(value.replace(/<br\s*\/?\s*>/gi, ', ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .replace(/\s+,/g, ',')
    .trim()
}

function parseEntries(html: string): ParsedEntry[] {
  const matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h5[^>]*>([\s\S]*?)<\/h5>([\s\S]*?)(?=<h3\b|<\/body>|$)/gi)]
  const entries: ParsedEntry[] = []
  for (const match of matches) {
    const name = text(match[1] || '')
    const place = text(match[2] || '')
    const tail = match[3] || ''
    if (!name || !place) continue

    const mapMatch = tail.match(/href=["']([^"']*(?:maps\.app\.goo\.gl|goo\.gl\/maps|google\.com\/maps)[^"']*)["']/i)
    const mapUrl = mapMatch ? decodeHtml(mapMatch[1]) : null

    // Keep only the human-readable text before the map link / action buttons.
    const beforeMap = mapMatch ? tail.slice(0, mapMatch.index) : tail
    let address = text(beforeMap)
      .replace(/^(?:address\s*:?\s*)/i, '')
      .replace(/(?:map\s*link|learn\s*more).*$/i, '')
      .trim()

    // Card markup can include image alt text or decorative labels. Remove common noise.
    address = address.replace(/^\s*(?:Jeeva\s*Samadhi|Siddhar)\s*[-–:]?\s*/i, '').trim()
    entries.push({ name, place, address, mapUrl })
  }
  return entries
}

function geography(place: string, address: string) {
  const p = place.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const a = address.toLowerCase()
  const combined = `${p} ${a}`

  if (/puducherry|pondicherry/.test(combined)) return { stateId: 6, districtId: 143 }
  if (/narayanavanam|\bputtur\b|andhra pradesh/.test(combined)) return { stateId: 4, districtId: 105 }
  if (/dindigul/.test(combined)) return { stateId: 1, districtId: 7 }
  if (/mailam|tindivanam|villupuram|viluppuram/.test(combined)) return { stateId: 1, districtId: 37 }
  if (/ranipet|arcot|arakkonam/.test(combined)) return { stateId: 1, districtId: 22 }
  if (/tiruvallur|thiruvallur|thiruttani|thiruthani|periyapalayam|siruvapuri/.test(combined)) return { stateId: 1, districtId: 33 }
  if (/kanchipuram|kancheepuram/.test(combined)) return { stateId: 1, districtId: 10 }
  if (/chengalpattu|kalpakkam|mahabalipuram|mamallapuram|kovalam/.test(combined)) return { stateId: 1, districtId: 2 }
  if (/chennai|madras|vadapalani|mylapore|guindy|saidapet|kodambakkam|nesapakkam|alandur/.test(combined)) return { stateId: 1, districtId: 3 }
  if (/tamil nadu|tamilnadu/.test(combined)) return { stateId: 1, districtId: null }
  return { stateId: null as number | null, districtId: null as number | null }
}

function norm(value: string | null | undefined) {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

export async function GET(request: Request) {
  // This is a one-time controlled importer. It must never be executable in production.
  if (process.env.VERCEL_ENV !== 'preview') {
    return NextResponse.json({ error: 'Importer is preview-only.' }, { status: 403 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) return NextResponse.json({ error: 'Server credentials unavailable.' }, { status: 500 })

  const sourceResponse = await fetch(SOURCE_URL, { cache: 'no-store', headers: { 'User-Agent': 'VallalarJeevakarunyam/1.0 research-import' } })
  if (!sourceResponse.ok) return NextResponse.json({ error: `Source returned ${sourceResponse.status}` }, { status: 502 })
  const html = await sourceResponse.text()
  const parsed = parseEntries(html)

  const deduped = Array.from(new Map(parsed.map(entry => [`${norm(entry.name)}|${norm(entry.mapUrl || entry.address)}|${norm(entry.place)}`, entry])).values())
  const db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: existing, error: existingError } = await db.from('listings').select('id,name,google_maps_url,description,village').eq('listing_type', 'jeeva_samadhi')
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })

  const existingKeys = new Set((existing || []).flatMap(row => {
    const name = norm(row.name)
    const map = norm(row.google_maps_url)
    const desc = norm(row.description)
    const village = norm(row.village)
    return [`${name}|${map}`, `${name}|${village}`, `${name}|${desc}`]
  }))

  const rows = [] as Record<string, unknown>[]
  const skipped: ParsedEntry[] = []
  const unmapped: ParsedEntry[] = []
  for (const entry of deduped) {
    const name = norm(entry.name)
    const map = norm(entry.mapUrl)
    const place = norm(entry.place)
    const address = norm(entry.address)
    if (existingKeys.has(`${name}|${map}`) || existingKeys.has(`${name}|${place}`) || existingKeys.has(`${name}|${address}`)) {
      skipped.push(entry)
      continue
    }

    const geo = geography(entry.place, entry.address)
    if (!geo.stateId) unmapped.push(entry)
    rows.push({
      listing_type: 'jeeva_samadhi',
      name: entry.name,
      description: `Jeeva Samadhi public-reference location: ${entry.address || entry.place}. Source details are from Sidhdhars.com and require direct confirmation by Vallalar Jeevakarunyam.`,
      state_id: geo.stateId,
      district_id: geo.districtId,
      village: entry.place || null,
      google_maps_url: entry.mapUrl,
      website: SOURCE_URL,
      status: 'approved',
      verification_status: 'pending_verification',
      source_type: 'admin_added',
      source_url: SOURCE_URL,
      verification_notes: 'Third-party public directory supplied for research. Location/map listed by Sidhdhars.com; not independently verified by Vallalar Jeevakarunyam.',
    })
  }

  const commit = new URL(request.url).searchParams.get('commit') === '1'
  let inserted: { id: number; name: string }[] = []
  if (commit && rows.length) {
    const { data, error } = await db.from('listings').insert(rows).select('id,name')
    if (error) return NextResponse.json({ error: error.message, parsed: parsed.length, deduped: deduped.length, pendingInsert: rows.length }, { status: 500 })
    inserted = data || []
  }

  return NextResponse.json({
    source: SOURCE_URL,
    commit,
    parsedCount: parsed.length,
    uniqueSourceCount: deduped.length,
    existingSkippedCount: skipped.length,
    insertCandidateCount: rows.length,
    insertedCount: inserted.length,
    inserted,
    unmappedCount: unmapped.length,
    unmapped: unmapped.slice(0, 30),
    parsedSample: deduped.slice(0, 5),
  })
}
