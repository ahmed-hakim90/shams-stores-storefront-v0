'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X, Scale } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SavedProducts } from '@/components/shams/product'
import { useInteractions } from '@/components/shams/providers'
import { useOverlayPresence } from '@/components/shams/shared'

export function CompareTray() {
  const { compareItems, stickyPurchaseVisible } = useInteractions()
  const [open, setOpen] = useState(false)
  useOverlayPresence(open)
  const pathname = usePathname()
  if (!compareItems.length || pathname === '/compare') return null
  return (
    <>
      <button
        data-fixed-bar
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Compare ${compareItems.length} products`}
        className={cn(
          'fixed z-[60] flex min-h-11 items-center gap-2 rounded-full border bg-card px-4 text-sm font-semibold',
          stickyPurchaseVisible
            ? 'right-4 top-[calc(var(--shell-header-height)+12px)]'
            : 'bottom-[var(--fixed-stack-bottom)] right-4',
        )}
      >
        <Scale className="size-4" /> Compare{' '}
        <span className="rounded-full bg-info px-2 py-1 text-white">
          {compareItems.length}
        </span>
      </button>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop data-overlay-backdrop className="fixed inset-0 z-[140] bg-black/40" />
          <Dialog.Popup data-overlay="compare" className="fixed inset-y-0 right-0 z-[141] w-full max-w-3xl overflow-y-auto overscroll-contain bg-background p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] outline-none">
            <Dialog.Title className="sr-only">
              Compare your shortlist
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close comparison"
              className="ml-auto flex size-11 items-center justify-center rounded-full border"
            >
              <X className="size-5" />
            </Dialog.Close>
            <SavedProducts mode="compare" compact />
            <Link
              href="/compare"
              onClick={() => setOpen(false)}
              className="shams-button mt-6"
            >
              Open full comparison
            </Link>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
