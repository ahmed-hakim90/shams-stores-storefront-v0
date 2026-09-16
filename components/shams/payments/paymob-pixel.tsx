'use client'
import { useEffect, useRef, useState } from 'react'

// Paymob's embedded checkout SDK. Card fields are rendered and hosted by
// Paymob inside #paymob-pixel — we never build our own card-number/CVV inputs,
// so sensitive data never touches Shams. Only the merchant public key and the
// per-intention client_secret are passed in; both are safe for the browser.
const PIXEL_SDK = 'https://cdn.jsdelivr.net/npm/paymob-pixel/+esm'

type PixelInstance = {
  mount?: (el: HTMLElement) => void
  render?: (el: HTMLElement) => void
  on?: (event: string, cb: (payload: unknown) => void) => void
}

let sdkPromise: Promise<unknown> | null = null
function loadSdk(): Promise<unknown> {
  if (!sdkPromise)
    sdkPromise = import(/* webpackIgnore: true */ PIXEL_SDK).catch((e) => {
      sdkPromise = null
      throw e
    })
  return sdkPromise
}

export function preloadPaymobPixel() {
  loadSdk()
}

export function PaymobPixel({
  clientSecret,
  amountLabel,
  onCompleted,
  onError,
}: {
  clientSecret: string
  amountLabel: string
  onCompleted: () => void
  onError: (message: string) => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [reload, setReload] = useState(0)
  const publicKey = process.env.NEXT_PUBLIC_PAYMOB_PUBLIC_KEY ?? ''

  useEffect(() => {
    let cancelled = false
    setState('loading')
    if (!publicKey) {
      setState('error')
      onError('Payments are not fully configured yet. Please contact Shams.')
      return
    }
    loadSdk()
      .then((mod) => {
        if (cancelled || !host.current) return
        const record = mod as Record<string, unknown>
        const Ctor = (record.Pixel ?? record.default) as
          | (new (opts: Record<string, unknown>) => PixelInstance)
          | undefined
        if (typeof Ctor !== 'function')
          throw new Error('Pixel SDK did not expose a constructor')
        const pixel = new Ctor({ publicKey, clientSecret })
        const el = host.current
        if (typeof pixel.mount === 'function') pixel.mount(el)
        else if (typeof pixel.render === 'function') pixel.render(el)
        else throw new Error('Pixel SDK did not expose mount/render')
        // Paymob drives 3DS + redirect to the server-configured redirection_url.
        // We also listen for an inline completion event when the SDK emits one.
        pixel.on?.('success', () => !cancelled && onCompleted())
        pixel.on?.('complete', () => !cancelled && onCompleted())
        pixel.on?.('error', (p) => {
          if (cancelled) return
          const msg =
            p && typeof p === 'object' && 'message' in p
              ? String((p as { message: unknown }).message)
              : 'Payment could not be completed.'
          onError(msg)
        })
        setState('ready')
      })
      .catch(() => {
        if (cancelled) return
        setState('error')
        onError('We could not load the secure payment form. Please retry.')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSecret, publicKey, reload])

  return (
    <div className="rounded-(--radius-card) border bg-card p-5">
      <h2 className="text-lg font-semibold">Secure payment</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Pay {amountLabel}. Card details are encrypted by Paymob.
      </p>
      <div className="relative mt-5 min-h-40">
        <div ref={host} className="paymob-pixel-host" />
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-7 animate-spin rounded-full border-2 border-brand border-t-transparent" />
          </div>
        )}
      </div>
      {state === 'error' && (
        <button
          onClick={() => setReload((n) => n + 1)}
          className="mt-4 min-h-11 rounded-(--radius-control) border border-brand px-5 text-sm font-semibold text-brand-ink"
        >
          Retry payment form
        </button>
      )}
    </div>
  )
}
