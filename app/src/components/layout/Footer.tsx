const Footer = ({ content }: { content?: string }) => {
  const html = content ? { dangerouslySetInnerHTML: { __html: content } } : {}
  return (
    <div
      className="w-full border-t border-gray-900/10 p-4 text-center text-xs font-medium text-gray-400 dark:border-gray-500/30"
      {...html}
    ></div>
  )
}

export default Footer
