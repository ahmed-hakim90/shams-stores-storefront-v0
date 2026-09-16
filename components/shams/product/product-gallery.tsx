'use client'
import { useRef, useState, useCallback } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import type { ProductImage as ImageModel } from '@/lib/commerce/types'
import { ProductImage } from './product-image'
import { useOverlayPresence } from '@/components/shams/shared'
export function ProductGallery({
  images,
  name,
}: {
  images: ImageModel[]
  name: string
}) {
  const [selected, setSelected] = useState(0),
    [open, setOpen] = useState(false),
    [zoom, setZoom] = useState(false),
    [hoverZoom, setHoverZoom] = useState(false),
    [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const start = useRef<{ x: number; y: number } | null>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  useOverlayPresence(open)
  const move = (direction: number) => {
    setSelected((v) => (v + direction + images.length) % images.length)
    setZoom(false)
    setHoverZoom(false)
  }
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!mainRef.current) return
    const rect = mainRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])
  const image = images[selected] ?? images[0]
  if (!image) return null
  return (
    <section
      aria-label={`${name} images`}
      className="min-w-0 lg:sticky lg:top-[calc(var(--shell-header-height)+24px)]"
    >
      <div
        ref={mainRef}
        className="relative aspect-square overflow-hidden rounded-(--radius-editorial) border bg-surface-raised"
        onMouseEnter={() => setHoverZoom(true)}
        onMouseLeave={() => setHoverZoom(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }}
        onTouchEnd={(e) => {
          if (!start.current) return
          const dx = e.changedTouches[0].clientX - start.current.x,
            dy = e.changedTouches[0].clientY - start.current.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
            move(dx < 0 ? 1 : -1)
          start.current = null
        }}
      >
        <button
          aria-label="Enlarge product image"
          onClick={() => setOpen(true)}
          className="relative block size-full"
        >
          <ProductImage
            key={image.url}
            src={image.url}
            alt={image.alt || name}
            fill
            priority={selected === 0}
            sizes="(max-width: 1023px) 90vw, 660px"
            className="object-contain p-6 sm:p-10 transition-transform duration-200 ease-out"
            style={
              hoverZoom
                ? {
                    transform: 'scale(2)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />
          {!hoverZoom && (
            <span className="absolute bottom-4 right-4 flex size-11 items-center justify-center rounded-full border bg-surface-raised">
              <Expand className="size-4" />
            </span>
          )}
        </button>
        {images.length > 1 && (
          <span className="absolute bottom-4 left-4 rounded-full bg-muted px-3 py-2 text-xs tabular-nums">
            {selected + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => move(-1)}
            aria-label="Previous image"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={`${img.url}-${i}`}
                onClick={() => {
                  setSelected(i)
                  setZoom(false)
                  setHoverZoom(false)
                }}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === selected}
                className={`relative size-16 shrink-0 overflow-hidden rounded-(--radius-control) border bg-surface-raised ${i === selected ? 'border-brand-ink ring-1 ring-brand-ink' : ''}`}
              >
                <ProductImage
                  src={img.url}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-2"
                />
              </button>
            ))}
          </div>
          <button
            onClick={() => move(1)}
            aria-label="Next image"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
      <Dialog.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v)
          setZoom(false)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[150] bg-black/70" />
          <Dialog.Popup
            className="shams-overlay fixed inset-3 z-[151] flex flex-col rounded-(--radius-editorial) bg-card p-3 outline-none sm:inset-8"
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') move(1)
              if (e.key === 'ArrowLeft') move(-1)
            }}
          >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b pb-3">
              <Dialog.Title className="line-clamp-2 text-sm font-medium">
                {name}
              </Dialog.Title>
              <Dialog.Close
                aria-label="Close gallery"
                className="flex size-11 shrink-0 items-center justify-center rounded-full border"
              >
                <X className="size-5" />
              </Dialog.Close>
            </header>
            <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
              <div
                className={`relative ${zoom ? 'h-[160dvh] w-[180%]' : 'size-full'}`}
              >
                <ProductImage
                  key={image.url}
                  src={image.url}
                  alt={image.alt || name}
                  fill
                  sizes="90vw"
                  className="object-contain p-4"
                />
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <button
                onClick={() => move(-1)}
                disabled={images.length < 2}
                aria-label="Previous gallery image"
                className="flex size-11 items-center justify-center rounded-full border"
              >
                <ChevronLeft />
              </button>
              <button
                onClick={() => setZoom(!zoom)}
                aria-label={zoom ? 'Zoom out' : 'Zoom in'}
                aria-pressed={zoom}
                className="flex min-h-11 items-center gap-2 rounded-full border px-4"
              >
                {zoom ? (
                  <ZoomOut className="size-4" />
                ) : (
                  <ZoomIn className="size-4" />
                )}
                <span className="text-sm">{zoom ? 'Fit image' : 'Zoom'}</span>
              </button>
              <button
                onClick={() => move(1)}
                disabled={images.length < 2}
                aria-label="Next gallery image"
                className="flex size-11 items-center justify-center rounded-full border"
              >
                <ChevronRight />
              </button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  )
}
