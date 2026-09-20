# Refactor Progress Tracker

## Step 1: Shared WordPress Client (`lib/wp-client.ts`)
- **Status:** complete
- **Files changed:** `lib/wp-client.ts` (created), 14 API routes migrated (7 auth + 7 customer)
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** All auth and customer API routes preserve existing behavior (rate limiting, cookie handling, error messages, special responses like `{ user: null }` and `{ orders: [] }`)
- **Regressions:** none
- **Remaining risks:** wpFetch uses 20s timeout (was varies 15s-none) — acceptable standardization

## Step 2: Extract CartLineItem Component
- **Status:** complete
- **Files changed:** `components/shams/cart/cart-line-item.tsx` (created), `cart-drawer.tsx` (updated), `cart-page-content.tsx` (updated)
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** Cart drawer and cart page use shared CartLineItem; compact variant preserves leaving animation; full variant preserves card styling
- **Regressions:** none

## Step 3: Split InteractionProvider
- **Status:** complete
- **Files changed:**
  - `components/shams/providers/notice-provider.tsx` (created) — toast/notification state
  - `components/shams/providers/compare-provider.tsx` (created) — compare state + localStorage
  - `components/shams/providers/wishlist-provider.tsx` (created) — wishlist state + localStorage + server sync
  - `components/shams/providers/overlay-provider.tsx` (created) — overlay open/close state + CSS vars
  - `components/shams/providers/cart-provider.tsx` (created) — cart state, React Query, mutations, cross-tab sync
  - `components/shams/providers/interaction-provider.tsx` (rewritten) — slim composition root, 913→~230 lines
  - `components/shams/providers/index.ts` (updated) — re-exports all providers
  - `lib/hooks/use-cart.ts`, `use-wishlist.ts`, `use-compare.ts`, `use-overlays.ts`, `use-notices.ts`, `index.ts` (created) — convenience hook re-exports
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** useInteractions() backward-compatible composite hook; all consumers unchanged; provider nesting order: Notice→Compare→Wishlist→Overlay→Cart; localStorage keys preserved; BroadcastChannel preserved; all context API shapes preserved
- **Regressions:** none

## Step 4: Decompose Checkout Form
- **Status:** complete
- **Files changed:**
  - `components/shams/cart/checkout/use-checkout-submit.ts` (created) — checkout submit logic, validation, payment flow
  - `components/shams/cart/checkout/address-form.tsx` (created) — address fields, saved addresses, save-to-account
  - `components/shams/cart/checkout/shipping-select.tsx` (created) — delivery rate selection
  - `components/shams/cart/checkout/payment-select.tsx` (created) — payment method selection
  - `components/shams/cart/checkout/guest-checkout.tsx` (created) — inline login + registration
  - `components/shams/cart/checkout/checkout-form.tsx` (created) — slim orchestration
  - `components/shams/cart/checkout-form.tsx` (replaced) — re-export from new location
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** All checkout behavior preserved: address validation, phone validation, paymob gating, guest checkout, registration, inline login, saved addresses, shipping selection, payment selection, uncertain payment state, Paymob pixel, bank transfer details, error recovery
- **Regressions:** none

## Step 5: Slim Catch-All Route
- **Status:** complete
- **Files changed:**
  - `lib/seo/json-ld.ts` (created) — shared JSON-LD utilities (Product, BreadcrumbList, serializer)
  - `components/shams/content-pages/product-detail-page.tsx` (created) — PDP server component with JSON-LD
  - `components/shams/content-pages/live-branches-page.tsx` (created) — branches page with inline JSX
  - `components/shams/content-pages/live-brands-index-page.tsx` (created) — brands index
  - `components/shams/content-pages/live-categories-index-page.tsx` (created) — categories index with enrichment
  - `components/shams/content-pages/live-managed-page.tsx` (created) — CMS content page with fallback
  - `components/shams/content-pages/live-term-page.tsx` (created) — category/brand term page
  - `components/shams/content-pages/live-tag-page.tsx` (created) — tag page
  - `components/shams/content-pages/workflow-index-page.tsx` (created) — mock mode use cases index
  - `components/shams/content-pages/mock-catalog-route.tsx` (created) — mock mode catalog routing
  - `components/shams/content-pages/index.ts` (updated) — re-exports all new components
  - `app/[...slug]/page.tsx` (rewritten) — routing-only logic, 581→~280 lines
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** All URLs preserved; generateMetadata unchanged; generateStaticParams unchanged; dynamicParams preserved; JSON-LD structure preserved; all routing logic preserved for both WooCommerce and mock modes
- **Regressions:** none

