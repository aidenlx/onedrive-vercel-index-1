import { helperApi } from './api'
import { authHeader, accessKey } from './auth'
import { SiteConfig } from './site.type'
import { isSiteConfigs } from './site.vaildate'

interface ConfigResult {
  config: SiteConfigWithDefault
  status: number
  payload: any
}

const defaultSiteConfig = {
  title: 'Onedrive Index',
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
  footer:
    'Powered by <a href="https://github.com/spencerwooo/onedrive-vercel-index" target="_blank" rel="noopener noreferrer">onedrive-vercel-index</a>. Made with ❤ by SpencerWoo.',
  icon: '/icons/512.png',
} satisfies SiteConfig

type SiteConfigWithDefault = SiteConfig & Required<Pick<SiteConfig, keyof typeof defaultSiteConfig>>

export default async function getConfig(): Promise<ConfigResult> {
  const result = await _getConfig()
  return {
    ...result,
    config: result.config ? { ...defaultSiteConfig, ...result.config } : defaultSiteConfig,
  }
}

async function _getConfig() {
  try {
    const resp = await fetch(new URL('/api/site.config.json', helperApi), {
      headers: {
        [authHeader]: accessKey,
      },
    })
    if (!resp.ok) {
      return {
        config: null,
        status: resp.status,
        payload: await resp.text().catch(err => err),
      }
    }
    const siteConfig = await resp.json()
    return {
      config: isSiteConfigs(siteConfig) ? siteConfig : null,
      status: 200,
      payload: siteConfig,
    }
  } catch (error) {
    console.error('Failed to fetch site config', error)
    return {
      config: null,
      status: -1,
      payload: error,
    }
  }
}
