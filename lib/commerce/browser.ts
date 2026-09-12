export class BrowserCommerceError extends Error {
  constructor(
    message: string,
    public code: string,
    public requestId?: string,
  ) {
    super(message)
  }
}
export async function commerceFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error
    throw new BrowserCommerceError(
      'We could not connect. Please check your connection and try again.',
      'NETWORK_ERROR',
    )
  }
  let body
  try {
    body = await response.json()
  } catch {
    throw new BrowserCommerceError(
      'The store returned an incomplete response. Please try again.',
      'SERVER_ERROR',
    )
  }
  if (!response.ok)
    throw new BrowserCommerceError(
      typeof body.error === 'string' ? body.error : 'Please try again.',
      body.code ?? 'UNKNOWN',
      body.requestId,
    )
  return body as T
}
