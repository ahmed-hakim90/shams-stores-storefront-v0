import Image from 'next/image'
import { cn } from '@/lib/utils'

export function ShamsLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-[180px] shrink-0 overflow-hidden rounded-lg bg-black align-middle',
        className,
      )}
    >
      <Image
        src="/brand/shams-stores-logo.png"
        alt="Shams Stores — PRO photo & Audio equipments"
        width={300}
        height={84}
        unoptimized
        className="block h-auto w-full"
      />
    </span>
  )
}
