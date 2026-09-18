'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Package,
  Headphones,
  ShieldCheck,
  RotateCcw,
  MessageCircle,
  Phone,
  ArrowRight,
} from 'lucide-react'

const REASONS = [
  {
    key: 'order',
    icon: Package,
    label: 'Question about an order',
    description: 'Track delivery, change details or ask about status',
    channels: [
      { label: 'Track your order', href: '/track-order', icon: Package },
      { label: 'Call us', href: 'tel:0223901870', icon: Phone },
      { label: 'WhatsApp', href: 'https://wa.me/201011331666', icon: MessageCircle },
    ],
  },
  {
    key: 'advice',
    icon: Headphones,
    label: 'Product advice',
    description: 'Help choosing gear, compatibility or setup questions',
    channels: [
      { label: 'Call us', href: 'tel:0223901870', icon: Phone },
      { label: 'Visit our stores', href: '/branches', icon: Package },
    ],
  },
  {
    key: 'warranty',
    icon: ShieldCheck,
    label: 'Warranty or repair',
    description: 'File a claim, check coverage or get repair estimates',
    channels: [
      { label: 'WhatsApp us', href: 'https://wa.me/201011331666', icon: MessageCircle },
      { label: 'Call us', href: 'tel:0223901870', icon: Phone },
    ],
  },
  {
    key: 'return',
    icon: RotateCcw,
    label: 'Return or exchange',
    description: 'Start a return or exchange for boxed gear',
    channels: [
      { label: 'WhatsApp to initiate', href: 'https://wa.me/201011331666', icon: MessageCircle },
      { label: 'Return policy', href: '/returns', icon: ArrowRight },
    ],
  },
  {
    key: 'general',
    icon: MessageCircle,
    label: 'General question',
    description: 'Anything else — we are happy to help',
    channels: [
      { label: 'Call us', href: 'tel:0223901870', icon: Phone },
      { label: 'WhatsApp', href: 'https://wa.me/201011331666', icon: MessageCircle },
      { label: 'Visit our stores', href: '/branches', icon: Package },
    ],
  },
] as const

export function ContactReasonSelector() {
  const [selected, setSelected] = useState<string | null>(null)
  const active = REASONS.find((r) => r.key === selected)

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REASONS.map((reason) => (
          <button
            key={reason.key}
            type="button"
            onClick={() =>
              setSelected(selected === reason.key ? null : reason.key)
            }
            className={`flex flex-col items-start gap-3 rounded-(--radius-card) border p-5 text-left transition-colors ${
              selected === reason.key
                ? 'border-brand/40 bg-brand-muted'
                : 'border-border bg-card hover:border-foreground'
            }`}
          >
            <span
              className={`inline-flex size-9 items-center justify-center rounded-(--radius-control) ${
                selected === reason.key
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-brand-muted text-brand-ink'
              }`}
            >
              <reason.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {reason.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {reason.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div className="mt-6 rounded-(--radius-card) border border-border bg-card p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Best ways to reach us
          </p>
          <div className="flex flex-wrap gap-3">
            {active.channels.map((ch) => {
              const isExternal =
                ch.href.startsWith('http') || ch.href.startsWith('tel:')
              const className =
                'inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) border border-border bg-background px-4 text-xs font-medium text-foreground transition-colors hover:border-foreground hover:text-brand'
              if (isExternal) {
                return (
                  <a key={ch.href} href={ch.href} className={className}>
                    <ch.icon className="size-3.5" />
                    {ch.label}
                  </a>
                )
              }
              return (
                <Link key={ch.href} href={ch.href} className={className}>
                  <ch.icon className="size-3.5" />
                  {ch.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
