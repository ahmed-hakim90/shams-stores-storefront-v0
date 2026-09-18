'use client'
import { usePathname } from 'next/navigation'
import {
  CatalogSkeleton,
  CommercePageSkeleton,
  ProductDetailSkeleton,
} from '@/components/shams/shared'

export default function Loading() {
  const pathname = usePathname()
  if (pathname.startsWith('/p/')) return <ProductDetailSkeleton />
  if (
    pathname.startsWith('/c/') ||
    pathname.startsWith('/b/') ||
    pathname.startsWith('/shop')
  )
    return <CatalogSkeleton />
  return <CommercePageSkeleton />
}
