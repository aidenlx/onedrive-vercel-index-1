import axios from 'axios'

// Common axios fetch function for use with useSWR
export async function fetcher([url, token]: [url: string, token?: string]): Promise<any> {
  try {
    return (
      await (token
        ? axios.get(url, {
            headers: { 'od-protected-token': token },
          })
        : axios.get(url))
    ).data
  } catch (err: any) {
    throw { status: err.response.status, message: err.response.data }
  }
}
