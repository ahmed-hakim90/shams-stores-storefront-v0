'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

function safePersist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage can be disabled in private browsing. */
  }
}

type WishlistContextValue = {
  wishlistCount: number
  wishlistItems: string[]
  toggleWishlist: (id: string) => void
  isWishlisted: (id: string) => boolean
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function useWishlist() {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider')
  return ctx
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('shams-wishlist-v3-ids')
      if (saved) {
        const ids = JSON.parse(saved)
        if (Array.isArray(ids))
          setWishlistItems(
            ids.filter((x) => typeof x === 'string').slice(0, 100),
          )
      }
    } catch {
      /* Best-effort persistence. */
    } finally {
      setStorageReady(true)
    }

    fetch('/api/customer/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.product_ids || !Array.isArray(data.product_ids)) return
        const serverIds = data.product_ids.filter(
          (x: unknown) => typeof x === 'string',
        )
        setWishlistItems((local) => {
          const merged = [...new Set([...local, ...serverIds])].slice(-100)
          return merged.length === local.length ? local : merged
        })
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (storageReady) safePersist('shams-wishlist-v3-ids', wishlistItems)
  }, [wishlistItems, storageReady])

  const toggleWishlist = useCallback(
    (id: string) =>
      setWishlistItems((items) => {
        const wasIncluded = items.includes(id)
        const next = wasIncluded
          ? items.filter((x) => x !== id)
          : [...items, id].slice(-100)

        fetch(
          wasIncluded
            ? `/api/customer/wishlist/${id}`
            : '/api/customer/wishlist',
          wasIncluded
            ? { method: 'DELETE' }
            : {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: id }),
              },
        ).catch(() => {})

        return next
      }),
    [],
  )

  const isWishlisted = useCallback(
    (id: string) => wishlistItems.includes(id),
    [wishlistItems],
  )

  return (
    <WishlistContext.Provider
      value={{
        wishlistCount: wishlistItems.length,
        wishlistItems,
        toggleWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}
