# Shams Stores — Claude Handoff

## Current state

- Next.js 16 App Router, React 19, Tailwind CSS 4, pnpm 12.
- Current branch: `v0/one-product-per-row`.
- The storefront uses shared components under `components/shams` and shared styles in `app/globals.css`.
- The current product-card direction is **list view with one product per row on every screen**.
- Desktop and mobile use the same `ProductCard`; do not create duplicate product-card implementations.

## Product-card rules

- `components/shams/product-card.tsx` is the source of truth.
- `components/shams/catalog-page.tsx` forces `view = 'list'`.
- Catalog results use one column: `grid-cols-1`.
- Mobile list styling is in the `.mobile-product-card-grid` and `.mobile-product-results` rules in `app/globals.css`.
- The image panel is intentionally wider than the content panel on mobile.
- Preserve the existing overlap fix, wishlist, compare, stock, pricing, and add-to-cart behavior.

## Mobile shell

- `components/shams/mobile-navigation.tsx` owns the global mobile header and bottom dock.
- The mobile header has no outer background/box; only interactive controls may have a surface.
- `CartDrawer` supports `showTrigger={false}` so the mobile header does not render a duplicate cart trigger.
- Do not mount a second cart drawer or duplicate menu/navigation logic.
- Keep safe-area support and bottom-nav content offsets intact.

## Important constraints

Do not change APIs, WooCommerce/data access, cart logic, bundle logic, wishlist/compare logic, authentication, or routing unless explicitly requested.

Prefer shared primitives and responsive CSS over page-specific copies. Keep product information and prices readable; do not apply heavy glass effects to product cards or checkout forms.

## Validation

Run from the project root:

```bash
pnpm build
git diff --check
```

Check at minimum 375px, 390px, 430px, 1024px, and 1440px. Verify the home page, catalog, product detail, bundles/offers, cart, menu, and cart drawer.

## Git

Use a feature branch for changes. Do not push directly to `main`. Commit with a concise imperative message after validation.
