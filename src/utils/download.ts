import { toPermLink } from './permlink'

export interface FileData {
  path: string
  url: string
}
function toFileData(files: string[], rootFolder?: string): FileData[] {
  const commonFolders = files.reduce((acc, path) => {
    const curPath = path.split('/').filter(Boolean)
    // keep parent folder paths
    curPath.pop()
    if (acc.length === 0) {
      return curPath
    }
    return acc.map((path, i) => (path === curPath[i] ? path : ''))
  }, [] as string[])
  const commonFolderLength = commonFolders.filter(Boolean).length
  return files.map(rawPath => {
    // remove common folder paths
    const pathSegments = rawPath.split('/').filter(Boolean).slice(commonFolderLength)
    if (rootFolder) {
      pathSegments.unshift(rootFolder)
    }
    return {
      path: pathSegments.join('/'),
      url: toPermLink(rawPath),
    }
  })
}

import pLimit from 'p-limit'
import { downloadZip } from 'client-zip'

const limit = pLimit(5)

async function fetchAll(data: FileData[]) {
  const fetchData = (url: URL) => limit(() => fetch(url))
  const resp = await Promise.all(
    data.map(async ({ url, path }) => {
      try {
        const response = await fetchData(new URL(url, self.origin))
        if (!response.ok) console.warn(`skipping ${response.status} response for ${url}`)
        else if (response.status === 204 || response.headers.get('Content-Length') === '0' || !response.body)
          console.warn(`skipping empty response for ${url}`)
        else return { name: path, input: response }
        return null
      } catch (err) {
        console.error(err)
      }
    })
  )
  return resp.filter((f): f is { name: string; input: Response } => !!f)
}

export async function downloadMultiple(zipName: string, files: string[], rootFolder?: string) {
  const downloadsResp = await fetchAll(toFileData(files, rootFolder))
  const response = downloadZip(downloadsResp, { metadata: downloadsResp })
  response.headers.set('Content-Disposition', `attachment; filename="${zipName}"; filename*=UTF-8''${encodeURIComponent(zipName)}`)
  response.headers.set('Content-Type', 'application/zip')
  return response
}
