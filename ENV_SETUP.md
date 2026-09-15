# WooCommerce connection setup

The project now has two explicit modes. `COMMERCE_PROVIDER=mock` preserves the original design preview. `COMMERCE_PROVIDER=woocommerce` enables a connected catalog; it is **not a complete production checkout**. Connection failures never fall back to demo products.

## Configure

Use Node 22.18+ and pnpm. Copy `.env.example` to `.env.local` only if you do not already have local settings. Otherwise add/update these variables without overwriting other secrets:

```dotenv
COMMERCE_PROVIDER=mock
WOOCOMMERCE_API_URL=https://YOUR-STORE.example/wp-json/wc/v3
WOOCOMMERCE_API_KEY=ck_...
WOOCOMMERCE_API_SECRET=cs_...
WOOCOMMERCE_CURRENCY=EGP
```

Generate a **read-only** REST API key in WooCommerce > Settings > Advanced > REST API. Verify that the store actually uses EGP before setting the currency confirmation. Configure WordPress permalinks and HTTPS. Never put credentials in `NEXT_PUBLIC_*` variables, URLs, or git.

Run `pnpm commerce:check`. It performs read-only catalog requests, reports the visible product count and exits nonzero if configuration or connectivity is invalid. No orders, payments or products are created. Existing legacy `NEXT_PUBLIC_WOOCOMMERCE_API_URL`, Shams API, payment and email placeholder variables are not consumed by the new connection.

After the check succeeds, set `COMMERCE_PROVIDER=woocommerce`, restart the server and open `/shop`. In deployment settings, set the same variables and rebuild. Do not publish as a finished transactional store until the remaining work below is complete.

## Connected behavior

- Home opens `/shop` with a simple search/cart header; the original designed home and its merchandising remain available in mock mode.
- `/shop` reads published, visible products with offset pagination, search, category/brand slug or ID filters, and price/rating sorting. Both filters persist when loading more.
- `/p/:slug` reads the real product. `/c/:slug`, `/b/:slug` and `/brands/:slug` redirect to filtered shop results. `/search?q=...` redirects to the connected search.
- `/api/commerce/products` returns only mapped public product data. Authentication stays server-side, HTTPS is required, redirects are rejected, requests time out after 10 seconds and errors are sanitized. Responses are uncached while preparing the integration.
- The cart stores product IDs, names, images, prices and quantities locally. Old prototype carts and mock/connected carts are isolated. Local prices are display estimates, never authoritative checkout totals.
- Simple products can be added locally. Variable, grouped and external products cannot be added until their selection/checkout flows are implemented.
- Payment is explicitly unavailable. Demo account/order/bundle/wishlist/comparison routes do not serve fake records in connected mode.

## Payments (Paymob — direct API + embedded Pixel)

Card checkout runs Paymob directly (not a Woo gateway redirect). WooCommerce stays the order engine and the source of truth for prices, coupons, shipping and totals; the browser never supplies a price and never declares success.

Add these variables (see `.env.example`):

```dotenv
COMMERCE_CHECKOUT_ENABLED=true
COMMERCE_VERIFIED_PAYMENT_METHODS=cod
PAYMOB_SECRET_KEY=...            # server-only: Authorization: Token <key>
PAYMOB_HMAC_SECRET=...           # server-only: webhook signature verification
PAYMOB_INTEGRATION_ID=...        # card integration id(s), comma-separated
PAYMOB_BASE_URL=https://accept.paymob.com
NEXT_PUBLIC_PAYMOB_PUBLIC_KEY=... # client-safe; used by the Pixel SDK
NEXT_PUBLIC_APP_URL=https://your-public-host
```

Flow: `/checkout` → `POST /api/payments/intention` creates a **pending** Woo order (v3, write key) from the trusted server-side cart and a Paymob intention for the Woo-authoritative total → the **Paymob Pixel** renders the card fields (Paymob-hosted, never custom inputs) → 3DS → Paymob calls `POST /api/payments/paymob/webhook` → HMAC-SHA512 is verified and amount/currency/order-reference/transaction are reconciled **before** the order moves `pending → processing` and Paymob identifiers + an attempt ledger are written to order meta → `/order/success/[id]` polls `GET /api/payments/status/[id]` (authorized by the httpOnly order-ownership cookie) for the real state.

Requirements and safety notes:

- The Woo REST key must have **write** access (order create/update). `COMMERCE_CHECKOUT_ENABLED=true` is mandatory; without it the card option is hidden.
- `NEXT_PUBLIC_APP_URL` must be **public HTTPS** so Paymob can reach the webhook. For local sandbox testing, point it at an HTTPS tunnel.
- Webhook URL to register in the Paymob dashboard (or it is sent per-intention as `notification_url`): `https://your-public-host/api/payments/paymob/webhook`. The signature is read from the `hmac` query parameter.
- Only `NEXT_PUBLIC_PAYMOB_PUBLIC_KEY` and the per-intention `client_secret` reach the browser. `PAYMOB_SECRET_KEY` and `PAYMOB_HMAC_SECRET` are server-only.
- Refunds, bank installments and the affordability widget are designed for but **not** enabled in this release.

## Work required before launch

1. Supply and verify real endpoint/credentials, taxonomy slugs, brand support and EGP currency. Only mocked upstream responses have been tested until `commerce:check` passes against the store.
2. Integrate WooCommerce Store API cart sessions and checkout: shipping, taxes, coupons, authoritative totals, stock revalidation and payment provider flows. Do not create orders using browser-supplied prices.
3. Implement variations and inventory limits; connect the installed bundle plugin after its exact API schema is confirmed.
4. Connect customer authentication and scoped order history/tracking. Wishlist and comparison require real product IDs and retrieval.
5. Replace homepage merchandising, menus, editorial descriptions, warranty/branch claims and product recommendations with approved content/data; restore the full designed shell using real taxonomies. The connected shell is intentionally limited to catalog validation.
6. Define caching/invalidation, monitoring, accessibility and full mobile/desktop acceptance tests with real fixtures. Review image hosts before enabling image optimization.

## Checks

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm commerce:check
```

Reference contracts: [WooCommerce products](https://developer.woocommerce.com/docs/apis/rest-api/v3/products), [authentication](https://developer.woocommerce.com/docs/apis/rest-api/authentication).
