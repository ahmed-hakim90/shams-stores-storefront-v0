import 'server-only'
import { request } from '../../commerce/live/client'
import { CommerceFault } from '../../commerce/live/errors'
import { approvedGatewayOptions, integrationIds, makeOptions } from './methods'
import { paymobEnabled } from './config'

export async function paymobOptions() {
  if (!paymobEnabled()) return []
  const source = process.env.PAYMOB_METHOD_SOURCE || 'woocommerce'
  if (source === 'environment') return makeOptions(
    integrationIds(process.env.PAYMOB_INTEGRATION_ID),
    integrationIds(process.env.PAYMOB_INSTALLMENT_INTEGRATION_IDS),
  )
  if (source !== 'woocommerce') throw new CommerceFault('SERVER_ERROR', 'Invalid Paymob method source.', 503)
  // No cached copy of enabled methods, and no gateway settings/secrets exposed.
  return approvedGatewayOptions(
    (await request('/wc/v3/payment_gateways', { private: true })).data,
    integrationIds(process.env.PAYMOB_INTEGRATION_ID),
    integrationIds(process.env.PAYMOB_INSTALLMENT_INTEGRATION_IDS),
  )
}
