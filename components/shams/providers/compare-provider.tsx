'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

function safePersist(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Storage can be disabled in private browsing. */
  }
}

type CompareContextValue = {
  compareItems: string[]
  toggleCompare: (id: string) => void
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function useCompare() {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used inside CompareProvider')
  return ctx
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareItems, setCompareItems] = useState<string[]>([])
  const [storageReady, setStorageReady] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('shams-compare-v3-ids')
      if (saved) {
        const ids = JSON.parse(saved)
        if (Array.isArray(ids))
          setCompareItems(ids.filter((x) => typeof x === 'string').slice(0, 4))
      }
    } catch {
      /* Best-effort persistence. */
    } finally {
      setStorageReady(true)
    }
  }, [])

  useEffect(() => {
    if (storageReady) safePersist('shams-compare-v3-ids', compareItems)
  }, [compareItems, storageReady])

  const toggleCompare = useCallback(
    (id: string) =>
      setCompareItems((items) =>
        items.includes(id)
          ? items.filter((x) => x !== id)
          : items.length < 4
            ? [...items, id]
            : items,
      ),
    [],
  )

  return (
    <CompareContext.Provider value={{ compareItems, toggleCompare }}>
      {children}
    </CompareContext.Provider>
  )
}
