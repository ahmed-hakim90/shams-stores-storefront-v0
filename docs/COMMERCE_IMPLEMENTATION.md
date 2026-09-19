# Shams live commerce implementation — 12 September 2026

This document supersedes the readiness-only conclusions in `WOOCOMMERCE_REVIEW.md`. The storefront now reads the real catalog and uses a real guest cart. **This is not a payment-production release.** Checkout and grouped bundle purchasing remain launch gates.

## Implemented architecture

`live/client.ts` is the only upstream transport. Store API, REST v3 enrichment and Shams APIs run on the Next server. REST credentials never enter browser payloads. `live/normalize.ts` converts unknown payloads into public models; no raw metadata is returned. `live/catalog.ts` provides catalog, taxonomy, facets, search, detail and branch queries. Route Handlers expose normalized public results and private session mutations. TanStack Query owns client query/mutation state; the existing interaction shell owns drawers, notices, saved IDs and comparison state.

ProductSummary retains the legacy display fields as a migration bridge for existing cards, with a validated integer-minor-unit ProductPrice alongside them. ProductDetail adds gallery, descriptions, structured specifications, warranty and relationship groups. No detail metadata or galleries are sent in listing responses. Cart amounts are normalized from Woo totals; no price/tax/shipping decision is made from submitted browser prices.

## Evidence that changed the approved plan

- The catalog has 1,415 published products, but **1,244 visible catalog products** in the current Store API query. Public browsing respects visibility, rather than treating the administrative count as the public count.
- The store advertises **EGP minor unit 0**, not an assumed two decimal places. Normalization supports the advertised precision; price-filter conversion is explicitly configured for this observed store.
- `/shams/v1/search?term=…&lang=en` is available and returns model-relevant products. Sony A7 IV resolves to the camera. Autocomplete uses this source and hydrates current Store API summaries. Best-match listing promotes at most six matching IDs, applies selected facets to them, excludes them from subsequent Woo pages, and preserves IDs in the opaque cursor. It does not download or locally index the catalog.
- Popularity ordering has real sales: Kodak ColorPlus 200 = 955; Samson SR850 = 146; Samson GTrack Pro = 138 at inspection. The home Best Sellers rail is supported, with its own bounded query.
- There are **zero variable and zero grouped products** in REST's current catalog. There is one `easy_product_bundle` (28617), but `/shams-bundles/v1/bundles/28617` returns inactive/not found. The two plugins' identifiers are not interchangeable. No bundle contents, savings or grouped lines are inferred from the name.
- `_shams_product_warranty` includes `yes`/`no`; these are normalized to a genuine warranty flag or omitted, never rendered as marketing copy.
- `/shams-orders/v1` exposes staff operations. It is not evidence of customer authentication or customer order-history support.
- Product 23700 currently returns the invalid title `3` in both Store API and REST. Numeric-only identities are rejected; the backend record needs correction. No title is reconstructed from its slug.
- The actual public contact route is `/shams-contact-2026/`; the assumed `/contact-us/` returns 404.

## Phase status and remaining gates

| Approved phase | Delivered | Remaining / launch condition |
|---|---|---|
| 1–2 API/contracts/models | Server transport, guarded normalizers, safe errors, summary/detail split, tests | Broaden fixtures as backend supplies populated optional fields; remove legacy display bridge only when mock consumers retire |
| 3 Navigation/categories/brands | Real taxonomy navigation, curated order of verified slugs, image cards, adaptive category and brand hubs | Editorial grouping can combine fragmented audio roots later without renaming backend taxonomy |
| 4 Shop/filter/feed | 24 initial records, one horizontal card per row, URL filters/sort, disjunctive facet counts, sticky desktop sidebar, Base UI mobile drawer, draft Apply, retry, cached pages and return position | Load/performance benchmark at 5k+; no invented sensor/mount facets |
| 5 Search | Shams model search, real product/brand/category suggestions, recent searches, debounce/abort, promoted exact candidates | No claim of typo tolerance; benchmark broader queries/SKUs before adding an index |
| 6 Cards/merchandising | Summary-only cards, real stock/pricing, missing-rating suppression, safe images, hover secondary image, validated short highlights, New/Deals/Best Sellers | Rich category highlight vocabulary as structured source quality improves |
| 7 PDP | Real gallery, text-safe descriptions, specifications, optional warranty/branches, sticky mobile purchase, related rails | Variation UI deliberately unavailable until real variable products can be validated; advanced zoom not added |
| 8 Relationships | Manual included product IDs with exclusions; Woo cross-sells/upsells/related kept distinct | Rule/exact-model compatibility evaluation and populated metadata contracts not verified; no brand/name inference |
| 9 Bundles | Real bundle-category browsing, real product detail, online add blocked for unsupported types on client **and server** | Authenticated Shams quote/add contract, active bundle sample, required/optional items, atomic failure and cart grouping must pass staging |
| 10 Cart/saved/compare | Real Cart-Token guest session, server totals, serialized mutations, cross-tab invalidation, quantity/removal/coupons, IDs-only guest saved state | Logged-in merge requires customer auth; wishlist/compare currently local to device; grouped cart renderer awaits real bundle lines |
| 11 Checkout/orders | Egyptian form and 27 governorates, backend shipping selection, verified-method allowlist, server checkout adapter, guest order ownership proof | Gateway sandbox/webhook/idempotency tests; pickup/branches contract; no customer account history; production switch stays off |
| 12 Discovery | Orange hero, category imagery, brands, independent New/Deals/Best Sellers requests, recently viewed | Trending/Staff Picks/Creator Setups need reviewed collections; no fabricated curated kits |
| 13 SEO/performance/QA | Optimized allowlisted images, public TTL caches, private no-store, Product/Breadcrumb JSON-LD, canonicals and robots, responsive QA | Field CWV, payment end-to-end QA, full accessibility audit and large-catalog benchmark remain release work |

