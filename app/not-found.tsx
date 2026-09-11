import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'
import { Header } from '@/components/shams/header'
import { Footer } from '@/components/shams/footer'

const links = [
  { label: 'Shop Cameras', href: '/c/cameras' },
  { label: 'Shop Lenses', href: '/c/lenses' },
  { label: 'Browse Categories', href: '/c/cameras' },
]

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8">
        <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-brand-muted text-brand" aria-hidden="true">
          <Search />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">We couldn&apos;t find that page.</h1>
        <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">Try searching for a product or continue browsing our photography, cinema and creator gear.</p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {links.map((link, index) => (
            <Link key={link.href} href={link.href} className={index === 0 ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-card px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'}>
              {link.label}
              {index === 0 && <ArrowRight data-icon="inline-end" />}
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
