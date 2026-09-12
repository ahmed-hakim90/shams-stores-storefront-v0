# Project Handoff

## Project

Shams Stores storefront. The project is a Next.js 16 App Router storefront with shared commerce UI in `components/shams`.

## Latest completed work

1. Global mobile Liquid Glass shell: mobile header, menu entry point, wishlist/cart actions, and floating bottom navigation.
2. Responsive fixes for desktop header, cart drawer, product cards, and mobile branch/store sections.
3. Mobile storefront styling across catalog, product, bundle, cart, account, wishlist, and curated pages.
4. Mobile product cards converted to horizontal list cards.
5. Catalog product results are now one card per row on every screen.
6. Mobile cart drawer trigger was de-duplicated with `CartDrawer showTrigger={false}`.
7. Mobile header outer background was removed so the header is transparent.

## Latest branch and commits

- Branch: `v0/one-product-per-row`
- Latest commit: `4e19c25 Force one product card per row on every screen`
- Previous relevant commits: `b926f9e`, `ed96ece`, `bae9d15`, `5cdda02`, `eb03ea0`

## Main files

- `components/shams/product-card.tsx` — shared product card.
- `components/shams/catalog-page.tsx` — catalog state and result layout.
- `components/shams/mobile-navigation.tsx` — global mobile shell.
- `components/shams/cart-drawer.tsx` — cart drawer and optional trigger.
- `components/shams/mobile-menu.tsx` — existing mobile menu logic and drawer styling.
- `app/globals.css` — responsive theme, mobile list-card layout, safe-area and fixed-surface variables.
- `components/shams/store-section.tsx` — home branch/store availability section.

## Current UX decisions

- List view means one product card per row at all viewport widths.
- Product cards remain readable and mostly clean; glass is reserved for controls, navigation, drawer surfaces, and floating elements.
- Mobile header is transparent without an outer bordered box.
- Desktop should remain visually stable unless a shared component requires a responsive adjustment.

## Known verification commands

```bash
pnpm build
git diff --check
```

Recommended browser checks:

- `/` at 430px
- `/c/cameras` at 375px, 390px, 430px, 1024px, 1440px
- product detail and bundle detail at mobile width
- open/close menu and cart drawer
- confirm no horizontal overflow and exactly one product card per row

## Rules for continuing

- Reuse existing components; do not duplicate headers, navigation, cart drawers, or product cards.
- Do not change business logic, API contracts, authentication, routing, or product data without explicit approval.
- Read a file before editing it and use the project package manager (`pnpm`).
- Validate desktop and mobile after responsive changes.
