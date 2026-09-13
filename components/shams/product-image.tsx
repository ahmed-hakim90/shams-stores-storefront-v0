'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
export function ProductImage(props: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps['src'] | null>(null)
  return (
    <Image
      {...props}
      src={failedSource === props.src ? '/placeholder.svg' : props.src}
      onError={() => setFailedSource(props.src)}
    />
  )
}
