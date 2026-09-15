import { paymobConfig } from './config'
import { createPaymobClient } from './client'
import { parseTransactionCallback } from './hmac'
import { buildIntentionRequest } from './mapping'
import type { PaymobServerConfig } from './types'
import type {
  CreateIntentionInput,
  ParsedWebhook,
  ParseWebhookInput,
  PaymentProvider,
  RefundInput,
} from '../provider'

// Re-exported so order/route code has a single import surface, while the pure
// logic stays in modules that node:test can load directly.
export {
  toAmountCents,
  buildIntentionRequest,
  derivePaymentState,
} from './mapping'
export {
  merchantOrderIdFrom,
  paymobOrderIdFrom,
  computeCallbackHmac,
  verifyCallbackHmac,
  parseTransactionCallback,
} from './hmac'

export function createPaymobProvider(
  config: PaymobServerConfig = paymobConfig(),
  fetcher: typeof fetch = fetch,
): PaymentProvider {
  const client = createPaymobClient(config, fetcher)
  return {
    id: 'paymob',
    async createIntention(input: CreateIntentionInput) {
      return client.createIntention(buildIntentionRequest(input, config))
    },
    async parseWebhook({
      rawBody,
      hmac,
    }: ParseWebhookInput): Promise<ParsedWebhook> {
      // HMAC verification is mandatory BEFORE any caller mutates an order.
      return parseTransactionCallback(rawBody, hmac, config.hmacSecret)
    },
    async refund(_input: RefundInput): Promise<never> {
      throw new Error('Refunds are not enabled in this release.')
    },
  }
}
