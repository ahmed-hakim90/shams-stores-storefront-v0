const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const CLEANUP_INTERVAL = 60_000

setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitMap) {
    if (value.resetAt < now) rateLimitMap.delete(key)
  }
}, CLEANUP_INTERVAL).unref?.()

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): { success: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const existing = rateLimitMap.get(key)

  if (!existing || existing.resetAt < now) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs })
    return { success: true }
  }

  if (existing.count >= options.limit) {
    return { success: false, retryAfterMs: existing.resetAt - now }
  }

  existing.count++
  return { success: true }
}
