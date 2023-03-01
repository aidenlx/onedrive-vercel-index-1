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
const fetchWithLimit = (url: URL) => limit(() => fetch(url))

async function getResp(url: string, path: string) {
  const response = await fetchWithLimit(new URL(url, self.origin))
  if (!response.ok) console.warn(`skipping ${response.status} response for ${url}`)
  else if (response.status === 204 || response.headers.get('Content-Length') === '0' || !response.body)
    console.warn(`skipping empty response for ${url}`)
  else return { name: path, input: response }
  return null
}

async function fetchAll(data: FileData[]) {
  const resp = await Promise.all(
    data.map(async ({ url, path }) => {
      try {
        return await getResp(url, path)
      } catch (err) {
        console.error(err)
      }
    })
  )
  return resp.filter((f): f is { name: string; input: Response } => !!f)
}

async function* fetchAsync(data: FileData[]) {
  for (const { url, path } of data) {
    try {
      const resp = await getResp(url, path)
      if (resp) yield resp
    } catch (err) {
      console.error(err)
    }
  }
}

export async function downloadMultiple(zipName: string, files: string[], rootFolder?: string, size?: number | bigint) {
  const fileData = toFileData(files, rootFolder)
  let response: Response
  if (size) {
    response = downloadZip(fetchAsync(fileData), { length: size })
  } else {
    // need to wait for all responses to get the total size
    const resp = await fetchAll(fileData)
    response = downloadZip(resp, { metadata: resp })
  }
  return response
}
