'use client'
import { useEffect, useId, useRef, useState } from 'react'

// Pinned merchant SDK: registers window.Pixel; there is no named ESM export,
// mount(), render(element) or event-emitter API. See PAYMOB-VERCEL.md.
const PIXEL_SDK = 'https://cdn.jsdelivr.net/npm/paymob-pixel@1.2.7/main.js'
type PixelConstructor = new (options: Record<string, unknown>) => unknown
declare global { interface Window { Pixel?: PixelConstructor } }
let sdkPromise: Promise<void> | null = null
function loadSdk(): Promise<void> {
  if (window.Pixel) return Promise.resolve()
  if (!sdkPromise) sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.type = 'module'; script.src = PIXEL_SDK
    const timer = window.setTimeout(() => fail(), 15000)
    const fail = () => { window.clearTimeout(timer); script.remove(); sdkPromise = null; reject(new Error('Payment SDK unavailable')) }
    script.onerror = fail
    script.onload = () => { window.clearTimeout(timer); if (window.Pixel) resolve(); else fail() }
    document.head.appendChild(script)
  })
  return sdkPromise
}
export function preloadPaymobPixel() { void loadSdk().catch(() => {}) }

export function PaymobPixel({ clientSecret, publicKey, method, pixelMethods, amountLabel, onCompleted, onError }: {
  clientSecret: string; publicKey: string; method: 'card' | 'installments'; pixelMethods: string[]; amountLabel: string
  onCompleted: () => void; onError: (message: string) => void
}) {
  const id = `paymob-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  const host = useRef<HTMLDivElement>(null)
  const initialized = useRef(false)
  const callbacks = useRef({ onCompleted, onError })
  callbacks.current = { onCompleted, onError }
  const [emptyForm, setEmptyForm] = useState(false)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  useEffect(() => {
    let active = true
    void loadSdk().then(() => {
      if (!active || !host.current || initialized.current || !window.Pixel) return
      initialized.current = true
      new window.Pixel({
        publicKey, clientSecret, elementId: id,
        paymentMethods: pixelMethods, // Names returned by Paymob for the selected server-side IDs.
        showSaveCard: false, forceSaveCard: false, disablePay: false,
        afterPaymentComplete: () => callbacks.current.onCompleted(),
      })
      setState('ready')
    }).catch(() => {
      if (!active) return
      setState('error')
      callbacks.current.onError('The secure payment form could not load. Reload to resume the same order; do not start a new payment.')
    })
    return () => { active = false }
  }, [clientSecret, publicKey, id, pixelMethods])
  useEffect(() => {
    if (state !== 'ready') return
    const timer = window.setTimeout(() => {
      const hasControls = (root: ParentNode): boolean => !!root.querySelector('iframe, input, select, button') || Array.from(root.querySelectorAll('*')).some(el => el.shadowRoot && hasControls(el.shadowRoot))
      if (host.current && !hasControls(host.current)) setEmptyForm(true)
    }, 15000)
    return () => window.clearTimeout(timer)
  }, [state])
  return (
    <section className="rounded-(--radius-card) border bg-card p-4 sm:p-5" aria-label="Secure Paymob payment">
      <h2 className="text-lg font-semibold">{method === 'installments' ? 'Choose your installment plan' : 'Secure card payment'}</h2>
      <p className="mt-1 text-sm text-muted-foreground">Order total: {amountLabel}. Payment details are handled securely by Paymob.</p>
      {method === 'installments' && <p className="mt-2 text-sm text-muted-foreground">Eligible banks, durations and fees are shown in the form. Review the full plan before confirming.</p>}
      <div ref={host} id={id} className="mt-5 min-h-40" />
      {state === 'loading' && <p role="status" className="mt-3 text-sm text-muted-foreground">Loading secure payment…</p>}
      {emptyForm && <p role="alert" className="mt-3 text-sm text-danger">The payment controls have not loaded. Contact Shams before trying another payment.</p>}
      {state === 'error' && <p role="alert" className="mt-3 text-sm text-danger">Payment form unavailable. Reload this page to resume, or contact Shams.</p>}
      <p className="mt-4 text-xs text-muted-foreground">Your bank may request a separate authentication step. Your order is confirmed only after payment verification.</p>
    </section>
  )
}
