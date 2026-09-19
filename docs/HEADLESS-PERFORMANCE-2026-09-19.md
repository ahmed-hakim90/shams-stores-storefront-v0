# Headless origin-load improvements — 2026-09-19

## Implemented locally

- Public editorial content now uses the existing Next fetch Data Cache: 120 seconds for product content/reviews/accessories, 300 seconds for site/page content and 3600 seconds for taxonomy image enrichment. Unknown routes remain uncached. No additional dependency or process-level response cache.
- Homepage relationship reads skip product-page-only reviews, variations and bundles. Bundle story reads one Store API product response while preserving its description, image and price.
- Comparison uses at most two upstream reads for up to four products: public visibility verification, then batched private specification metadata. It returns normalized specifications only, never raw metadata or unverified product IDs.
- Cart-token reads and mutations retain no-store. Checkout behavior and WordPress plugins were not changed.

## Validation

50 Node tests, TypeScript and a production build passed in the preceding implementation step. Build used existing mock fixtures to avoid build-time origin traffic; its existing middleware deprecation warning remains. Request-count and isolation tests live in `tests/catalog-load.test.mjs` and `tests/shams-content.test.mjs`.

The follow-up used the existing development server on port 3100, current working-tree code, live WooCommerce data and enabled Shams content. The attempted server on 3000 exited because Next detected the existing server; no existing process was stopped. No secrets were printed or modified.

Two sequential local HTTP reads without forced cache bypass:

| Read | First observed completion | Second completion | Result |
| --- | --- | --- | --- |
| Homepage HTML stream | 6667 ms | 269 ms | HTTP 200, live Tamron campaign |
| Comparison, two products | 3158 ms | 9 ms | HTTP 200, both IDs returned |

Homepage time to first byte was 281 ms and 242 ms respectively. The first read was not guaranteed fully cold. These are development-server observations, not a controlled before/after production benchmark, browser LCP measurement or proof of a production CPU reduction. Dev rendering and existing caches affect the figures.

The two comparison products had no comparable attributes/specification table in their cached source, correctly returning empty lists. A separate known product returned 15 populated specifications with HTTP 200 (3089 ms). The live product page for Samson GTrack Pro rendered its name and enabled purchase controls without an error overlay or logged browser error; no purchase was attempted.

The live homepage completed its loading sections and showed current catalog/navigation. Visual checks at widths 390, 768, 1024 and 1440 had no document horizontal overflow. No browser console errors were observed. This replaces the earlier mock-only visual evidence; it does not verify payment, customer-account or checkout transactions.

Read-only inspection confirmed editorial fetch-cache entries with the configured TTLs. Exact network request counts were verified with stubbed upstream unit tests, not measured from Cloudways logs during this check.

## Release and operational limits

Nothing was committed, pushed or deployed. Production keeps its current implementation until an authorized release. After release, compare matched traffic windows and warmed caches in Cloudways. Next can serve stale data during revalidation/outages; TTLs are not maximum-staleness guarantees. Price/stock refresh behavior and checkout remain owned by the existing WooCommerce paths.

For purely visual development the existing mock mode avoids live traffic, but it has different fixture presentation and must not be presented as the current live storefront. Live integration verification uses the live provider. Redis interruptions and unusually slow uncached origin requests still need host-side diagnosis if they persist; frontend caching does not prove those causes are resolved.
