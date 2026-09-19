'use client'
import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { text } from '@/lib/commerce/live/normalize'
import { storefrontLink } from '@/lib/commerce/live/shams-contract'

/** Server/first client render is escaped text; rich HTML is sanitized in a DOM. */
export function SafeRichText({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  const [sanitized, setSanitized] = useState<{
    source: string
    html: string
  } | null>(null)
  useEffect(() => {
    const fragment = DOMPurify.sanitize(html, {
      RETURN_DOM_FRAGMENT: true,
      FORBID_TAGS: ['form', 'input', 'button', 'iframe'],
    })
    fragment.querySelectorAll('a[href]').forEach((anchor) => {
      const href = storefrontLink(anchor.getAttribute('href'))
      if (href) anchor.setAttribute('href', href)
      else anchor.removeAttribute('href')
      anchor.setAttribute('rel', 'noopener noreferrer')
    })
    const container = document.createElement('div')
    container.append(fragment)
    setSanitized({ source: html, html: container.innerHTML })
  }, [html])
  if (!sanitized || sanitized.source !== html)
    return (
      <div dir="auto" className={className}>
        {text(html)}
      </div>
    )
  return (
    <div
      dir="auto"
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized.html }}
    />
  )
}
