export default async function asyncArrayFrom<T>(iter: AsyncIterable<T>) {
  const arr: Awaited<T>[] = [];
  for await (const item of iter) {
    arr.push(item);
  }
  return arr;
}
