export function ResponseJson(data: any, init?: ResponseInit) {
  return new Response(JSON.stringify(data), init)
}
