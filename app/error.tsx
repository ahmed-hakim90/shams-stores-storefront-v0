'use client'

import Link from 'next/link'
import { Home, MessageCircle, RotateCcw } from 'lucide-react'

export default function StorefrontError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-5 py-16 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-brand-muted">
        <MessageCircle className="size-7 text-brand-ink" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">We couldn&apos;t load this page</h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Something went wrong on our end. Give it another try, or head back to the shop.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center gap-2 rounded-(--radius-control) bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
        >
          <RotateCcw className="size-4" /> Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center gap-2 rounded-(--radius-control) border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          <Home className="size-4" /> Back to shop
        </Link>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Still having trouble?{' '}
        <Link href="/support" className="font-medium text-brand-ink underline underline-offset-2">
          Talk to our team
        </Link>
      </p>
    </main>
  )
}
