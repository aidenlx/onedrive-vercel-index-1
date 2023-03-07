import { getRequestURL, encodePath, fetchWithAuth } from '@od/util/graph-api'
import { cacheControlHeader, maxItems } from '@od/cfg/api'
import { NextRequest, NextResponse } from 'next/server'
import { handleResponseError } from '@od/util/resp-handler'

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

export async function GET(req: NextRequest) {
  // Query parameter from request
  const searchQuery = req.nextUrl.searchParams.get('q') ?? ''

  if (typeof searchQuery !== 'string') return NextResponse.json([], { status: 200 })

  // Construct Microsoft Graph Search API URL, and perform search only under the base directory
  const searchApi = getRequestURL(encodePath('/'), `search(q='${sanitiseQuery(searchQuery)}')`)

  searchApi.searchParams.set('select', 'id,name,file,folder,parentReference')
  searchApi.searchParams.set('top', maxItems.toString())
  try {
    const data = await fetchWithAuth(searchApi).then(res => res.json())
    return NextResponse.json(data.value, {
      status: 200,
      headers: {
        'Cache-Control': cacheControlHeader,
      },
    })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return NextResponse.json(data, { status })
  }
}
