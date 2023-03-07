import { NextRequest, NextResponse } from 'next/server'
import { readResp } from '@od/util/graph-api'
import { getAccessToken } from '@od/util/oauth'
import { handleResponseError } from '@od/util/resp-handler'
import { cacheControlHeader, driveApi } from '@od/cfg/api'

export async function GET(req: NextRequest) {
  // Get item details (specifically, its path) by its unique ID in OneDrive
  const id = req.nextUrl.searchParams.get('id') ?? ''

  if (typeof id !== 'string') return NextResponse.json({ error: 'Invalid driveItem ID.' }, { status: 400 })
  const itemApi = new URL(`${driveApi}/items/${id}`)
  itemApi.searchParams.set('select', 'id,name,parentReference')

  try {
    const data = await fetch(itemApi, {
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
    }).then(readResp('json'))
    return NextResponse.json(data, {
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
