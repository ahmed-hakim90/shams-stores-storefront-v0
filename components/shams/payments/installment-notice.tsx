'use client'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'
import { useCheckoutConfig } from './use-checkout-config'

export function InstallmentNotice({ eligible, href, detailed = false }: {
  eligible: boolean
  href?: string
  detailed?: boolean
}) {
  const query = useCheckoutConfig(eligible)
  const available = query.data?.installmentAvailable ?? (query.data?.paymob && query.data.paymobOptions?.some(option => option.kind === 'installments'))
  if (!eligible || query.isError || !available) return null
  if (detailed) return (
    <aside id="installments" className="mt-3 rounded-(--radius-control) border border-brand/20 bg-brand/5 p-3 scroll-mt-24" aria-label="Bank installment information">
      <p className="flex items-center gap-2 text-sm font-semibold text-brand-ink"><CalendarDays className="size-4" aria-hidden="true" /> Bank installments</p>
      <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{query.data?.paymob ? 'Select Bank installments at checkout to explore eligible banks and plans without leaving Shams.' : 'Bank installments are available through Shams. Contact our team for available banks and plans; online installment payment is not enabled yet.'} Your bank determines eligibility, durations and any fees before you confirm.</p>
    </aside>
  )
  const label = <><CalendarDays className="size-3.5 shrink-0" aria-hidden="true" /><span>Explore bank installments</span></>
  return href
    ? <Link href={href} prefetch={false} className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-brand-ink underline-offset-4 hover:underline focus-visible:underline">{label}</Link>
    : <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink">{label}</p>
}
