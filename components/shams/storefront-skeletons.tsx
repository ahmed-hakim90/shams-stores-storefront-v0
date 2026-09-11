import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex justify-between gap-3"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-12" /></div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  )
}

export function CatalogSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10" aria-label="Loading products">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="flex flex-col gap-3 border-b border-border pb-6"><Skeleton className="h-3 w-28" /><Skeleton className="h-10 w-64 sm:h-12 sm:w-96" /><Skeleton className="h-5 w-full max-w-2xl" /><Skeleton className="h-4 w-24" /></div>
      <div className="my-5 flex items-center justify-between"><Skeleton className="h-11 w-28 lg:hidden" /><Skeleton className="h-11 w-40" /></div>
      <div className="grid gap-6 lg:grid-cols-[210px_1fr]"><Skeleton className="hidden h-72 w-full lg:block" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <ProductCardSkeleton key={index} />)}</div></div>
    </main>
  )
}

export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-6 sm:py-10" aria-label="Loading product">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"><div className="aspect-square rounded-xl"><Skeleton className="size-full" /></div><div className="flex flex-col gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full max-w-lg" /><Skeleton className="h-5 w-40" /><Skeleton className="my-4 h-24 w-full" /><Skeleton className="h-5 w-28" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div></div>
    </main>
  )
}

export function CommercePageSkeleton() {
  return <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12" aria-label="Loading page"><Skeleton className="h-4 w-32" /><Skeleton className="mt-3 h-10 w-64" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div></main>
}
