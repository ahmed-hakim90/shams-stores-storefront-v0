'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function GlassSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden border border-white/55 bg-white/60 backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/80 dark:border-white/15 dark:bg-white/10 dark:before:bg-white/30',
        className,
      )}
      {...props}
    />
  )
}
