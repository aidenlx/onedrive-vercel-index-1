import siteConfig from '@cfg/site.config'
import { get, getAll } from '@vercel/edge-config'

const atKey = `${siteConfig.kvPrefix}access_token` as const
const atExpiryKey = `${atKey}_expiry` as const
const rtKey = `${siteConfig.kvPrefix}refresh_token` as const

type AccessTokenValues = [at: string | undefined, expiry: number | undefined]
export async function accessToken(): Promise<AccessTokenValues> {
  console.log('fetch access token from edge config')
  const result = await getAll<Partial<Record<string, number | string>>>([atKey, atExpiryKey])
  return [result?.[atKey], result?.[atExpiryKey]] as AccessTokenValues
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
