'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const variants = {
  'fade-up': 'animate-fade-up',
  'fade-in': 'animate-fade-in',
  'scale-in': 'animate-scale-in',
} as const

export type RevealVariant = keyof typeof variants

export function Reveal({
  children,
  as = 'fade-up',
  delay,
  className,
}: {
  children: React.ReactNode
  as?: RevealVariant
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-reveal
      data-visible={visible ? '' : undefined}
      style={delay ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(variants[as], className)}
    >
      {children}
    </div>
  )
}
