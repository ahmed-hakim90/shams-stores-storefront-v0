# Vercel release — 19 September 2026

Owner authorized preparing environment variables and deploying the current local storefront changes. No Git commit or push, WordPress installation, callback change, or real transaction is part of this release.

## Target and rollback

- Team: `ahmed-hakim-90` (`team_vGIyCZhiS0VXzuH2WFiA8wxX`).
- Project: `shams-stores-storefront-v0` (`prj_HL33f31dX2C9nIub3J52Xa6WuPim`).
- Production domain: https://shams-stores-storefront-v0.vercel.app
- Previous production deployment: `qujkreVmUGUGRDjoj2Eh7aReZFXa`, https://shams-stores-storefront-v0-6r0avcwx7-ahmed-hakim-90.vercel.app
- Candidate deployment: `3jJwRqaxtLGZRKzpezz5FurkfDvN`, https://shams-stores-storefront-v0-1zqjyby4b-ahmed-hakim-90.vercel.app
- Source: local working tree based on `7d6381d`, including uncommitted implementation and performance changes; this is not a deployment of the unmodified Git commit.

Use Vercel Instant Rollback to the previous deployment if verification fails after promotion. Environment edits affect future builds; retain the compatible webhook while real payment attempts are pending.

## Environment handling

- Non-secret template: [VERCEL-PRODUCTION.env.example](VERCEL-PRODUCTION.env.example).
- Private import file: `.env.vercel-production.local`, ignored by Git and excluded from deployments, permissions 0600. Contains Woo credentials and deployment configuration; do not print or share it.
- Paymob Live `PAYMOB_SECRET_KEY`, `PAYMOB_HMAC_SECRET`, and `PAYMOB_PUBLIC_KEY` were saved directly as Vercel Production Secrets. They are deliberately omitted from the private import file; importing that file must preserve these existing secrets.
- Previous readable production environment backed up locally in `.env.vercel-before-20260919.local`, permissions 0600, also ignored/excluded. Sensitive values that Vercel does not export are not backed up by this file.
- Production gates: `COMMERCE_CHECKOUT_ENABLED=false`, `PAYMOB_ENABLED=false`. Catalog/content remains enabled. Installment notices remain hidden while Paymob is disabled.
- Live allowlist: card `5035900`; bank installments `3707775`. No Live Paymob credentials were added to Preview/Development. Previously shared Preview settings were preserved.
- `.vercelignore` excludes env files, Qoder settings, WordPress packages, reports and local build artifacts.

## Validation and remaining dependency

Before upload: 57 Node tests passed, TypeScript passed, and `git diff --check` passed. Deployment inputs were inspected with `vercel deploy --dry` before the production candidate upload.

Read-only WordPress REST index returned 200 and exposed `/shams/v1/site-content`; `/wc/v3/shams-headless/payment-sessions` was absent. Install Shams Headless 1.2.0 and complete the staging acceptance checks in [PAYMOB-VERCEL](PAYMOB-VERCEL.md) before enabling checkout/Paymob. No payment or order was created during this release.

## Completed deployment

Vercel build succeeded (Next.js 16.3.3, Node 24.x); deployment is READY and was promoted to the production domain. Vercel inspect resolved the production domain to `dpl_3jJwRqaxtLGZRKzpezz5FurkfDvN` after promotion. Existing middleware/proxy deprecation warning remains.

Post-deployment checks:
- Homepage rendered the live catalog; Canon R50 product rendered the live price, images and compatible accessories.
- Browser console error collection returned no errors for the checked product page.
- Responsive visual checks requested 390/768/1024/1440 device widths. Browser zoom yielded actual CSS widths 433/853/1138/1600; none had document horizontal overflow. Viewport override was reset. Earlier exact-width local checks remain documented separately.
- Production `GET /api/commerce/checkout`: 200 JSON, 27 governorates, enabled=false, paymob=false, zero Paymob options.
- Empty `POST /api/payments/intention`: expected 503 unavailable before any order write.
- Unsigned empty webhook POST: expected 400 rejection. This is not verification of a signed provider callback or an actual payment.
- Runtime error scan for this deployment returned one entry: the intentional disabled-intention probe above. No other error entries were returned during this short check; this is not long-term monitoring.

The CLI generated a Vercel automation bypass token while attempting protected candidate inspection. Deployment protection itself was not disabled. The candidate browser used the existing signed-in session; final API checks used the public production domain.

Paymob secrets are configured, but checkout and installments are deliberately not activated. WordPress package installation and staging acceptance remain outstanding. No new order or payment was created.


## Follow-up: independent installment display

