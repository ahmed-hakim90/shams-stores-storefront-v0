import { CommerceQueryProvider } from '@/components/shams/query-provider'
import { commerceProvider } from '@/lib/commerce/server'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InteractionShell } from '@/components/shams/interaction-provider'
import { LiveFooter } from '@/components/shams/live-footer'

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
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="antialiased">
        <CommerceQueryProvider>
          <InteractionShell
            liveMode={liveMode}
            footer={liveMode ? <LiveFooter /> : undefined}
          >
            {children}
          </InteractionShell>
        </CommerceQueryProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
