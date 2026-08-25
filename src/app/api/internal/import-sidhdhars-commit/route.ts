import { GET as runImporter } from '../import-sidhdhars/route'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  url.pathname = '/api/internal/import-sidhdhars'
  url.searchParams.set('commit', '1')
  return runImporter(new Request(url.toString(), { headers: request.headers }))
}
