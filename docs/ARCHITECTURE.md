# Shams Stores — Architecture

Headless commerce storefront built with Next.js 16 (App Router) + WooCommerce.

## Core Principles

- **Server-first**: Use React Server Components unless interactivity requires client state
- **Type-safe**: All data flows through typed boundaries (WooCommerce → domain types → UI)
- **Single source of truth**: One client per external service, one provider per domain
- **No magic**: Explicit data fetching, no hidden caching, predictable error handling

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  App Router (app/)                                          │
│  - Server Components for SEO & performance                  │
│  - Client Components for interactivity                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Components (components/shams/)                             │
│  - Providers: Global state (cart, auth, wishlist, compare)  │
│  - UI: Composable, typed, accessible                        │
│  - Domain: cart, checkout, product, catalog, account        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Commerce Layer (lib/commerce/)                             │
│  - types.ts: Domain types (Product, Cart, Order, etc.)      │
│  - browser.ts: Client-side fetch helper with error handling │
│  - server.ts: Server-side fetch helper                      │
│  - live/: WooCommerce REST API client                       │
│    - client.ts: HTTP client with auth                       │
│    - catalog.ts: Product listing/detail                     │
│    - cart.ts: Cart operations                               │
│    - normalize.ts: WooCommerce → domain type mapping        │
│    - errors.ts: Standardized error responses                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  WordPress Client (lib/wp-client.ts)                        │
│  - wpFetch(): Low-level HTTP client for WP REST API         │
│  - wpAuth(): Auth cookie validation                         │
│  - Used by: auth routes, customer routes                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Payments (lib/payments/)                                   │
│  - paymob/: Paymob integration (cards, installments, COD)   │
│  - orders.ts: WooCommerce order creation & retrieval        │
│  - order-contract.ts: Ownership verification                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Tracking (lib/tracking/)                                   │
│  - pixels.ts: Meta, GA4, TikTok, Google Ads initialization  │
│  - openai.ts: OpenAI pixel                                  │
│  - events.ts: trackViewContent, trackAddToCart, etc.        │
└─────────────────────────────────────────────────────────────┘
```

## Key Patterns

### Provider Composition

Global state is split into focused providers composed in `app/layout.tsx`:

```
NoticeProvider → CompareProvider → WishlistProvider → OverlayProvider → CartProvider → AuthProvider
```

Each provider exposes a hook (`useCart()`, `useAuth()`, etc.) for consuming components.

### Data Fetching

**Server Components** (product pages, catalog):
```typescript
const product = await getProduct(slug)
```

**Client Components** (cart, account):
```typescript
const { data } = useQuery({
  queryKey: ['cart'],
  queryFn: () => commerceFetch('/api/commerce/cart')
})
```

### Error Handling

All API routes return standardized errors:
```typescript
{ error: string, code: string, requestId?: string }
```

Client-side, `commerceFetch()` throws `BrowserCommerceError` with the same shape.

### Price Handling

WooCommerce stores prices in **minor units** (piastres). The domain uses `ProductPrice`:
```typescript
interface ProductPrice {
  amount: number      // e.g., 15000 = 150.00 EGP
  minorUnit: number   // e.g., 2 for piastres
  currency: 'EGP'
}
```

Use `formatPrice(price)` or `priceToMajor(price)` for display. The legacy `Money` type (major units) is deprecated.

## File Organization

```
app/
  [...slug]/         Catch-all route (product, category, brand, CMS)
  api/
    auth/            Login, register, profile, password
    commerce/        Cart, checkout, products, search
    customer/        Addresses, orders, wishlist
    payments/        Paymob webhooks, order status
  account/           Authenticated account pages
  checkout/          Checkout flow
  order/success/     Payment result page

components/shams/
  providers/         Global state providers (cart, auth, wishlist, etc.)
  cart/              Cart drawer, checkout form
  product/           Product card, PDP, variant selector
  catalog/           Shop feed, filters, sorting
  live/              WooCommerce-connected components
  shared/            Reusable UI (BrandMark, Reveal, etc.)

lib/
  commerce/          Domain types, browser/server helpers, live/ client
  payments/          Paymob integration, order management
  tracking/          Pixel initialization, event tracking
  wp-client.ts       WordPress REST API client
```

## Performance

- **Static generation**: Product pages, category pages, CMS pages
- **Streaming**: Server Components stream HTML, client components hydrate
- **React Query**: Client-side caching with stale-while-revalidate
- **Image optimization**: Next.js Image component with WooCommerce CDN

## Security

- **Auth cookies**: httpOnly, secure, sameSite=strict
- **Order ownership**: Verified via cookie + order ID match
- **Payment webhooks**: Signature verification (Paymob)
- **No client secrets**: All API keys server-side only

## SEO

- **Metadata**: Dynamic per-page metadata (title, description, canonical)
- **JSON-LD**: Product, BreadcrumbList, Organization schemas
- **Sitemap**: Auto-generated from products + categories
- **Robots**: Configurable via /robots.txt route

## Deployment

- **Platform**: Vercel (auto-deploy on main merge)
- **Environment**: Production + Preview branches
- **WordPress**: Cloudways (separate from storefront)
- **Domain**: shams-stores.com (storefront) + WordPress backend
