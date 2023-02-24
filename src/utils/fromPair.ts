export function fromPairs<T, K extends string | number>(xs: Array<readonly [K, T]>): Record<K, T> {
  return Object.fromEntries(xs) as any
}