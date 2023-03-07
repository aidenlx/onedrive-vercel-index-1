/**
 * This file contains the configuration for the API endpoints and tokens we use.
 *
 * - If you are a OneDrive International user, you would not have to change anything here.
 * - If you are not the admin of your OneDrive for Business account, you may need to define your own clientId/clientSecret,
 *   check documentation for more details.
 * - If you are using a E5 Subscription OneDrive for Business account, the direct links of your files are not the same here.
 *   In which case you would need to change directLinkRegex.
 */

import { ApiConfig } from './api.type'

const varToEnv: Record<keyof ApiConfig, string> = {
  clientId: 'OVI_CLIENT_ID',
  clientSecret: 'OVI_CLIENT_SECRET',
  redirectUri: 'OVI_REDIRECT_URL',
  authApi: 'OVI_AUTH_API',
  driveApi: 'OVI_DRIVE_API',
  scope: 'OVI_API_SCOPE',
  userPrincipalName: 'NEXT_PUBLIC_USER_PRINCIPLE_NAME',
  protectedRoutes: 'OVI_PROTECTED_ROUTES',
  baseDirectory: 'OVI_BASE_DIRECTORY',
  cacheControlHeader: 'OVI_CACHE_CONTROL_HEADER',
  maxItems: 'OVI_MAX_ITEMS',
  protectedMagiclinkExpire: 'OVI_PROTECTED_MAGICLINK_EXPIRE',
  helperApi: 'OVI_HELPER_API',
  accessKey: 'OVI_ACCESS_KEY',
  encryptKey: 'OVI_ENCRYPT_KEY',
  refreshToken: 'OVI_REFRESH_TOKEN',
}

export const {
  authApi,
  baseDirectory,
  cacheControlHeader,
  clientId,
  clientSecret,
  driveApi,
  helperApi,
  maxItems,
  protectedMagiclinkExpire,
  protectedRoutes,
  redirectUri,
  scope,
  userPrincipalName,
  accessKey,
  encryptKey,
  refreshToken,
}: Required<ApiConfig> = {
  ...getEnv('clientId', '736531d6-d2c9-48a6-84d8-e4e9c103bc9b'),
  ...getEnv('clientSecret', '5uZP4zvrA1-6fO3dep.57K-dMO_n2337jn'),
  ...getEnv('redirectUri', 'http://localhost'),
  ...getEnv('refreshToken', ''),
  ...getEnv('accessKey', ''),
  ...getEnv('encryptKey', ''),
  ...getEnv('authApi', 'https://login.partner.microsoftonline.cn/common/oauth2/v2.0/token'),
  ...getEnv('driveApi', 'https://microsoftgraph.chinacloudapi.cn/v1.0/me/drive'),
  ...getEnv('helperApi', 'http://127.0.0.1:3001'),
  ...getEnv('scope', 'user.read files.read.all offline_access'),
  ...getEnv('userPrincipalName', 'spencer@spwoo.onmicrosoft.com'),
  ...getEnv('baseDirectory', '/Public'),
  ...getEnv('cacheControlHeader', 'max-age=0, s-maxage=60, stale-while-revalidate'),
  ...getEnvInt('maxItems', 100),
  ...getEnvInt('protectedMagiclinkExpire', 7200),
  ...getEnvArray('protectedRoutes'),
}

/**
 * not using auth header for now because SSG doesn't work with it
 */
export const authHeader = 'x-odvi-token'

function toPositiveInt(env: string | undefined, defaultVal: number): number {
  if (!env) return defaultVal
  const parsed = parseInt(env)
  if (Number.isNaN(parsed) || parsed <= 0) return defaultVal
  return parsed
}

function getEnv<K extends keyof ApiConfig>(key: K, defaultVal: string) {
  const env = process.env[varToEnv[key]]
  return { [key]: env ? env : defaultVal } as { [P in K]: string }
}
function getEnvInt<K extends keyof ApiConfig>(key: K, defaultVal: number) {
  const env = toPositiveInt(process.env[varToEnv[key]], defaultVal)
  return { [key]: env } as { [P in K]: number }
}
function getEnvArray<K extends keyof ApiConfig>(key: K) {
  const env = process.env[varToEnv[key]]?.split(',') ?? []
  return { [key]: env } as { [P in K]: string[] }
}
