import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { InteractionShell } from '@/components/shams/interaction-provider'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Shams Stores — Photography, Cinema & Creator Gear in Egypt',
    template: '%s · Shams Stores',
  },
  description:
    'Egypt&apos;s specialist for cameras, lenses, cinema, audio, lighting and drones. Official products, expert advice, installments and nationwide delivery from Shams Stores.',
  generator: 'v0.app',
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
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
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
  return (
    <html lang="en" className={`light ${inter.variable}`}>
      <body className="antialiased">
        <InteractionShell>{children}</InteractionShell>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
