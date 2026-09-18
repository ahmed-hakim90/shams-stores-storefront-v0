'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  Package,
  Truck,
  RotateCcw,
  CreditCard,
  ShieldCheck,
  Headphones,
  MapPin,
  MessageCircle,
  ArrowRight,
} from 'lucide-react'

const TOPICS = [
  { key: 'all', label: 'All topics' },
  { key: 'orders', label: 'Orders' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'returns', label: 'Returns' },
  { key: 'payments', label: 'Payments' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'product', label: 'Product help' },
  { key: 'contact', label: 'Contact' },
] as const

const CARDS: Array<{
  icon: LucideIcon
  title: string
  body: string
  action: { label: string; href: string }
  topic: string
}> = [
  {
    icon: Package,
    title: 'Order & delivery',
    body: 'Track your order, check delivery estimates for your area, or get help with shipping and pickup options.',
    action: { label: 'Track order', href: '/track-order' },
    topic: 'orders',
  },
  {
    icon: Truck,
    title: 'Shipping info',
    body: 'Delivery times, free delivery threshold and how we ship across Egypt.',
    action: { label: 'Shipping details', href: '/shipping' },
    topic: 'shipping',
  },
  {
    icon: RotateCcw,
    title: 'Returns & exchanges',
    body: 'Change your mind on boxed gear within 14 days. Contact us to start a return or exchange.',
    action: { label: 'Return policy', href: '/returns' },
    topic: 'returns',
  },
  {
    icon: CreditCard,
    title: 'Payment & installments',
    body: 'We accept cards, cash and offer installment plans up to 24 months. Ask about current offers.',
    action: { label: 'Payment options', href: '/payment' },
    topic: 'payments',
  },
  {
    icon: ShieldCheck,
    title: 'Warranty & repairs',
    body: 'All products carry local warranty. Contact us for warranty claims, repair estimates or servicing.',
    action: { label: 'Warranty info', href: '/warranty' },
    topic: 'warranty',
  },
  {
    icon: Headphones,
    title: 'Choosing gear',
    body: 'Not sure which camera, lens or setup is right? Our specialists can walk you through the options.',
    action: { label: 'Call us', href: 'tel:0223901870' },
    topic: 'product',
  },
  {
    icon: MapPin,
    title: 'Store pickup',
    body: 'Order online and pick up from our Downtown or Heliopolis showroom the same day.',
    action: { label: 'See branches', href: '/branches' },
    topic: 'orders',
  },
  {
    icon: MessageCircle,
    title: 'Contact us',
    body: 'Reach our team by phone, WhatsApp or visit our showrooms. We typically respond within the hour.',
    action: { label: 'Get in touch', href: '/contact' },
    topic: 'contact',
  },
]

export function SupportHub() {
  const [active, setActive] = useState<string>('all')

  const filtered =
    active === 'all' ? CARDS : CARDS.filter((c) => c.topic === active)

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {TOPICS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`inline-flex h-8 items-center rounded-(--radius-control) px-3 text-xs font-medium transition-colors ${
              active === t.key
                ? 'bg-brand text-brand-foreground'
                : 'border border-border bg-background text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((card) => (
          <div
            key={card.title}
            className="flex flex-col gap-4 rounded-(--radius-card) border border-border bg-card p-6"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
              <card.icon className="size-5" />
            </span>
            <div className="space-y-1">
              <h3 className="font-semibold tracking-tight text-foreground">
                {card.title}
              </h3>
              <p className="text-sm leading-6 text-muted-foreground">
                {card.body}
              </p>
            </div>
            <Link
              href={card.action.href}
              className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink transition-colors hover:text-brand"
            >
              {card.action.label}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
