'use client'
import { useEffect, useRef, useState } from 'react'

// Returns a counter that increments whenever `count` changes, for re-triggering
// the one-shot badge-pop animation via React key.
export function useCountPulse(count: number) {
  const prev = useRef(count)
  const [pulse, setPulse] = useState(0)
  useEffect(() => {
    if (count !== prev.current) {
      prev.current = count
      setPulse((p) => p + 1)
    }
  }, [count])
  return pulse
}
