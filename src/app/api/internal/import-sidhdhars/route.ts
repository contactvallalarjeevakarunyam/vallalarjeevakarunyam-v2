import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SOURCE_URL = 'https://sidhdhars.com/jeevasamadhi.php'
const MIRROR_URL = 'https://r.jina.ai/http://sidhdhars.com/jeevasamadhi.php'

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

function parseHtmlEntries(html: string): ParsedEntry[] {
  const matches = [...html.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<h5[^>]*>([\s\S]*?)<\/h5>([\s\S]*?)(?=<h3\b|<\/body>|$)/gi)]
  const entries: ParsedEntry[] = []
  for (const match of matches) {
    const name = text(match[1] || '')
    const place = text(match[2] || '')
    const tail = match[3] || ''
    if (!name || !place) continue
    const mapMatch = tail.match(/href=["']([^"']*(?:maps\.app\.goo\.gl|goo\.gl\/maps|google\.com\/maps)[^"']*)["']/i)
    const mapUrl = mapMatch ? decodeHtml(mapMatch[1]) : null
    const beforeMap = mapMatch ? tail.slice(0, mapMatch.index) : tail
    let address = text(beforeMap).replace(/^(?:address\s*:?\s*)/i, '').replace(/(?:map\s*link|learn\s*more).*$/i, '').trim()
    address = address.replace(/^\s*(?:Jeeva\s*Samadhi|Siddhar)\s*[-–:]?\s*/i, '').trim()
    entries.push({ name, place, address, mapUrl })
  }
  return entries
}

function parseMarkdownEntries(markdown: string): ParsedEntry[] {
  const matches = [...markdown.matchAll(/^###\s+(.+?)\s*$\n+^#####\s+(.+?)\s*$\n+([\s\S]*?)(?=^###\s+|\Z)/gmi)]
  const entries: ParsedEntry[] = []
  for (const match of matches) {
    const name = match[1].trim()
    const place = match[2].trim()
    const tail = match[3]
    if (!name || !place) continue
    const mapMatch = tail.match(/\[\s*Map\s*Link\s*\]\((https?:\/\/[^)]+)\)/i)
    const mapUrl = mapMatch?.[1] || null
    let beforeMap = mapMatch ? tail.slice(0, mapMatch.index) : tail
    beforeMap = beforeMap
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/^\s*(?:Image\s*\d*|Share|Learn More).*$/gmi, ' ')
    const address = beforeMap.replace(/\s+/g, ' ').trim()
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

async function fetchSource() {
  const direct = await fetch(SOURCE_URL, { cache: 'no-store', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VallalarJeevakarunyam/1.0)' } })
  if (direct.ok) return { body: await direct.text(), parser: 'html' as const, fetchedFrom: SOURCE_URL }
  const mirror = await fetch(MIRROR_URL, { cache: 'no-store' })
  if (!mirror.ok) throw new Error(`Direct source ${direct.status}; mirror ${mirror.status}`)
  return { body: await mirror.text(), parser: 'markdown' as const, fetchedFrom: MIRROR_URL }
}

export async function GET(request: Request) {
  if (process.env.VERCEL_ENV !== 'preview') return NextResponse.json({ error: 'Importer is preview-only.' }, { status: 403 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) return NextResponse.json({ error: 'Server credentials unavailable.' }, { status: 500 })

  let source
  try { source = await fetchSource() } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to fetch source' }, { status: 502 }) }
  const parsed = source.parser === 'html' ? parseHtmlEntries(source.body) : parseMarkdownEntries(source.body)
  const deduped = Array.from(new Map(parsed.map(entry => [`${norm(entry.name)}|${norm(entry.mapUrl || entry.address)}|${norm(entry.place)}`, entry])).values())

  const db = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false } })
  const { data: existing, error: existingError } = await db.from('listings').select('id,name,google_maps_url,description,village').eq('listing_type', 'jeeva_samadhi')
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })

  const existingKeys = new Set((existing || []).flatMap(row => {
    const name = norm(row.name)
    return [`${name}|${norm(row.google_maps_url)}`, `${name}|${norm(row.village)}`, `${name}|${norm(row.description)}`]
  }))

  const rows: Record<string, unknown>[] = []
  const skipped: ParsedEntry[] = []
  const unmapped: ParsedEntry[] = []
  for (const entry of deduped) {
    const name = norm(entry.name)
    const map = norm(entry.mapUrl)
    const place = norm(entry.place)
    const address = norm(entry.address)
    if (existingKeys.has(`${name}|${map}`) || existingKeys.has(`${name}|${place}`) || existingKeys.has(`${name}|${address}`)) { skipped.push(entry); continue }

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
    fetchedFrom: source.fetchedFrom,
    parser: source.parser,
    commit,
    parsedCount: parsed.length,
    uniqueSourceCount: deduped.length,
    existingSkippedCount: skipped.length,
    insertCandidateCount: rows.length,
    insertedCount: inserted.length,
    inserted,
    unmappedCount: unmapped.length,
    unmapped: unmapped.slice(0, 50),
    parsedSample: deduped.slice(0, 8),
  })
}
