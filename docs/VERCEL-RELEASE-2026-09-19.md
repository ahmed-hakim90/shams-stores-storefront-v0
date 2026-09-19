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
