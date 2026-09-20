import { siteContent } from '@/lib/commerce/live/shams-content'
import { mapSiteContent } from '@/lib/commerce/live/shams-contract'
import { SiteContentProvider } from '@/components/shams/providers/site-content-provider'
import { CommerceQueryProvider, CookieConsent } from '@/components/shams/shared'
import { commerceProvider } from '@/lib/commerce/server'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InteractionShell, AuthProvider } from '@/components/shams/providers'
import { LiveFooter } from '@/components/shams/live'
import { openaiPixelScript, allPixelScripts, hasAnyExtraPixel } from '@/lib/tracking'
import { OpprefCapture } from '@/components/shams/shared/oppref-capture'

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const liveMode = commerceProvider() === 'woocommerce'
  const shell = mapSiteContent(liveMode ? await siteContent() : null)
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.shams-stores.com'
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Shams Stores',
    url: origin,
    logo: `${origin}/brand/shams-icon-192.png`,
    description: 'Photography, cinema and creator equipment in Egypt.',
    ...(shell.branches[0]?.phones[0] ? { contactPoint: { '@type': 'ContactPoint', telephone: shell.branches[0].phones[0], contactType: 'customer service' } } : {}),
  }
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c'),
          }}
        />
        <CommerceQueryProvider>
          <SiteContentProvider value={shell}><AuthProvider>
            <InteractionShell
              liveMode={liveMode}
              footer={liveMode ? <LiveFooter /> : undefined}
            >
              {children}
            </InteractionShell>
          </AuthProvider></SiteContentProvider>
        </CommerceQueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <CookieConsent />
        <OpprefCapture />
        <script dangerouslySetInnerHTML={{ __html: openaiPixelScript }} />
        {hasAnyExtraPixel && <script dangerouslySetInnerHTML={{ __html: allPixelScripts }} />}
      </body>
    </html>
  )
}
