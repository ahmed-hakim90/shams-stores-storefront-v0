import { LiveCatalogPage } from '@/components/shams/live'
export const metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
}
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  return (
    <LiveCatalogPage
      title="Search gear"
      discovery={false}
      query={await searchParams}
      description="Search by product name, model, brand or SKU."
    />
  )
}
