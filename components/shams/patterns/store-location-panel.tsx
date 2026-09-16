import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'

type StoreLocationPanelProps = {
  name: string
  address: string
  landmark: string
  city: string
  phones: Array<{ label: string; href: string }>
  hours: string
  closed: string
}

export function StoreLocationPanel({
  name,
  address,
  landmark,
  city,
  phones,
  hours,
  closed,
}: StoreLocationPanelProps) {
  return (
    <div className="flex flex-col overflow-hidden rounded-(--radius-card) border border-border bg-card">
      <div className="flex items-center gap-3 border-b border-border bg-accent/40 px-6 py-4">
        <span className="inline-flex size-10 items-center justify-center rounded-(--radius-control) bg-brand-muted text-brand-ink">
          <StoreIcon />
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
          <p className="text-xs text-muted-foreground">
            Shams Stores &middot; {city}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="flex gap-3">
          <MapPinIcon />
          <div className="text-sm leading-6">
            <p className="font-medium text-foreground">{address}</p>
            <p className="text-muted-foreground">
              {landmark}
              <br />
              {city}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <PhoneIcon />
          <div className="space-y-1.5 text-sm">
            {phones.map((phone) => (
              <a
                key={phone.href}
                href={phone.href}
                className="block text-foreground transition-colors hover:text-brand"
              >
                {phone.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <ClockIcon />
          <div className="text-sm">
            <p className="font-medium text-foreground">{hours}</p>
            <p className="text-muted-foreground">Closed: {closed}</p>
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <a
            href={phones[0].href}
            className="inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) bg-brand px-4 text-xs font-semibold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            <PhoneIcon />
            Call now
          </a>
          <a
            href="https://wa.me/201011331666"
            className="inline-flex min-h-9 items-center gap-2 rounded-(--radius-control) border border-border px-4 text-xs font-medium text-foreground transition-colors hover:border-brand/40 hover:text-brand"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

function StoreIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
    </svg>
  )
}

function MapPinIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}
