'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="shams-container shams-section flex min-h-[60vh] flex-col items-center justify-center pb-[calc(3rem+var(--mobile-bottom-nav-height))] text-center sm:pb-0">
      <p className="text-6xl font-bold text-brand">!</p>
      <h1 className="shams-title mt-4">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="shams-button">
          Try again
        </button>
        <a href="/" className="shams-button shams-button-secondary">
          Back to home
        </a>
      </div>
    </main>
  )
}