## Step 6: Consolidate Product Types
- **Status:** complete
- **Files changed:**
  - `lib/commerce/index.ts` (updated) — added `formatPrice()` and `priceToMajor()` utilities that handle both Money and ProductPrice types
  - `lib/commerce/types.ts` (updated) — added deprecation comment to Money type explaining ProductPrice is canonical
  - `lib/seo/json-ld.ts` (updated) — uses `pricing` (ProductPrice) when available, falling back to `price` (Money), with proper minor→major unit conversion
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** Price formatting works for both mock data (Money, major units) and live data (ProductPrice, minor units); JSON-LD uses most accurate price source available
- **Regressions:** none
- **Deferred:** Full migration of mock data to ProductPrice format and tracking ID change (requires API contract changes to PaymentStatusView)

## Step 7: Expand UI Primitives
- **Status:** complete
- **Files changed:**
  - `components/ui/input.tsx` (created) — standard input with focus/invalid states
  - `components/ui/label.tsx` (created) — label with peer-disabled support
  - `components/ui/badge.tsx` (created) — badge with variants (default, secondary, destructive, outline, success, warning)
  - `components/ui/checkbox.tsx` (created) — uses @base-ui/react/checkbox with Check icon
  - `components/ui/select.tsx` (created) — native select wrapper with chevron icon
  - `components/shams/cart/checkout/address-form.tsx` (updated) — migrated governorate select to Select component
  - `components/shams/catalog/shop-feed.tsx` (updated) — migrated sort select to Select component
  - `components/shams/catalog/catalog-page.tsx` (updated) — migrated sort select to Select component
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** All select elements use consistent styling with validation states; chevron icon renders correctly; focus/invalid states work as expected
- **Regressions:** none

## Step 8: Extract Tracking Module
- **Status:** complete
- **Files changed:**
  - `lib/tracking/index.ts` (created) — barrel export
  - `lib/tracking/pixels.ts` (created) — Meta, GA4, TikTok, Google Ads initialization scripts
  - `lib/tracking/openai.ts` (created) — OpenAI pixel (from lib/openai-pixel.ts)
  - `lib/tracking/events.ts` (created) — trackViewContent, trackAddToCart, trackInitiateCheckout, trackPurchase
  - `lib/tracking.ts` (deleted) — replaced by lib/tracking/
  - `lib/openai-pixel.ts` (deleted) — replaced by lib/tracking/openai.ts
  - `app/layout.tsx` (updated) — import from @/lib/tracking
  - `components/shams/cart/checkout/checkout-form.tsx` (updated) — import from @/lib/tracking
  - `components/shams/live/live-product-detail.tsx` (updated) — import from @/lib/tracking
  - `components/shams/product/add-to-cart-button.tsx` (updated) — import from @/lib/tracking
  - `components/shams/shared/oppref-capture.tsx` (updated) — import from @/lib/tracking
  - `components/shams/content-pages/payment-result.tsx` (updated) — import from @/lib/tracking
- **Typecheck:** pass (after exporting GOOGLE_ADS_ID from pixels.ts)
- **Build:** pass
- **Functional checks:** All tracking events fire correctly; pixel scripts initialize; OpenAI oppref capture works; purchase tracking includes all pixels (Meta, GA4, TikTok, Google Ads, OpenAI)
- **Regressions:** none

## Step 9: Auth Provider Refactor
- **Status:** complete
- **Files changed:**
  - `components/shams/providers/auth-provider.tsx` (rewritten) — replaced all raw fetch() calls with commerceFetch(); error handling uses BrowserCommerceError
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** All auth flows work: login, register, logout, profile update, password change, address CRUD; error messages preserved; user state management unchanged
- **Regressions:** none

## Step 10: Cleanup & Verification
- **Status:** complete
- **Files changed:**
  - `docs/wp-snippets/` (created) — moved PHP snippets from lib/commerce/live/
  - `lib/commerce/live/conversion-api.php` (moved to docs/wp-snippets/)
  - `lib/commerce/live/woocomerce-event.php` (moved to docs/wp-snippets/)
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** No stale imports; no raw fetch() to WP/WC outside lib/commerce/live/client.ts and lib/wp-client.ts; woocommerce.ts still used by wp-client.ts, commerce/server.ts, live/client.ts (cannot remove); catalog-page.tsx not in lib/commerce/ (already in components/shams/catalog/)
- **Regressions:** none
- **Notes:** PHP snippets moved to docs/wp-snippets/ for clarity; woocommerce.ts retained because it's still used by multiple files

## Step 11: Documentation
- **Status:** complete
- **Files changed:**
  - `docs/ARCHITECTURE.md` (created) — full architecture documentation with diagrams, patterns, data flow, security, SEO, deployment
  - `docs/PROJECT_STRUCTURE.md` (created) — complete directory tree with file purposes, key files table, data flow examples, provider tree, environment variables
- **Typecheck:** pass
- **Build:** pass
- **Functional checks:** Documentation covers all major systems: commerce layer, payments, tracking, providers, routing, SEO
- **Regressions:** none
