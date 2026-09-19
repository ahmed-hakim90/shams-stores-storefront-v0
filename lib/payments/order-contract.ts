export function orderMeta(raw: unknown): Record<string, unknown> {
  if (!Array.isArray(raw)) return {}
  return Object.fromEntries(raw.filter(m => m && typeof m.key === 'string').map(m => [m.key, m.value]))
}
export function ownsOrder(ownership: { id: string; key: string } | null, order: { orderId: string; orderKey: string }): boolean {
  return !!ownership && ownership.id === order.orderId && !!order.orderKey && ownership.key === order.orderKey
}

// Match only the cart actually paid for; never discard edits from another tab.
export function paymentCartSnapshot(cart: { lines: { id: string; productId: string; quantity: number }[]; total: number; coupons: string[] }): string {
  return JSON.stringify({ lines: cart.lines.map(l => [l.id, l.productId, l.quantity]).sort((a,b) => String(a[0]).localeCompare(String(b[0]))), total: cart.total, coupons: [...cart.coupons].sort() })
}
