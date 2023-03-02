import { ResponseCompat, handleResponseError, setCaching } from '@/utils/api/common'
import { maxItems } from '@cfg/site.config'
import { NextRequest } from 'next/server'
import { fetchWithAuth } from '../od-api/fetchWithAuth'
import { getRequsetURL } from '../od-api/odRequest'

/**
 * Sanitize the search query
 *
 * @param query User search query, which may contain special characters
 * @returns Sanitised query string, which:
 * - encodes the '<' and '>' characters,
 * - replaces '?' and '/' characters with ' ',
 * - replaces ''' with ''''
 * Reference: https://stackoverflow.com/questions/41491222/single-quote-escaping-in-microsoft-graph.
 */
function sanitiseQuery(query: string): string {
  const sanitisedQuery = query
    .replace(/'/g, "''")
    .replace('<', ' &lt; ')
    .replace('>', ' &gt; ')
    .replace('?', ' ')
    .replace('/', ' ')
  return encodeURIComponent(sanitisedQuery)
}

export default async function handler(req: NextRequest) {
  // Query parameter from request
  const searchQuery = req.nextUrl.searchParams.get('q') ?? ''

  const headers = new Headers()

  setCaching(headers)

  if (typeof searchQuery !== 'string') return ResponseCompat.json([], { status: 200, headers })

  // Construct Microsoft Graph Search API URL, and perform search only under the base directory
  const searchApi = getRequsetURL('/', `search(q='${sanitiseQuery(searchQuery)}')`)

  searchApi.searchParams.set('select', 'id,name,file,folder,parentReference')
  searchApi.searchParams.set('top', maxItems.toString())
  try {
    const data = await fetchWithAuth(searchApi).then(res => res.json())
    return ResponseCompat.json(data.value, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}
