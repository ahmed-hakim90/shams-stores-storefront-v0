'use client'
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useState,
  useCallback,
} from 'react'

const OverlayContext = createContext<{
  active: boolean
  register: (id: string, open: boolean) => void
}>({ active: false, register: () => {} })
export function ShellPolicyProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [ids, setIds] = useState<string[]>([])
  const register = useCallback(
    (id: string, open: boolean) =>
      setIds((v) =>
        open ? (v.includes(id) ? v : [...v, id]) : v.filter((x) => x !== id),
      ),
    [],
  )
  return (
    <OverlayContext.Provider value={{ active: ids.length > 0, register }}>
      {children}
    </OverlayContext.Provider>
  )
}
export function useOverlayPresence(open: boolean) {
  const id = useId(),
    { register } = useContext(OverlayContext)
  useEffect(() => {
    if (!open) return
    const trigger =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    register(id, true)
    return () => {
      register(id, false)
      if (trigger?.isConnected)
        requestAnimationFrame(() => trigger.focus({ preventScroll: true }))
    }
  }, [open, id, register])
}
export function useOverlayActive() {
  return useContext(OverlayContext).active
}
