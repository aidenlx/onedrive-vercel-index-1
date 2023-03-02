import apiConfig from '@cfg/api.config'
import { ResponseCompat, handleResponseError, setCaching } from '@/utils/api/common'
import { NextRequest } from 'next/server'
import { getAccessToken } from '../oauth/get-at'
import { readResp } from '../od-api/fetchWithAuth'

export default async function handler(req: NextRequest) {
  // Get item details (specifically, its path) by its unique ID in OneDrive
  const id = req.nextUrl.searchParams.get('id') ?? ''

  const headers = setCaching(new Headers())

  if (typeof id !== 'string') return ResponseCompat.json({ error: 'Invalid driveItem ID.' }, { status: 400, headers })
  const itemApi = new URL(`${apiConfig.driveApi}/items/${id}`)
  itemApi.searchParams.set('select', 'id,name,parentReference')

  try {
    const data = await fetch(itemApi, {
      headers: { Authorization: `Bearer ${await getAccessToken()}` },
    }).then(readResp('json'))
    return ResponseCompat.json(data, { status: 200, headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}
