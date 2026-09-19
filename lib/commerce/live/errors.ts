export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'RATE_LIMITED'
  | 'VALIDATION_ERROR'
  | 'OUT_OF_STOCK'
  | 'PRICE_CHANGED'
  | 'SESSION_EXPIRED'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_REVIEW_REQUIRED'
  | 'PAYMENT_SESSION_BUSY'
  | 'SERVER_ERROR'
  | 'UNKNOWN'
export class CommerceFault extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status = 502,
  ) {
    super(message)
  }
}
export function errorResponse(error: unknown) {
  const e =
    error instanceof CommerceFault
      ? error
      : new CommerceFault(
          'UNKNOWN',
          'This service is temporarily unavailable. Please try again.',
        )
  const requestId = crypto.randomUUID()
  console.error('[commerce]', { requestId, code: e.code, status: e.status })
  return Response.json(
    { error: e.message, code: e.code, requestId },
    { status: e.status, headers: { 'Cache-Control': 'no-store' } },
  )
}
