import { Skeleton } from '@/components/ui/skeleton'

export function ProductCardSkeleton() {
  return (
    <div className="grid min-h-[210px] grid-cols-[minmax(120px,38%)_minmax(0,1fr)] overflow-hidden rounded-(--radius-card) border border-border bg-card sm:grid-cols-[220px_minmax(0,1fr)]" aria-hidden="true">
      <Skeleton className="h-full min-h-[210px] w-full rounded-none" />
      <div className="flex min-w-0 flex-col gap-3 p-3 sm:p-5">
        <div className="flex justify-between gap-3"><Skeleton className="h-3 w-16" /><Skeleton className="h-3 w-12" /></div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-2/5" />
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><Skeleton className="h-6 w-28" /><Skeleton className="h-11 w-full rounded-(--radius-control) sm:w-44" /></div>
      </div>
    </div>
  )
}

export function CatalogSkeleton() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10" aria-label="Loading products">
      <Skeleton className="mb-6 h-4 w-40" />
      <div className="flex flex-col gap-3 border-b border-border pb-6"><Skeleton className="h-3 w-28" /><Skeleton className="h-10 w-64 sm:h-12 sm:w-96" /><Skeleton className="h-5 w-full max-w-2xl" /><Skeleton className="h-4 w-24" /></div>
      <div className="my-5"><Skeleton className="h-4 w-40" /></div>
      <div className="grid grid-cols-1 gap-4">{Array.from({ length: 6 }, (_, index) => <ProductCardSkeleton key={index} />)}</div>
    </main>
  )
}

export function ProductDetailSkeleton() {
  return (
    <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 sm:py-10" aria-label="Loading product">
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12"><div className="aspect-square rounded-(--radius-editorial)"><Skeleton className="size-full" /></div><div className="flex flex-col gap-4"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full max-w-lg" /><Skeleton className="h-5 w-40" /><Skeleton className="my-4 h-24 w-full" /><Skeleton className="h-5 w-28" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></div></div>
    </main>
  )
}

export function CommercePageSkeleton() {
  return <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12" aria-label="Loading page"><Skeleton className="h-4 w-32" /><Skeleton className="mt-3 h-10 w-64" /><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-36 rounded-(--radius-card)" />)}</div></main>
}
