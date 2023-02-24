// import FileListing from '@/components/FileListing'

export default function Page({
  params,
  searchParams,
}: {
  params: { paths?: string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  return <span>TBD{params.paths?.join(',')}</span>
  // return <FileListing paths={params.paths} />
}
