'use client'
import { useEffect, useRef, useState } from 'react'
import { ProductImage } from '@/components/shams/product'
import { CartLineOptions } from './cart-line-options'
import { formatEgp } from '@/lib/commerce'

export type CartLineData = {
  id: string
  productName: string
  productImage?: string
  selectedOptions?: string[]
  price: number
  quantity: number
  total?: number
}

export function CartLineItem({
  line,
  compact = false,
  pending,
  onRemove,
  onUpdateQuantity,
}: {
  line: CartLineData
  compact?: boolean
  pending: boolean
  onRemove: (id: string) => void
  onUpdateQuantity: (id: string, quantity: number) => void
}) {
  const [leaving, setLeaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(null)
  useEffect(() => () => clearTimeout(timer.current ?? undefined), [])

  const remove = () => {
    if (!compact || leaving || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onRemove(line.id)
      return
    }
    setLeaving(true)
    timer.current = setTimeout(() => onRemove(line.id), 220)
  }

  if (compact) {
    return (
      <div className="cart-line-wrap" data-leaving={leaving || undefined}>
        <article className="flex gap-3 border-b py-4">
          <div className="relative size-20 shrink-0 bg-surface-raised">
            <ProductImage
              src={line.productImage || '/placeholder.svg'}
              alt={line.productName}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-medium">{line.productName}</h3>
            <CartLineOptions options={line.selectedOptions} />
            <p className="mt-2 text-sm font-semibold">
              {formatEgp(line.total ?? line.price * line.quantity)}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <button
                disabled={pending || line.quantity <= 1}
                onClick={() => onUpdateQuantity(line.id, line.quantity - 1)}
                aria-label="Decrease quantity"
                className="flex size-7 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
              >
                −
              </button>
              <span className="w-7 text-center text-xs font-medium tabular-nums">
                {line.quantity}
              </span>
              <button
                disabled={pending || line.quantity >= 99}
                onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
                aria-label="Increase quantity"
                className="flex size-7 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
              >
                +
              </button>
            </div>
            <button
              disabled={pending || leaving}
              onClick={remove}
              className="min-h-11 text-xs text-muted-foreground underline"
            >
              Remove
            </button>
          </div>
        </article>
      </div>
    )
  }

  return (
    <article className="flex gap-3 rounded-(--radius-card) border bg-card p-4 sm:gap-5">
      <div className="relative size-20 shrink-0 sm:size-24 bg-surface-raised">
        <ProductImage
          src={line.productImage || '/placeholder.svg'}
          alt={line.productName}
          fill
          sizes="96px"
          className="object-contain p-2"
        />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold">{line.productName}</h2>
        <CartLineOptions options={line.selectedOptions} />
        <p className="mt-2 font-semibold">
          {formatEgp(line.total ?? line.quantity * line.price)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              disabled={pending || line.quantity <= 1}
              onClick={() => onUpdateQuantity(line.id, line.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex size-9 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
            >
              −
            </button>
            <span className="w-9 text-center text-sm font-medium tabular-nums">
              {line.quantity}
            </span>
            <button
              disabled={pending || line.quantity >= 99}
              onClick={() => onUpdateQuantity(line.id, line.quantity + 1)}
              aria-label="Increase quantity"
              className="flex size-9 items-center justify-center rounded-(--radius-control) border text-sm transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            disabled={pending}
            onClick={remove}
            className="min-h-11 text-xs text-muted-foreground underline"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  )
}
