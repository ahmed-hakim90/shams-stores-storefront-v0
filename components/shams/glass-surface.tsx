'use client'

import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function GlassSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border border-white/45 bg-white/60 shadow-[0_12px_35px_rgba(18,37,64,0.14),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/15 dark:bg-white/10',
        className,
      )}
      {...props}
    />
  )
}
