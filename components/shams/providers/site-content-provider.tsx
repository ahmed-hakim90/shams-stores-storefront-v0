'use client'
import { createContext, useContext } from 'react'
import type { SiteShell } from '@/lib/commerce/live/shams-contract'
const SiteContent = createContext<SiteShell>({
  branches: [],
  menus: {},
  labels: { add: '', details: '' },
})
export const useSiteContent = () => useContext(SiteContent)
export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteShell
  children: React.ReactNode
}) {
  return <SiteContent.Provider value={value}>{children}</SiteContent.Provider>
}
