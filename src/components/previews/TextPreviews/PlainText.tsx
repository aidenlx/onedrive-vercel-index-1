import TextPreviewBase from './TextPreviewBase'

export default function PlainTextPreview({ path }: { path: string }) {
  return (
    <TextPreviewBase path={path}>
      {content => <pre className="overflow-x-scroll p-0 text-sm md:p-3">{content}</pre>}
    </TextPreviewBase>
  )
}
