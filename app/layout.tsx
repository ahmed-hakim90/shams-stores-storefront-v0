import { CommerceQueryProvider, CookieConsent } from '@/components/shams/shared'
import { commerceProvider } from '@/lib/commerce/server'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InteractionShell, AuthProvider } from '@/components/shams/providers'
import { LiveFooter } from '@/components/shams/live'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com',
  ),
  title: {
    default: 'Shams Stores — Photography, Cinema & Creator Gear in Egypt',
    template: '%s · Shams Stores',
  },
  description:
    'Photography, cinema and creator equipment in Egypt. Explore cameras, lenses, audio, lighting and accessories at Shams Stores.',
  keywords: [
    'camera store Egypt',
    'Sony camera Egypt',
    'Canon Egypt',
    'DJI Egypt',
    'cinema gear',
    'photography equipment',
    'Shams Stores',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_EG',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com',
    siteName: 'Shams Stores',
    images: [
      {
        url: '/brand/shams-icon-192.png',
        width: 192,
        height: 192,
        alt: 'Shams Stores',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Shams Stores — Photography, Cinema & Creator Gear in Egypt',
    description:
      'Photography, cinema and creator equipment in Egypt. Explore cameras, lenses, audio, lighting and accessories at Shams Stores.',
    images: ['/brand/shams-icon-192.png'],
  },
  icons: {
    icon: [
      { url: '/brand/shams-icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/shams-icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/brand/shams-icon-32.png',
    apple: { url: '/brand/shams-icon-180.png', sizes: '180x180', type: 'image/png' },
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#F47A20',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const liveMode = commerceProvider() === 'woocommerce'
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shams Stores',
    url: origin,
    logo: `${origin}/brand/shams-icon-192.png`,
    description: 'Photography, cinema and creator equipment in Egypt.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Downtown Cairo',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+20-100-000-0000',
      contactType: 'customer service',
      areaServed: 'EG',
      availableLanguage: ['Arabic', 'English'],
    },
  }
  const localSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Shams Stores',
    image: `${origin}/brand/shams-icon-192.png`,
    url: origin,
    telephone: '+20-100-000-0000',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Cairo',
      addressCountry: 'EG',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 30.0444,
      longitude: 31.2357,
    },
  }
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only fixed left-2 top-2 z-[200] rounded-(--radius-control) bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground">
          Skip to content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgSchema, localSchema]).replace(/</g, '\\u003c'),
          }}
        />
        <CommerceQueryProvider>
          <AuthProvider>
            <InteractionShell
              liveMode={liveMode}
              footer={liveMode ? <LiveFooter /> : undefined}
            >
              {children}
            </InteractionShell>
          </AuthProvider>
        </CommerceQueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <CookieConsent />
      </body>
    </html>
  )
}
