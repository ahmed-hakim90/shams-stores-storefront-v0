'use client'
import { createContext, useCallback, useContext, useState } from 'react'
import { Check, Info, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Notice = {
  id: number
  message: string
  tone: 'success' | 'error' | 'warning' | 'info'
}

type NoticeContextValue = {
  notify: (message: string, tone?: Notice['tone']) => void
}

const NoticeContext = createContext<NoticeContextValue | null>(null)

export function useNotices() {
  const ctx = useContext(NoticeContext)
  if (!ctx) throw new Error('useNotices must be used inside NoticeProvider')
  return ctx
}

function ToastStack({
  notices,
  dismiss,
}: {
  notices: Notice[]
  dismiss: (id: number) => void
}) {
  const icons = { success: Check, error: X, warning: AlertTriangle, info: Info }
  return (
    <div
      className="fixed inset-x-4 bottom-[calc(var(--fixed-stack-bottom)+var(--sticky-purchase-offset)+var(--compare-tray-offset)+0.75rem)] z-[110] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-80"
      aria-live="polite"
    >
      {notices.map((notice) => {
        const Icon = icons[notice.tone]
        return (
          <div
            key={notice.id}
            role="status"
            className="flex w-full animate-fade-up items-center gap-3 rounded-(--radius-control) border border-border bg-card px-3 py-3 text-sm motion-reduce:animate-none"
          >
            <span
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-full',
                notice.tone === 'success' && 'bg-success-muted text-success',
                notice.tone === 'error' && 'bg-danger-muted text-danger',
                notice.tone === 'warning' && 'bg-warning-muted text-warning',
                notice.tone === 'info' && 'bg-brand-muted text-brand-ink',
              )}
            >
              <Icon className="size-4" />
            </span>
            <span className="flex-1 text-foreground">{notice.message}</span>
            <button
              type="button"
              onClick={() => dismiss(notice.id)}
              className="inline-flex size-8 items-center justify-center rounded-(--radius-control) text-muted-foreground hover:bg-muted"
              aria-label="Dismiss notification"
            >
              <X className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function NoticeProvider({ children }: { children: React.ReactNode }) {
  const [notices, setNotices] = useState<Notice[]>([])

  const notify = useCallback(
    (message: string, tone: Notice['tone'] = 'success') => {
      const id = Date.now()
      setNotices((current) => {
        const existing = current.find(
          (item) => item.message === message && item.tone === tone,
        )
        if (existing)
          return current.map((item) =>
            item.id === existing.id ? { ...item, id } : item,
          )
        return [...current.slice(-1), { id, message, tone }]
      })
      window.setTimeout(
        () => setNotices((current) => current.filter((item) => item.id !== id)),
        3200,
      )
    },
    [],
  )

  return (
    <NoticeContext.Provider value={{ notify }}>
      {children}
      <ToastStack
        notices={notices}
        dismiss={(id) =>
          setNotices((current) => current.filter((item) => item.id !== id))
        }
      />
    </NoticeContext.Provider>
  )
}
