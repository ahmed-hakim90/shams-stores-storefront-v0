'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useCompare } from './compare-provider'

type OverlayContextValue = {
  wishlistOpen: boolean
  cartOpen: boolean
  searchOpen: boolean
  openWishlist: () => void
  closeWishlist: () => void
  openCart: () => void
  closeCart: () => void
  openSearch: () => void
  closeSearch: () => void
  stickyPurchaseVisible: boolean
  setStickyPurchaseVisible: (visible: boolean) => void
}

const OverlayContext = createContext<OverlayContextValue | null>(null)

export function useOverlays() {
  const ctx = useContext(OverlayContext)
  if (!ctx) throw new Error('useOverlays must be used inside OverlayProvider')
  return ctx
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const { compareItems } = useCompare()
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [stickyPurchaseVisible, setStickyPurchaseVisible] = useState(false)

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sticky-purchase-offset',
      stickyPurchaseVisible ? 'var(--sticky-purchase-height)' : '0px',
    )
    document.documentElement.style.setProperty(
      '--compare-tray-offset',
      compareItems.length &&
        !wishlistOpen &&
        !cartOpen &&
        !stickyPurchaseVisible
        ? 'var(--compare-tray-height)'
        : '0px',
    )
    return () => {
      document.documentElement.style.removeProperty('--sticky-purchase-offset')
      document.documentElement.style.removeProperty('--compare-tray-offset')
    }
  }, [stickyPurchaseVisible, compareItems.length, wishlistOpen, cartOpen])

  return (
    <OverlayContext.Provider
      value={{
        wishlistOpen,
        cartOpen,
        searchOpen,
        openWishlist: () => setWishlistOpen(true),
        closeWishlist: () => setWishlistOpen(false),
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        openSearch: () => {
          setSearchOpen(true)
          setWishlistOpen(false)
          setCartOpen(false)
        },
        closeSearch: () => setSearchOpen(false),
        stickyPurchaseVisible,
        setStickyPurchaseVisible,
      }}
    >
      {children}
    </OverlayContext.Provider>
  )
}