## Contracts and cache policy

- Public list: `/api/commerce/products` (`q`, category, brand, stock, minPrice, maxPrice, onSale, sort, opaque cursor; at most 40 requested, normal batch 24). ID hydration is bounded at 100 IDs. No full-catalog localStorage.
- Taxonomy: `/api/commerce/taxonomy`; bounded taxonomy pagination only. Categories/brands TTL 1h.
- Facets: `/api/commerce/facets`; collection-data requests remove the facet's own selection for alternatives. Counts do not come from the loaded page. TTL 60s.
- Search: `/api/commerce/search`; Shams term search, taxonomy suggestions and Store hydration. TTL 30s.
- PDP enrichment TTL 5m; product summaries 2m; branches 30s. Public fetches carry `commerce-catalog` tag. There is no exposed unauthenticated cache-invalidation endpoint. A signed Woo webhook is follow-up work; TTL is the current freshness mechanism.
- Cart GET/POST, checkout and order responses always `no-store`. Token is stored in an HttpOnly, SameSite=Lax cookie; Secure in production. Mutations require same-origin Origin. Expired tokens are cleared with a visible error, never silently replaying a purchase mutation.
- Cart initialization, add/update/remove tested against separate isolated guest sessions. Backend errors are converted to safe messages and correlated request IDs, without raw response bodies or credentials in logs.
- Client infinite caches live 30 minutes in memory. Scroll positions alone are kept for returning from a product. Full page reload does not persist all loaded batches.

## Configuration and release gates

Keep existing `COMMERCE_PROVIDER=woocommerce`, Woo URL/key/secret and EGP configuration. The user's `.env.local` is not rewritten.

Additional server-only configuration (not enabled in this change):

```dotenv
COMMERCE_CHECKOUT_ENABLED=false
COMMERCE_VERIFIED_PAYMENT_METHODS=
```

Set `NEXT_PUBLIC_APP_URL` to the deployed storefront origin for SEO. Only enable checkout after each allowlisted gateway passes staging, including failed payment, return/refresh, webhook reconciliation and duplicate submission. IDs must be exact Woo gateway IDs; grouping labels are presentation only. No card details are handled by React. Never expose credentials or Cart-Token as NEXT_PUBLIC variables.

Store pickup remains unavailable because a public sanitized branch directory and order/shipping contract have not been established. Notification subscriptions are not fabricated: unavailable products can be saved to wishlist instead.

## Validation

- TypeScript and production build pass.
- 16 contract/normalization tests cover safe credentials, pagination, malformed money, absent stock/reviews, zero pricing, unsupported product types, allowed images, description sanitization, warranty flags and cart totals.
- Live isolated cart: add → GET persisted → quantity update → removal; a second new session remains empty. Test cart cleaned up; no orders or payments created.
- Live shipping: synthetic isolated Cairo address returned the real 85 EGP rate; selecting it produced 165,085 EGP total for the 165,000 EGP test product. Checkout POST remained blocked (503); test cart cleaned.
- Live search: Sony A7 IV returns the actual camera; default second catalog batch returns 24 records.
- Wishlist persisted after a browser reload; menu/search/cart use the shared shell.
- Browser viewport evidence is under `artifacts/qa/`. Checked document width at all requested sizes from 320 to 1920; taxonomy rails intentionally scroll internally. Sidebar switches to sticky at 1024.
- Browser back-navigation test restored 48 loaded Sony products and exactly scrollY=6332 after visiting a PDP. Mobile draft filtering correctly produced Sony-only results and live counts.
- Payment, bundle add/quote, customer login and pickup are **not validated** and remain unavailable.

## Source decisions

- [Woo Store API cart tokens](https://developer.woocommerce.com/docs/apis/store-api/cart-tokens/): BFF-owned guest session rather than local price objects.
- [Woo collection data](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/product-collection-data/): facet counts independent of loaded products.
- [Woo Order API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/order/): guest retrieval requires both key and billing email; ownership proof stays in HttpOnly cookie, not UI/URL.
- [Woo Checkout API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/checkout/): actual gateway support must be verified; REST order creation from browser prices was rejected.
- Local Next 16.3.3 documentation and [Next Image](https://nextjs.org/docs/app/api-reference/components/image): bounded public fetch TTL, no-store session data, remotePatterns and responsive sizes.
- [TanStack Query infinite queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries): existing React/Next-compatible dependency selected for pagination, deduplication and mutation state; no URL-state, carousel or search-index dependency added.
- [Base UI Drawer](https://base-ui.com/react/components/drawer): reuse installed accessible primitives for focus management and mobile overlays.


## Shams content integration — 2026-09-19

See [implementation and release gates](HEADLESS-IMPLEMENTATION-2026-09-19.md) for the current content API integration, no-store batch enrichment, verified checkout validation, Shams Headless 1.1.1 wishlist namespace, and remaining localization/staging work. This update supersedes the old PDP warranty metadata mapping and hardcoded display assurances.