Owner authorized deploying the local installment-display change. Production now has `PAYMOB_INSTALLMENT_DISPLAY_ENABLED=true`; the payment and checkout activation flags were not changed. The product notice reads currently enabled WooCommerce gateways through the server allowlist and does not depend on payment activation. It explicitly explains that online installment payment is not enabled yet.

Candidate: `dpl_7vYDZDwkp5p6mXs1gfNv8DkqwiFY` (`shams-stores-storefront-v0-mjvh81m9l-ahmed-hakim-90.vercel.app`). Source is the local working tree based on `dbab386`. The immediately previous production deployment is `dpl_E4d5vYE5nmeXMfBUGs7RCP5eyr4Q` (`shams-stores-storefront-v0-6opc02gy1-ahmed-hakim-90.vercel.app`); use this as the rollback target for this follow-up, not the earlier release target above.

Pre-deployment checks: 57 tests and TypeScript passed. No Git push or WordPress changes were performed. Production outcome is recorded after verification below.

Follow-up outcome: build passed on Vercel in 57 seconds and promotion succeeded. Production checkout API returned HTTP 200 with `installmentAvailable=true`, `paymob=false`, `enabled=false` and 27 governorates. Canon R50 rendered the installment notice and six installment links on product cards; browser console error collection was empty. No payment/order was created.

## Production payment activation — owner authorized

Owner explicitly requested production activation after reviewing disabled checkout. Production switches COMMERCE_CHECKOUT_ENABLED and PAYMOB_ENABLED changed to true; existing cod,bacs allowlist retained. Existing Live integration allowlists and secrets retained. Previous deployment for rollback: dpl_7vYDZDwkp5p6mXs1gfNv8DkqwiFY. To stop new payments, disable both switches and redeploy; preserve webhook secrets and payment-session plugin for pending callbacks.

Preflight: 57 Node tests and TypeScript passed. This activates configured payment options, not a product installment calculator. No bank tenors/rates feed is implemented; Pixel is the existing source of actual plans during payment. No production order or payment test has been performed. Deployment verification follows below.

Activation deployed and promoted: dpl_6a63dqKRxh7CeB2KqHbTefEewPXQ, https://shams-stores-storefront-v0-ejv0b9vlf-ahmed-hakim-90.vercel.app. Build passed in 52 seconds. Production checkout API HTTP 200: enabled=true, paymob=true, paymobUnavailable=false, verifiedMethods=[cod,bacs], card and installments options present. Unsigned webhook rejected with HTTP 400. No real payment/order submitted.

Browser verified the existing production cart checkout renders all four methods: Debit / credit card, Bank installments, Cash on delivery, InstaPay / bank transfer. No form submission. Deployment error-log query returned no logs.

## Shipping schema hotfix
User reported production `Invalid parameter(s): shipping_lines` on installment preparation. Live WordPress REST index confirms orders POST shipping_lines.instance_id is string; frontend sent number. Changed to string and added pending-order boundary test for selected rate, unselected exclusion, amount and missing instance fallback. 59 tests and TypeScript passed. Previous production: dpl_6a63dqKRxh7CeB2KqHbTefEewPXQ.

Existing failed attempt may leave a durable running claim because claim precedes order creation; this fix does not release historical claims. Do not delete cart/session or create another order to bypass this guard. Operational review is required before releasing any historical claim. No actual checkout/order was submitted by the agent. Deployment also includes the prepared backward-compatible assurance consumer/search changes; custom_label still requires WordPress Commerce UX 0.8.2, not installed by this task.

Shipping hotfix promoted successfully as dpl_2d2xpHr1MNjxAPZTZqAf5gUt5Tg8. Real order/payment not performed. Historical payment claim still requires operational review.

Bank-transfer UI deployed/promoted: dpl_CqxDjNd5Cf1bpwcXqajbzCY8T4Sz. Build and promotion successful. 61 headless tests, TypeScript, 97 WordPress tests and 11 PHP syntax checks passed. Account display requires Commerce UX 0.8.3 (prepared package, not installed); no hardcoded fallback numbers. Component fixture reviewed at four sizes. No actual order/payment submitted.

Review-state/UI follow-up: dpl_7nnFbL54CYGVjjKmv5Bmy5wzaQRE built successfully, with 62 tests and TypeScript passed. Adds safe stage diagnostics and PAYMENT_REVIEW_REQUIRED after a claimed preparation failure; grid layout avoids compressed payment columns. Read-only Woo inspection found pending headless orders 30309/30310 without saved intention metadata. No claim/order changes or payment performed; root provider-stage failure remains unconfirmed. Fixture visual check at mobile/desktop; not an end-to-end payment test.
