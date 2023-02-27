// Common axios fetch function for use with useSWR
export async function fetcher(url: string) {
  return fetch(url).then(res => res.json())
}
