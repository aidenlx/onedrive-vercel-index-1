import { cacheControlHeader } from '@od/cfg/api'
import { NoAccessTokenError } from './oauth'
import { getDownload } from './graph-api'
import { NextResponse } from 'next/server'

declare global {
  var CompressionStream: any
}

/**
 * CDN Cache resource url for 1 hour
 * @see https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0#instance-attributes
 */
export const cacheResourceUrl = 'public, max-age=0, s-maxage=3600, immutable'

export async function handleRaw(
  path: string,
  {
    headers = new Headers(),
    proxy = false,
    basePath,
    request,
    cacheControl = cacheControlHeader,
  }: { headers?: Headers; request?: Request; proxy?: boolean; basePath?: string; cacheControl?: string } = {}
) {
  const [downloadUrl, size] = await getDownload(path, basePath)

  if (!downloadUrl) {
    throw new Error('No download url found.')
    // return NextResponse.json({ error: 'No download url found.' }, { status: 404, headers })
  }
  headers.set('Cache-Control', cacheResourceUrl)

  // Only proxy raw file content response for files up to 4MB
  if (!(proxy && size && size < 4194304)) {
    return NextResponse.redirect(downloadUrl, { status: 308, headers })
  }

  const { body: dlBody, headers: dlHeader } = await fetch(downloadUrl)
  // override cache control header for proxied resopnse
  headers.set('Cache-Control', cacheControl)
  if (!dlBody)
    return NextResponse.json(
      { error: 'No body from requested download URL.', url: downloadUrl },
      { status: 404, headers }
    )
  dlHeader.forEach((value, key) => headers.set(key, value))

  // nodejs has trouble with compression stream, stream directly
  headers.delete('Content-Encoding')
  let stream = dlBody
  // const accept = request?.headers.get('Accept-Encoding')
  // if (accept?.includes('gzip')) {
  //   stream = dlBody.pipeThrough(new CompressionStream('gzip'))
  //   headers.set('Content-Encoding', 'gzip')
  // } else if (accept?.includes('deflate')) {
  //   stream = dlBody.pipeThrough(new CompressionStream('deflate'))
  //   headers.set('Content-Encoding', 'deflate')
  // }
  return new NextResponse(stream, { status: 200, headers })
}

export async function handleResponseError(error: unknown) {
  let output: { data: { error: string }; status: number }
  if (error instanceof Response) {
    output = { data: { error: (await error.json()) ?? error.statusText }, status: error.status }
    console.debug('Error Response', output)
  } else if (error instanceof NoAccessTokenError) {
    output = { data: { error: 'No access token.' }, status: 500 }
  } else {
    output = { data: { error: 'Internal server error.' }, status: 500 }
    console.error('Error while handling response:', error)
  }
  return output
}
