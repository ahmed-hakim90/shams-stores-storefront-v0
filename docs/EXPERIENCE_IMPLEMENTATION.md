# Shams experience implementation

## Delivered

- Light editorial theme with Shams orange, readable secondary text, shared controls, card radii, motion timings, native scrollbar styling and safe-area spacing.
- Responsive store shell: mobile dock, tablet search/header, desktop navigation, measured sticky offsets, skip link and coordinated overlays. Checkout and order confirmation use a focused shell.
- Category and brand discovery now updates the current catalog context. URL updates preserve the surrounding page, filter group state and cache. SSR seeds only its matching query key; stale results cannot be purchased while replacement data is loading.
- Horizontal single-column catalog cards, native product rails with edge-aware controls, reduced-motion support, missing-image recovery and correctly sized touch targets.
- Homepage with editorial hero, weighted category discovery, independent bounded collections, brand exploration, offers and expert support. Collection configuration lives in `lib/commerce/experience.ts`.
- Product gallery supports swipe, thumbnails, keyboard navigation and a zoom dialog. Product information has section links, readable specifications and compact related-product cards.
- Comparison presents differences first, provides an optional differences-only view and fetches only comparable specifications for at most four selected products. Empty highlight labels become a named Highlights row.
- Guest saved lists report unavailable references. Cart and checkout share the new surfaces, show server totals and do not present uncalculated delivery as free delivery.
- Search has real category/brand discovery, clearable recent searches and stable input focus. Account, support, branch, error and not-found screens share the theme.
- `/dev/design-system` contains sample states and difficult product data in development only; production returns 404.

## Runtime correction found during production verification

The catch-all route previously returned an empty `generateStaticParams()` array with ISR while also reading `searchParams`. Production navigation could fail with `DYNAMIC_SERVER_USAGE`, although development and the build passed. The route now calls `connection()` before request-dependent rendering and no longer opts into catch-all ISR. Public catalog fetches retain their individual TTLs; cart/customer calls remain uncached. See [Next connection](https://nextjs.org/docs/app/api-reference/functions/connection).

## Verification and evidence

- `pnpm test`: 20 passing tests covering commerce normalization, catalog scope/query identity, comparison semantics and data-quality regressions.
- `pnpm build`: production compilation and TypeScript checks.
- `artifacts/qa/design/responsive.json`: initial 16-width inspection across seven page families.
- `artifacts/qa/design/production-responsive.json`: 240 checks across 15 production routes at all 16 widths; zero horizontal overflow and zero browser errors. The additional development-preview check returned 404 in production.
- `artifacts/qa/design/flows.json`: persistent filters, history, drawer draft/discard, hidden background bars, gallery and checkout shell.
- `artifacts/qa/design/shopping-flows.json`: isolated live guest cart, wishlist/comparison, quantity changes, stale query controls and exact scroll restoration.
- `artifacts/qa/design/final-details.json`: useful unpublished-bundle navigation, two comparison columns fitting the mobile drawer, and settled filter-drawer appearance.
- `artifacts/qa/design/engines.json`: Chromium, Firefox and WebKit rendering, filter interaction, reduced motion, focus restoration and 200%-zoom-equivalent viewport reflow.
- `artifacts/qa/design/final-*.png`: production screenshots. Other screenshots include filled cart/checkout and open overlays.

Test widths: 320, 360, 375, 390, 393, 412, 430, 480, 768, 834, 1024, 1280, 1366, 1440, 1536 and 1920.

## Backend gates and practical limits

The existing payment verification, bundle quote/add, pickup and customer authentication gates remain in effect. The UI does not fabricate collections, compatibility, reviews, stock or order status. Creator workflows require a verified tag/collection; unverified bundle purchase remains unavailable.

Tests used isolated guest sessions. No production orders or payments were submitted. WebKit and viewport emulation are automated coverage, not a claim of physical iPhone/Android keyboard testing or a field Core Web Vitals measurement. Check those on target devices before public rollout.

No new runtime dependency was added. Existing Next.js, React, TanStack Query and Base UI remain in use.
