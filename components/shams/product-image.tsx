'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
export function ProductImage(props: ImageProps) {
  const [failed, setFailed] = useState(false)
  return (
    <Image
      {...props}
      src={failed ? '/placeholder.svg' : props.src}
      onError={() => setFailed(true)}
    />
  )
}
