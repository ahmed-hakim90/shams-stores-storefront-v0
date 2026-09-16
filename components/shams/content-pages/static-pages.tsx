export function CookiesPage() {
  return (
    <main className="pb-[calc(2rem+var(--mobile-bottom-nav-height))] sm:pb-0">
      <section className="relative overflow-hidden bg-foreground text-white">
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(120% 100% at 80% 20%, rgba(255,255,255,0.12) 0%, transparent 50%)',
          }}
        />
        <div className="shams-container relative py-16 sm:py-20">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
              <CookieIcon className="size-3.5 text-orange-300" />
              Legal
            </span>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
              Cookie policy
            </h1>
            <p className="max-w-lg text-pretty text-base leading-7 text-white/70">
              This policy explains what cookies are, how Shams Stores uses them,
              and how you can manage your preferences.
            </p>
            <p className="text-xs text-white/40">Last updated: September 2026</p>
          </div>
        </div>
      </section>

      <section className="shams-container py-14 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-10">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              What are cookies?
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Cookies are small text files stored on your device when you visit
              a website. They help the site remember your preferences, understand
              how you use it and provide a better experience on future visits.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              How we use cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Shams Stores uses cookies for the following purposes:
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Essential',
                body: 'Required for the website to function. These include session cookies, cart contents and security tokens. They cannot be disabled.',
                badge: 'Always active',
              },
              {
                title: 'Functional',
                body: 'Remember your preferences such as language, region and recently viewed products to personalize your experience.',
                badge: 'Optional',
              },
              {
                title: 'Analytics',
                body: 'Help us understand how visitors interact with our website by collecting anonymous usage data. This helps us improve the site.',
                badge: 'Optional',
              },
              {
                title: 'Marketing',
                body: 'Used to deliver relevant advertisements and measure campaign effectiveness. These are set by our advertising partners.',
                badge: 'Optional',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-(--radius-card) border border-border bg-card p-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold tracking-tight text-foreground">
                    {item.title}
                  </h3>
                  <span className="rounded-full bg-brand-muted px-2.5 py-0.5 text-xs font-medium text-brand-ink">
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Managing cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              You can control cookies through your browser settings. Most
              browsers allow you to block or delete cookies. Note that disabling
              essential cookies may prevent parts of the website from working
              correctly, including the shopping cart and checkout process.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Third-party cookies
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Some cookies are placed by third-party services we use, such as
              payment providers and analytics tools. We do not control these
              cookies. Refer to the respective third-party privacy policies for
              more information.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Contact
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              If you have questions about our use of cookies, contact us at our
              Downtown Cairo showroom (022 392 9204) or via WhatsApp (010 2000
              1604).
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function CookieIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
      <path d="M8.5 8.5v.01" />
      <path d="M16 15.5v.01" />
      <path d="M12 12v.01" />
      <path d="M11 17v.01" />
      <path d="M7 14v.01" />
    </svg>
  )
}
