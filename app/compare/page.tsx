import { SavedProducts } from '@/components/shams/saved-products'
export const metadata = {
  title: 'Compare gear',
  robots: { index: false, follow: true },
}
export default function Page() {
  return <SavedProducts mode="compare" />
}
