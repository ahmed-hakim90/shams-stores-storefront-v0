import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  callbackMessage,
  computeCallbackHmac,
  verifyCallbackHmac,
  parseTransactionCallback,
  merchantOrderIdFrom,
  paymobOrderIdFrom,
} from '../lib/payments/paymob/hmac.ts'
import {
  toAmountCents,
  buildIntentionRequest,
  derivePaymentState,
} from '../lib/payments/paymob/mapping.ts'

const secret = 'hmac_secret_test'
const obj = {
  id: 12345,
  amount_cents: 12010000,
  created_at: '2026-09-15T16:32:00',
  currency: 'EGP',
  error_occured: false,
  has_parent_transaction: false,
  integration_id: 5083949,
  is_3d_secure: true,
  is_auth: false,
  is_capture: false,
  is_refunded: false,
  is_standalone_payment: true,
  is_voided: false,
  order: { id: 399862108, merchant_order_id: '45891' },
  owner: 99,
  pending: false,
  source_data: { pan: '1234', sub_type: 'MASTERCARD', type: 'CARD' },
  success: true,
}

test('amount conversion rounds to integer piastres', () => {
  assert.equal(toAmountCents(120100), 12010000)
  assert.equal(toAmountCents('120100.00'), 12010000)
  assert.equal(toAmountCents(0.5), 50)
  assert.equal(toAmountCents('0.005'), 1)
  assert.throws(() => toAmountCents(-1))
  assert.throws(() => toAmountCents('abc'))
})

test('HMAC message concatenates the 20 fields in Paymob order, no separator', () => {
  const expected =
    `${12010000}${'2026-09-15T16:32:00'}EGP${false}${false}${12345}${5083949}` +
    `${true}${false}${false}${false}${true}${false}${399862108}${99}${false}` +
    `1234MASTERCARDCARD${true}`
  assert.equal(callbackMessage(obj), expected)
})

test('HMAC verify accepts a valid signature and rejects tampering', () => {
  const hmac = computeCallbackHmac(obj, secret)
  assert.match(hmac, /^[a-f0-9]{128}$/) // sha512 hex
  assert.equal(verifyCallbackHmac(obj, hmac, secret), true)
  assert.equal(verifyCallbackHmac({ ...obj, amount_cents: 1 }, hmac, secret), false)
  assert.equal(verifyCallbackHmac({ ...obj, success: false }, hmac, secret), false)
  assert.equal(verifyCallbackHmac(obj, hmac, 'wrong_secret'), false)
  assert.equal(verifyCallbackHmac(obj, null, secret), false)
  assert.equal(verifyCallbackHmac(obj, hmac.slice(0, 10), secret), false)
})

test('callback parsing never trusts an unverified payload', () => {
  const body = JSON.stringify({ type: 'TRANSACTION', obj })
  const good = computeCallbackHmac(obj, secret)
  const verified = parseTransactionCallback(body, good, secret)
  assert.equal(verified.verified, true)
  assert.equal(verified.merchantOrderId, '45891')
  assert.equal(verified.paymobOrderId, '399862108')
  assert.equal(verified.transactionId, '12345')
  assert.equal(verified.amountCents, 12010000)
  assert.equal(verified.currency, 'EGP')
  assert.equal(verified.success, true)
  assert.deepEqual(parseTransactionCallback(body, 'tampered', secret), { verified: false })
  assert.deepEqual(parseTransactionCallback('not json', good, secret), { verified: false })
  assert.deepEqual(parseTransactionCallback(JSON.stringify({ foo: 1 }), good, secret), { verified: false })
})

test('order id extraction handles nested and flat shapes', () => {
  assert.equal(merchantOrderIdFrom({ merchant_order_id: '7' }), '7')
  assert.equal(merchantOrderIdFrom({ order: { merchant_order_id: '9' } }), '9')
  assert.equal(merchantOrderIdFrom({}), '')
  assert.equal(paymobOrderIdFrom({ order: { id: 55 } }), '55')
  assert.equal(paymobOrderIdFrom({ order: 55 }), '55')
})

test('intention request maps the Woo-authoritative total and metadata', () => {
  const config = {
    baseUrl: 'https://accept.paymob.com',
    secretKey: 'sk_test',
    hmacSecret: secret,
    integrationIds: [111, 222],
    notificationUrl: 'https://app.example/api/payments/paymob/webhook',
    redirectionUrl: 'https://app.example/order/success',
  }
  const billing = {
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'a@b.co',
    phone: '+201234567890',
    city: 'Cairo',
    state: 'Cairo',
    street: '1 Tahrir',
    postalCode: '11511',
  }
  const matching = buildIntentionRequest(
    {
      orderId: '45891',
      amountCents: 12010000,
      currency: 'EGP',
      items: [
        { name: 'Canon EOS R5', amountCents: 12000000, quantity: 1 },
        { name: 'Shipping', amountCents: 10000, quantity: 1 },
      ],
      billing,
    },
    config,
  )
  assert.equal(matching.amount, 12010000)
  assert.equal(matching.currency, 'EGP')
  assert.deepEqual(matching.payment_methods, [111, 222])
  assert.equal(matching.special_reference, '45891')
  assert.equal(matching.notification_url, config.notificationUrl)
  assert.equal(matching.redirection_url, config.redirectionUrl)
  assert.equal(matching.items.length, 2)
  assert.equal(matching.billing_data.first_name, 'Ahmed')
  assert.equal(matching.billing_data.phone_number, '+201234567890')
  assert.equal(matching.billing_data.country, 'EGY')

  // When per-item amounts do not sum to the charged total (discount/shipping),
  // collapse to a single aggregate line so Paymob's item-sum check passes.
  const collapsed = buildIntentionRequest(
    {
      orderId: '45892',
      amountCents: 9000000,
      currency: 'EGP',
      items: [{ name: 'Discounted bundle', amountCents: 12000000, quantity: 1 }],
      billing,
    },
    config,
  )
  assert.equal(collapsed.items.length, 1)
  assert.equal(collapsed.items[0].amount, 9000000)
})

test('payment state derives from Woo status + payment meta', () => {
  assert.equal(derivePaymentState('processing', 'paid'), 'paid')
  assert.equal(derivePaymentState('completed', ''), 'paid')
  assert.equal(derivePaymentState('pending', 'pending'), 'pending')
  assert.equal(derivePaymentState('pending', 'failed'), 'failed')
  assert.equal(derivePaymentState('failed', ''), 'failed')
  assert.equal(derivePaymentState('on-hold', ''), 'processing')
  assert.equal(derivePaymentState('garbage', 'garbage'), 'unknown')
})
