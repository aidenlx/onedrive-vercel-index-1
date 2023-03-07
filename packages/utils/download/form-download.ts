export function batchDownloadWithForm(name: string, paths: string[], rootFolder?: string, size?: number | bigint) {
  const el = document.createElement('form')
  el.style.display = 'none'

  paths.forEach(p => {
    const input = document.createElement('input')
    input.value = p
    input.name = 'path'
    el.appendChild(input)
  })
  if (rootFolder) {
    const input = document.createElement('input')
    input.value = rootFolder
    input.name = 'root'
    el.appendChild(input)
  }
  if (size && size > 0) {
    const input = document.createElement('input')
    input.value = `${size}`
    input.name = 'size'
    el.appendChild(input)
  }
  el.method = 'post'
  el.action = `/api/batch/${name}`
  document.body.appendChild(el)
  el.submit()
  el.childNodes.forEach(c => c.remove())
  el.remove()
}
