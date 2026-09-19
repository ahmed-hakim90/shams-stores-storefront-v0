export type PaymobMethod = 'card' | 'installments'
export interface PaymobOption {
  id: 'paymob-card' | 'paymob-installments'
  kind: PaymobMethod
  title: string
  description: string
  integrationIds: number[]
}

// Only concrete, enabled EGP integrations; never the Pixel/main wrapper or
// a gateway merely mentioning installments in its marketing description.
export function gatewayOptions(raw: unknown): PaymobOption[] {
  if (!Array.isArray(raw)) return []
  const groups = new Map<PaymobMethod, number[]>()
  for (const gateway of raw) {
    if (!gateway || gateway.enabled !== true) continue
    const match = /^paymob-([1-9][0-9]*)-(card|bank-installments)-[a-z0-9-]+-egp$/.exec(gateway.id ?? '')
    if (!match) continue
    const id = Number(match[1])
    if (!Number.isSafeInteger(id)) continue
    const kind = match[2] === 'card' ? 'card' : 'installments'
    groups.set(kind, [...new Set([...(groups.get(kind) ?? []), id])])
  }
  return makeOptions(groups.get('card') ?? [], groups.get('installments') ?? [])
}

export function makeOptions(card: number[], installments: number[]): PaymobOption[] {
  return [
    ...(card.length ? [{ id: 'paymob-card' as const, kind: 'card' as const, title: 'Debit / credit card', description: 'Pay securely here. Your card details are handled by Paymob.', integrationIds: card }] : []),
    ...(installments.length ? [{ id: 'paymob-installments' as const, kind: 'installments' as const, title: 'Bank installments', description: 'Choose an eligible bank and plan in the secure form below. Review any fees before approving payment.', integrationIds: installments }] : []),
  ]
}

export function integrationIds(raw: string | undefined): number[] {
  if (!raw?.trim()) return []
  const values = raw.split(',').map(v => v.trim())
  if (values.some(v => !/^[1-9][0-9]*$/.test(v) || !Number.isSafeInteger(Number(v))))
    throw new Error('Integration IDs must be comma-separated positive integers.')
  return [...new Set(values.map(Number))]
}

export function approvedGatewayOptions(raw: unknown, cardIds: number[], installmentIds: number[]): PaymobOption[] {
  const allowed = makeOptions(cardIds, installmentIds)
  return gatewayOptions(raw)
    .map(option => ({ ...option, integrationIds: option.integrationIds.filter(id => allowed.find(a => a.kind === option.kind)?.integrationIds.includes(id)) }))
    .filter(option => option.integrationIds.length > 0)
}
