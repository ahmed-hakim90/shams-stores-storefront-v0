# Shams Headless 1.2.0 — Paymob coordination

Adds a private WooCommerce REST endpoint for durable checkout claims and webhook serialization across Vercel workers. Existing customer wishlist routes from 1.1.1 remain intact. No activation, database migration, deletion, key rotation or production payment was performed.

Requires a Woo REST read/write key owned by a user with manage_woocommerce. Install before enabling the accompanying Paymob frontend. Claims persist without automatic expiry to prevent uncertain writes becoming duplicate orders; operational recovery and staging gates are described in [PAYMOB-VERCEL](../docs/PAYMOB-VERCEL.md).

Validation: 11 PHP files passed PHP-WASM syntax checks; payment coordination fixture and wishlist fixture with Commerce UX passed. ZIP contains 12 source files; integrity passed.

Build: `python3 scripts/package-headless.py`.

SHA-256: `643977faae22d3b8026e4684a3667e0351e6673a4f422efc04d2f90d81d1ecc0`

Rollback: disable new Paymob intentions first. Keep compatible webhook/coordination code and HMAC configured while in-flight payments settle. Do not delete payment claims or order metadata as a rollback shortcut.
