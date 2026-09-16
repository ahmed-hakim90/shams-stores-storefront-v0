'use client'

import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { SavedProducts } from './saved-products'
import { useInteractions } from './interaction-provider'

export function WishlistDrawer() {
  const { wishlistOpen, closeWishlist } = useInteractions()
  return (
    <Dialog.Root
      open={wishlistOpen}
      onOpenChange={(open) => {
        if (!open) closeWishlist()
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[130] bg-black/40" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-[131] w-full max-w-md overflow-y-auto overscroll-contain bg-background p-5 outline-none">
          <Dialog.Title className="sr-only">Wishlist</Dialog.Title>
          <Dialog.Close
            aria-label="Close wishlist"
            className="ml-auto block size-11 rounded-full border"
          >
            <X className="mx-auto size-5" />
          </Dialog.Close>
          <SavedProducts mode="wishlist" compact />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
