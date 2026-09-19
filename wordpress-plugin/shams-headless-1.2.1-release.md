# Shams Headless 1.2.1 — activation fix

Confirmed production log: `Cannot redeclare Shams_Auth::register()` on 19 September 2026. The auth class declared the method twice: REST route setup and customer account creation. Renamed the latter to `register_customer` and updated its callback. Public REST routes and stored settings are unchanged.

The earlier 1.2.0 syntax-pass claim was incorrect: the PHP-WASM CLI returned exit code zero while printing a fatal error. The new `scripts/check-headless.py` requires explicit success output and rejects fatal/parse messages as well as nonzero exits.

Validation: the original 1.2.0 ZIP reproduces the production error in the new full-entry-point bootstrap test. The fixed source passes 11 PHP syntax checks, full plugin bootstrap/activation defaults and auth-route callback checks, payment coordination, and wishlist routing with Commerce UX. ZIP integrity passed (12 files).

SHA256: `9e5d2b43d6a439f3e12ca53c87f04b3137f66c6900382b8e816e4c3aed80034c`

Upload `shams-headless-1.2.1.zip` as a replacement for the inactive 1.2.0 plugin, then activate. Do not delete plugin data or change checkout settings. Production activation has not been performed by this fix; Paymob and storefront checkout remain disabled pending integration acceptance. No Vercel deployment is needed for this PHP-only fix.
