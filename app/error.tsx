'use client'

export default function StorefrontError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-2xl px-5 py-16 text-center">
    <h1 className="text-2xl font-semibold">We couldn’t load this page</h1>
    <p className="mt-3 text-muted-foreground">Please try again in a moment.</p>
    <button onClick={reset} className="mt-6 rounded-lg bg-brand px-5 py-3 font-semibold text-brand-foreground">Try again</button>
  </main>
}
