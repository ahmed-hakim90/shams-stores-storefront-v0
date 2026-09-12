import { LiveCatalogPage } from '@/components/shams/live-catalog-page'
export const metadata = {
  title: 'Shop all gear',
  description:
    'Browse cameras, lenses, cinema, audio and lighting from Shams Stores.',
  alternates: { canonical: '/shop' },
}
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  return <LiveCatalogPage query={await searchParams} />
}
