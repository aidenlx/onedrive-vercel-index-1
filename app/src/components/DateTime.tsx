import getConfig from '@od/cfg/site'
import { Suspense } from 'react'

import dayjs from 'dayjs'
/**
 * Convert the last modified date time into locale friendly string
 *
 * @param lastModifedDateTime DateTime string in ISO format
 * @returns Human readable form of the file or folder last modified date
 */
function formatModifiedDateTime(lastModifedDateTime: string, datetimeFormat: string) {
  return dayjs(lastModifedDateTime).format(datetimeFormat)
}

interface DateTimeProps {
  value: string
}

export default function DateTime(props: DateTimeProps) {
  return (
    <Suspense>
      {/** @ts-expect-error async server component */}
      <DateTimeAsync {...props} />
    </Suspense>
  )
}

async function DateTimeAsync({ value }: DateTimeProps) {
  const {
    config: { datetimeFormat },
  } = await getConfig()
  return <>{formatModifiedDateTime(value, datetimeFormat)}</>
}
