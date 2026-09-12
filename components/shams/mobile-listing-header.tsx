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
      <nav aria-label="Breadcrumb" className="mb-3 text-sm text-muted-foreground sm:mb-5">
        <Link href="/" className="hover:text-brand">{breadcrumb}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <header className="mobile-section-header flex flex-col gap-2 border-b border-border pb-4 sm:gap-3 sm:pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Shams Stores</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          {query ? <>Results for <span className="text-brand">“{query}”</span></> : title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          <span className="text-sm text-muted-foreground">{count} products</span>
        </div>
      </header>
      {chips && <div className="py-3 sm:py-5">{chips}</div>}
      {toolbar && <div className="mb-3 sm:mb-5">{toolbar}</div>}
    </>
  )
}

export function ListingBreadcrumb({ label }: { label: string }) {
  return <MobileListingHeader title={label} description="" count={0} />
}
