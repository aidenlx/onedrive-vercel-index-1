/**
 * This file contains the configuration for the API endpoints and tokens we use.
 *
 * - If you are a OneDrive International user, you would not have to change anything here.
 * - If you are not the admin of your OneDrive for Business account, you may need to define your own clientId/clientSecret,
 *   check documentation for more details.
 * - If you are using a E5 Subscription OneDrive for Business account, the direct links of your files are not the same here.
 *   In which case you would need to change directLinkRegex.
 */

/**
 * The clientId and clientSecret are used to authenticate the user with Microsoft Graph API using OAuth. You would
 * not need to change anything here if you can authenticate with your personal Microsoft account with OneDrive International.
 */
export const clientId = process.env.OVI_CLIENT_ID ?? '736531d6-d2c9-48a6-84d8-e4e9c103bc9b'
/**
 * The clientId and clientSecret are used to authenticate the user with Microsoft Graph API using OAuth. You would
 * not need to change anything here if you can authenticate with your personal Microsoft account with OneDrive International.
 */
export const clientSecret = process.env.OVI_CLIENT_SECERT ?? '5uZP4zvrA1-6fO3dep.57K-dMO_n2337jn'

/**
 * The redirectUri is the URL that the user will be redirected to after they have authenticated with Microsoft Graph API.
 * Likewise, you would not need to change redirectUri if you are using your personal Microsoft account with OneDrive International.
 **/
export const redirectUri = process.env.OVI_REDIRECT_URL ?? 'http://localhost'
/**
 * These are the URLs of the OneDrive API endpoints. You would not need to change anything here if you are using OneDrive International
 * or E5 Subscription OneDrive for Business. You may need to change these if you are using OneDrive 世纪互联.
 */
export const authApi = process.env.OVI_AUTH_API ?? 'https://login.partner.microsoftonline.cn/common/oauth2/v2.0/token'
/**
 * These are the URLs of the OneDrive API endpoints. You would not need to change anything here if you are using OneDrive International
 * or E5 Subscription OneDrive for Business. You may need to change these if you are using OneDrive 世纪互联.
 */
export const driveApi = process.env.OVI_DRIVE_API ?? 'https://microsoftgraph.chinacloudapi.cn/v1.0/me/drive'
/**
 * The scope we require are listed here, in most cases you would not need to change this as well.
 */
export const scope = process.env.OVI_API_SCOPE ?? 'user.read files.read.all offline_access'

/**
 * This is what we use to identify who you are when you are initialising the website for the first time. 
 * Make sure this is exactly the same as the email address you use to sign into your Microsoft account.
 * You can also put this in your Vercel's environment variable 'NEXT_PUBLIC_USER_PRINCIPLE_NAME' if you worry about your email being exposed in public.

 */
export const userPrincipalName = process.env.NEXT_PUBLIC_USER_PRINCIPLE_NAME || 'spencer@spwoo.onmicrosoft.com'

/**
 * This is where you specify the folders that are password protected. It is an array of paths pointing to all the directories in which you have .password set. Check the documentation for details.
 */
export const protectedRoutes = process.env.OVI_PROTECTED_ROUTES?.split(',') ?? []

/**
 * The folder that you are to share publicly with onedrive-vercel-index. Use '/' if you want to share your root folder.
 */
export const baseDirectory = process.env.OVI_BASE_DIRECTORY ?? '/Public'

/**
 * Cache-Control header, check Vercel documentation for more details. The default settings imply:
 * - max-age=0: no cache for your browser
 * - s-maxage=0: cache is fresh for 60 seconds on the edge, after which it becomes stale
 * - stale-while-revalidate: allow serving stale content while revalidating on the edge
 * @see https://vercel.com/docs/concepts/edge-network/caching
 */
export const cacheControlHeader =
  process.env.OVI_CACHE_CONTROL_HEADER ?? 'max-age=0, s-maxage=60, stale-while-revalidate'

/**
 * This represents the maximum number of items that search result shows. Do note that this is limited up to 200 items by the upstream OneDrive API.
 */
export const maxItems = toPositiveInt(process.env.OVI_MAX_ITEMS, 100)

/**
 * This is where you specify how long the permlink for protected route is valid for. The default is 2 hours (7200 seconds).
 */
export const protectedMagiclinkExpire = toPositiveInt(process.env.OVI_PROTECTED_MAGICLINK_EXPIRE, 7200)

function toPositiveInt(env: string | undefined, defaultVal: number): number {
  if (!env) return defaultVal
  const parsed = parseInt(env)
  if (Number.isNaN(parsed) || parsed <= 0) return defaultVal
  return parsed
}

/**
 * helper api entrypoint to serve access token and site config
 * set assgined domain of `helper` repo to `OVI_HELPER_API`
 */
export const helperApi = process.env.OVI_HELPER_API ?? 'http://127.0.0.1:3001'
