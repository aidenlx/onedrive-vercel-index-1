import type { SiteConfig } from './site.type'

import Ajv from 'ajv'
import addFormat from 'ajv-formats'
import schema from '../../site.json'

const ajv = new Ajv()
addFormat(ajv)

const validate = ajv.compile(schema)

export function isSiteConfigs(config: unknown): config is SiteConfig {
  return validate(config)
}
