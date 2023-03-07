import { icons } from '@icon'
import { library } from '@fortawesome/fontawesome-svg-core'

export default function Icon() {
  library.add(...icons)
  return <></>
}
