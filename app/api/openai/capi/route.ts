import { getWooOrder, readOwnershipCookie } from '@/lib/payments/orders'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

const PIXEL_ID = 'KBHCVX1dYePAFy31mpRQgR'
const CAPI_URL = `https://bzr.openai.com/v1/events?pid=${PIXEL_ID}`

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_ADS_API_KEY
  if (!apiKey) return Response.json({ ok: true, skipped: true })

  const ownership = await readOwnershipCookie()
  if (!ownership) return Response.json({ error: 'No order on this device' }, { status: 401 })

  const order = await getWooOrder(ownership.id)
  if (!order || order.status === 'failed')
    return Response.json({ error: 'Order not found' }, { status: 404 })

  const body = await req.json().catch(() => ({})) as {
    oppref?: string
    items?: { id: string; quantity: number }[]
  }

  const jar = await cookies()
  const oppref = body.oppref || jar.get('openai_oppref')?.value || ''

  const eventId = `headless_${order.orderId}_${Date.now()}`
  const email = order.billing.email || order.email

  const event: Record<string, unknown> = {
    id: eventId,
    type: 'order_created',
    timestamp_ms: Date.now(),
    source_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'}/order/success`,
    action_source: 'web',
    data: {
      type: 'contents',
      amount: Math.round(order.total * 100),
      currency: order.currency || 'EGP',
      contents: (body.items ?? order.items.map((i) => ({ id: i.name, quantity: i.quantity }))).map((i) => ({
        id: i.id,
        quantity: i.quantity,
      })),
    },
  }

  if (oppref) event.oppref = oppref
  if (email) event.user = { email_sha256: await sha256(email.toLowerCase().trim()) }

  try {
    const res = await fetch(CAPI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ validate_only: false, events: [event] }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('OpenAI CAPI error', res.status, text)
    }
  } catch (e) {
    console.error('OpenAI CAPI fetch failed', e)
  }

  return Response.json({ ok: true })
}
