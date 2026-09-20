'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import type { Cart, CartLine } from '@/lib/commerce/types'
import { useNotices } from './notice-provider'
import type { Product } from '@/lib/commerce'
import { commerce } from '@/lib/commerce'

type CartContextValue = {
  liveMode: boolean
  cart: Cart | undefined
  cartLoading: boolean
  cartError: string | undefined
  cartPending: boolean
  mutateCart: (input: Record<string, unknown>) => Promise<Cart>
  refreshCart: () => void
  cartCount: number
  cartLines: CartLine[]
  addToCart: (
    product: Product | string,
    quantity?: number,
    variant?: { variationId: string; options: { attribute: string; value: string }[] },
  ) => Promise<boolean>
  addBundleToCart: (bundle: {
    id: string
    name: string
    bundlePrice: { amount: number }
    originalPrice: { amount: number }
    items: { productId: string; role: string; required?: boolean }[]
    products: {
      id: string
      name: string
      image: string
      price: { amount: number }
      stock: string
    }[]
  }) => boolean
  removeCartLine: (id: string) => void
  removeBundleFromCart: (bundleGroupId: string) => void
  updateCartLineQuantity: (key: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}

export function CartProvider({
  children,
  liveMode = false,
}: {
  children: React.ReactNode
  liveMode?: boolean
}) {
  const { notify } = useNotices()
  const [localCartLines, setCartLines] = useState<CartLine[]>([])
  const client = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: () => commerceFetch<Cart>('/api/commerce/cart'),
    enabled: liveMode,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })

  const cartMutation = useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      commerceFetch<Cart>('/api/commerce/cart', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onMutate: async (input) => {
      if (!liveMode) return
      await client.cancelQueries({ queryKey: ['cart'] })
      const previous = client.getQueryData(['cart']) as Cart | undefined
      if (!previous) return { previous }

      if (input.action === 'remove' && typeof input.key === 'string') {
        const line = previous.lines.find((l) => l.id === input.key)
        if (line) {
          const lineTotal = line.total ?? line.price * line.quantity
          const newSubtotal = previous.subtotal - lineTotal
          client.setQueryData(['cart'], {
            ...previous,
            lines: previous.lines.filter((l) => l.id !== input.key),
            subtotal: newSubtotal,
            total:
              newSubtotal + previous.tax + (previous.shipping ?? 0) - previous.discount,
          })
        }
      }

      if (input.action === 'add' && typeof input.productId === 'string') {
        const qty = Number(input.quantity) || 1
        const existing = previous.lines.find(
          (l) => l.productId === input.productId && !l.bundleGroupId,
        )
        if (existing) {
          client.setQueryData(['cart'], {
            ...previous,
            lines: previous.lines.map((l) =>
              l === existing ? { ...l, quantity: l.quantity + qty } : l,
            ),
          })
        } else {
          const optimisticLine: CartLine = {
            id: `optimistic-${input.productId}`,
            productId: input.productId,
            productName: (input.productName as string) ?? '',
            productImage: input.productImage as string | undefined,
            quantity: qty,
            price: (input.productPrice as number) ?? 0,
          }
          client.setQueryData(['cart'], {
            ...previous,
            lines: [...previous.lines, optimisticLine],
          })
        }
      }

      if (input.action === 'update' && typeof input.key === 'string') {
        const qty = Number(input.quantity)
        if (Number.isInteger(qty) && qty >= 1 && qty <= 99) {
          const line = previous.lines.find((l) => l.id === input.key)
          if (line && line.quantity !== qty) {
            const linePrice = line.price
            const oldLineTotal = line.total ?? linePrice * line.quantity
            const newLineTotal = linePrice * qty
            const newSubtotal = previous.subtotal - oldLineTotal + newLineTotal
            client.setQueryData(['cart'], {
              ...previous,
              lines: previous.lines.map((l) =>
                l.id === input.key ? { ...l, quantity: qty } : l,
              ),
              subtotal: newSubtotal,
              total:
                newSubtotal + previous.tax + (previous.shipping ?? 0) - previous.discount,
            })
          }
        }
      }

      return { previous }
    },
    onSuccess: (data) => {
      client.setQueryData(['cart'], data)
      if (typeof BroadcastChannel === 'undefined') return
      const channel = new BroadcastChannel('shams-cart')
      channel.postMessage('changed')
      channel.close()
    },
    onError: (_err, _input, context) => {
      if (context?.previous) {
        client.setQueryData(['cart'], context.previous)
      }
      void client.invalidateQueries({ queryKey: ['cart'] })
    },
    scope: { id: 'cart' },
  })

  useEffect(() => {
    if (!liveMode) return
    if (typeof BroadcastChannel === 'undefined') return
    const channel = new BroadcastChannel('shams-cart')
    channel.onmessage = () =>
      void client.invalidateQueries({ queryKey: ['cart'] })
    return () => channel.close()
  }, [liveMode, client])

  const cartLines = liveMode ? (cartQuery.data?.lines ?? []) : localCartLines
  const cartCount = cartLines.reduce((total, line) => total + line.quantity, 0)

  const [storageReady, setStorageReady] = useState(false)
  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(
        `shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`,
      )
      if (savedCart && !liveMode) setCartLines(JSON.parse(savedCart))
    } catch {
      /* Mock persistence is best-effort. */
    } finally {
      setStorageReady(true)
    }
  }, [liveMode])

  useEffect(() => {
    if (storageReady && !liveMode)
      window.localStorage.setItem(
        `shams-cart-lines-v2-${liveMode ? 'woo' : 'mock'}`,
        JSON.stringify(cartLines),
      )
  }, [cartLines, storageReady, liveMode])

  const addToCart = useCallback(
    async (
      input: Product | string,
      quantity = 1,
      variant?: { variationId: string; options: { attribute: string; value: string }[] },
    ) => {
      const product =
        typeof input === 'string'
          ? liveMode
            ? undefined
            : commerce.products
                .list()
                .find((item) => item.id === input || item.name === input)
          : input
      if (
        !product ||
        product.stock === 'out_of_stock' ||
        product.purchasable === false ||
        !Number.isFinite(product.price.amount) ||
        product.price.amount < 0 ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 99
      ) {
        notify(
          'Open the product page to check availability and options.',
          'warning',
        )
        return false
      }
      if (liveMode) {
        try {
          await cartMutation.mutateAsync({
            action: 'add',
            productId: variant?.variationId ?? product.id,
            variationId: variant?.variationId,
            options: variant?.options,
            quantity,
            productName: product.name,
            productImage: product.image,
            productPrice: product.price.amount,
          })
          notify(`${product.name} added to cart`)
          return true
        } catch (e) {
          notify(
            e instanceof Error ? e.message : 'Unable to add this product.',
            'error',
          )
          return false
        }
      }
      const lineId = variant
        ? `product-${variant.variationId}`
        : `product-${product.id}`
      setCartLines((lines) => {
        const existing = lines.find(
          (line) => !line.bundleGroupId && line.id === lineId,
        )
        if (existing)
          return lines.map((line) =>
            line === existing
              ? {
                  ...line,
                  quantity: Math.min(99, line.quantity + quantity),
                  price: product.price.amount,
                }
              : line,
          )
        return [
          ...lines,
          {
            id: lineId,
            productId: variant?.variationId ?? product.id,
            productName: product.name,
            productImage: product.image,
            quantity,
            price: product.price.amount,
            variationId: variant?.variationId,
            selectedOptions: variant?.options.map(
              (o) => `${o.attribute}: ${o.value}`,
            ),
          },
        ]
      })
      notify(`${product.name} added to cart`)
      return true
    },
    [notify, liveMode, cartMutation.mutateAsync],
  )

  const addBundleToCart = useCallback(
    (bundle: Parameters<CartContextValue['addBundleToCart']>[0]) => {
      if (liveMode) {
        notify('This setup is not available for online ordering yet.', 'info')
        return false
      }
      const requiredItems = bundle.items.filter(
        (item) => item.required !== false,
      )
      const products = requiredItems.map((item) =>
        bundle.products.find((product) => product.id === item.productId),
      )
      const unavailable = products.some(
        (product) => !product || product.stock === 'out_of_stock',
      )
      if (unavailable) {
        notify(
          'This setup cannot be added because one required item is unavailable',
          'warning',
        )
        return false
      }
      const bundleGroupId = `bundle-${Date.now()}`
      const savingsAmount =
        bundle.originalPrice.amount - bundle.bundlePrice.amount
      const metadata = {
        regularTotal: bundle.originalPrice.amount,
        bundleTotal: bundle.bundlePrice.amount,
        savingsAmount,
        currency: 'EGP' as const,
      }
      setCartLines((lines) => [
        ...lines,
        ...requiredItems.map((item) => {
          const product = bundle.products.find(
            (candidate) => candidate.id === item.productId,
          )!
          return {
            id: `${bundleGroupId}-${product.id}`,
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            quantity: 1,
            price: product.price.amount,
            bundleId: bundle.id,
            bundleGroupId,
            bundleName: bundle.name,
            bundleItemRole: item.role,
            bundlePricingMetadata: metadata,
          }
        }),
      ])
      notify(`${bundle.name} added to cart`)
      return true
    },
    [notify, liveMode],
  )

  const removeCartLine = useCallback(
    (id: string) => {
      if (liveMode) {
        void cartMutation
          .mutateAsync({ action: 'remove', key: id })
          .catch((e) => notify(e.message, 'error'))
        return
      }
      setCartLines((lines) => lines.filter((line) => line.id !== id))
    },
    [liveMode, cartMutation.mutateAsync, notify],
  )

  const removeBundleFromCart = useCallback(
    (bundleGroupId: string) => {
      if (liveMode) return
      setCartLines((lines) =>
        lines.filter((line) => line.bundleGroupId !== bundleGroupId),
      )
    },
    [liveMode],
  )

  const updateCartLineQuantity = useCallback(
    (key: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) return
      if (liveMode) {
        void cartMutation
          .mutateAsync({ action: 'update', key, quantity })
          .catch((e) => notify(e.message, 'error'))
        return
      }
      setCartLines((lines) =>
        lines.map((line) =>
          line.id === key ? { ...line, quantity } : line,
        ),
      )
    },
    [liveMode, cartMutation.mutateAsync, notify],
  )

  const value = useMemo(
    () => ({
      liveMode,
      cart: cartQuery.data,
      cartLoading: cartQuery.isLoading,
      cartError: cartQuery.error?.message,
      cartPending: cartMutation.isPending,
      mutateCart: cartMutation.mutateAsync,
      refreshCart: () => {
        void cartQuery.refetch()
      },
      cartCount,
      cartLines,
      addToCart,
      addBundleToCart,
      removeCartLine,
      removeBundleFromCart,
      updateCartLineQuantity,
    }),
    [
      liveMode,
      cartQuery.data,
      cartQuery.isLoading,
      cartQuery.error,
      cartMutation.isPending,
      cartMutation.mutateAsync,
      cartLines,
      cartCount,
      addToCart,
      addBundleToCart,
      removeCartLine,
      removeBundleFromCart,
      updateCartLineQuantity,
    ],
  )

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  )
}
