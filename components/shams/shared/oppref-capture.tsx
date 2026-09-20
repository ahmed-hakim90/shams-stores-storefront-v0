'use client'
import { useEffect } from 'react'
import { captureOppref } from '@/lib/tracking'

export function OpprefCapture() {
  useEffect(() => {
    captureOppref()
  }, [])
  return null
}
