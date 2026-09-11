'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  Heart,
  MapPin,
  Menu,
  Package,
  Scale,
  Tag,
  User,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { commerce } from '@/lib/commerce'
import { ShamsLogo } from './logo'

const categories = commerce.categories.list()
const useCases = commerce.useCases.list()

const utility = [
  { label: 'Track order', href: '/orders', icon: Package },
  { label: 'Account', href: '/account', icon: User },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Compare', href: '/compare', icon: Scale },
  { label: 'Branches', href: '/branches', icon: MapPin },
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="size-5.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex h-dvh w-[88%] max-w-sm flex-col bg-background shadow-2xl" role="dialog" aria-modal="true" aria-label="Mobile navigation">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <ShamsLogo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <nav aria-label="Categories" className="p-2">
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shop by category
                </p>
                <ul>
                  {categories.map((cat) => {
                    const isOpen = expanded === cat.slug
                    return (
                      <li key={cat.slug} className="border-b border-border/60">
                        <div className="flex items-center">
                          <Link
                            href={`/c/${cat.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex-1 py-3 pl-3 text-sm font-medium text-foreground"
                          >
                            {cat.name}
                          </Link>
                          <button
                            type="button"
                            aria-label={`Expand ${cat.name}`}
                            aria-expanded={isOpen}
                            onClick={() => setExpanded(isOpen ? null : cat.slug)}
                            className="inline-flex size-10 items-center justify-center text-muted-foreground"
                          >
                            <ChevronDown
                              className={cn('size-4 transition-transform', isOpen && 'rotate-180')}
                            />
                          </button>
                        </div>
                        {isOpen && (
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1 pb-3 pl-3 pr-2">
                            {cat.columns.flatMap((col) => col.links).map((link) => (
                              <Link
                                key={link.label + link.href}
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="truncate py-1.5 text-sm text-muted-foreground hover:text-brand"
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="p-2">
                <p className="px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Shop by workflow
                </p>
                <div className="flex flex-wrap gap-2 px-3 pb-2">
                  {useCases.map((u) => (
                    <Link
                      key={u.slug}
                      href={`/w/${u.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground hover:border-brand hover:text-brand"
                    >
                      {u.name}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/deals"
                  onClick={() => setOpen(false)}
                  className="mx-3 my-2 flex items-center gap-2 rounded-lg bg-brand-muted px-3 py-2.5 text-sm font-semibold text-brand"
                >
                  <Tag className="size-4" /> Deals & bundles
                </Link>
                <ul className="px-1">
                  {utility.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-foreground hover:bg-muted"
                      >
                        <item.icon className="size-4.5 text-muted-foreground" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Egypt · EGP · العربية / English
            </div>
          </div>
        </div>
      )}
    </>
  )
}
