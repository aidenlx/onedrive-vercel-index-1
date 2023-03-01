import siteConfig from '@cfg/site.config'
import { get } from '@vercel/edge-config'

const atKey = `${siteConfig.kvPrefix}access_token`
const atExpiryKey = `${atKey}_expiry`
const rtKey = `${siteConfig.kvPrefix}refresh_token`

export async function accessToken() {
  console.log('fetch access token from edge config')
  return await Promise.all([get<string>(atKey), get<number>(atExpiryKey)])
}

export async function refreshToken() {
  console.log('fetch refresh token from edge config')
  return await get<string>(rtKey)
}

export async function saveAuthToken({
  accessToken,
  expiry,
  refreshToken,
}: {
  accessToken: string
  expiry: number
  refreshToken?: string
}): Promise<void> {
  console.log('save auth token to edge config')
  await set([
    { key: atKey, value: accessToken },
    { key: atExpiryKey, value: expiry },
    ...(refreshToken ? [{ key: rtKey, value: refreshToken }] : []),
  ])
}

async function set(
  items: {
    key: string
    value: string | number
  }[]
) {
  const edgeConfigID = new URL(process.env.EDGE_CONFIG ?? '').pathname.split('/').pop()
  try {
    const updateEdgeConfig = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigID}/items`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: items.map(prop => ({ operation: 'upsert', ...prop })) }),
    })
    const result = await updateEdgeConfig.json()
    console.debug(result)
  } catch (error) {
    console.error(error)
  }
}
