import { SafeRichText } from '@/components/shams/shared/safe-rich-text'
export function ManagedContent({
  title,
  html,
}: {
  title: string
  html: string
}) {
  return (
    <article className="shams-container py-8">
      <h1 dir="auto" className="mb-6 text-3xl font-semibold">
        {title}
      </h1>
      <SafeRichText
        html={html}
        className="shams-description max-w-4xl leading-8"
      />
    </article>
  )
}
