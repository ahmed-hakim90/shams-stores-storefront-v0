'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { commerceFetch } from '@/lib/commerce/browser'
import type { BankTransferDetails as Details } from '@/lib/payments/bank-transfer'

export function BankTransferDetails() {
  const [status, setStatus] = useState('')
  const query = useQuery({ queryKey: ['bank-transfer-details'], queryFn: () => commerceFetch<Details | null>('/api/commerce/bank-transfer'), staleTime: 0, retry: false })
  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setStatus('Copied to clipboard.') }
    catch { setStatus('Could not copy automatically. Select and copy the number below.') }
  }
  if (query.isPending) return <p role="status" className="text-sm text-muted-foreground">Loading transfer details…</p>
  if (query.isError || !query.data?.accounts.length) return <p role="status" className="text-sm text-muted-foreground">Transfer details are currently unavailable. Contact Shams before sending money.</p>
  return <section className="space-y-3 rounded-(--radius-control) border p-3" aria-label="Bank transfer details">
    <h3 className="text-sm font-semibold" dir="auto">{query.data.title || 'Bank transfer'}</h3>
    {query.data.instructions && <p dir="auto" className="whitespace-pre-line text-sm text-muted-foreground">{query.data.instructions}</p>}
    {query.data.accounts.map((account, i) => <div key={i} className="space-y-2 border-t pt-3">
      {account.bank_name && <p dir="auto" className="font-medium">{account.bank_name}</p>}
      {account.account_name && <p dir="auto" className="text-sm">{account.account_name}</p>}
      {([['Account number',account.account_number],['IBAN',account.iban],['Sort code',account.sort_code],['BIC / SWIFT',account.bic]] as const).filter(([,value])=>value).map(([label,value])=><div key={label} className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="min-w-0"><span className="block text-xs text-muted-foreground">{label}</span><span dir="ltr" className="block select-all break-all font-medium">{value}</span></div>
        <button type="button" onClick={()=>void copy(value)} aria-label={`Copy ${label}: ${value}`} className="min-h-11 rounded-(--radius-control) border px-3 text-brand-ink hover:bg-brand-muted focus-visible:outline-2 focus-visible:outline-brand">Copy</button>
      </div>)}
    </div>)}
    <p role="status" aria-live="polite" className="text-xs text-muted-foreground">{status}</p>
  </section>
}
