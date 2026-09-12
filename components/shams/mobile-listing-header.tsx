'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

export function MobileListingHeader({
  title,
  description,
  count,
  query,
  breadcrumb = 'Home',
  chips,
  toolbar,
}: {
  title: string
  description: string
  count: number
  query?: string
  breadcrumb?: string
  chips?: ReactNode
  toolbar?: ReactNode
}) {
  return (
    <>
      <nav
        aria-label="Breadcrumb"
        className="mb-2 text-xs text-muted-foreground sm:mb-3"
      >
        <Link href="/" className="hover:text-brand">
          {breadcrumb}
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <header className="mobile-section-header flex flex-col gap-1.5 border-b border-border pb-3 sm:gap-2 sm:pb-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand">
          Shams Stores
        </p>
        <h1 className="text-xl font-semibold tracking-tight sm:text-4xl">
          {query ? (
            <>
              Results for <span className="text-brand">"{query}"</span>
            </>
          ) : (
            title
          )}
        </h1>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      {chips && <div className="py-2 sm:py-3">{chips}</div>}
      {toolbar && <div className="mb-2 sm:mb-3">{toolbar}</div>}
    </>
  )
}

export function ListingBreadcrumb({ label }: { label: string }) {
  return <MobileListingHeader title={label} description="" count={0} />
}
