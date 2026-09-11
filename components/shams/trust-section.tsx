import { BadgeCheck, CreditCard, RotateCcw, ShieldCheck } from 'lucide-react'

const pillars = [
  {
    icon: BadgeCheck,
    title: 'Authorized reseller',
    body: 'Genuine products sourced through official channels — no grey imports.',
  },
  {
    icon: ShieldCheck,
    title: 'Local warranty',
    body: 'Manufacturer and Shams-backed warranty serviced here in Egypt.',
  },
  {
    icon: CreditCard,
    title: 'Secure payment',
    body: 'Cards, wallets and installments with encrypted, PCI-compliant checkout.',
  },
  {
    icon: RotateCcw,
    title: '14-day returns',
    body: 'Change your mind on boxed gear within two weeks, hassle-free.',
  },
]

export function TrustSection() {
  return (
    <section className="border-y border-border bg-accent/40">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-5"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-muted text-brand">
                <p.icon className="size-5" />
              </span>
              <p className="font-semibold tracking-tight text-foreground">{p.title}</p>
              <p className="text-sm text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
