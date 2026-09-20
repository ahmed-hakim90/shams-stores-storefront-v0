# Shams Stores — Project Structure

## Directory Layout

```
shams-stores-storefront-v0/
├── app/                          # Next.js App Router
│   ├── [...slug]/                # Catch-all route (product, category, brand, CMS)
│   │   └── page.tsx              # Routes to appropriate content page component
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   │   ├── login/            # POST /api/auth/login
│   │   │   ├── register/         # POST /api/auth/register
│   │   │   ├── me/               # GET/DELETE /api/auth/me
│   │   │   ├── profile/          # PUT /api/auth/profile
│   │   │   ├── password/         # POST /api/auth/password
│   │   │   ├── forgot-password/  # POST /api/auth/forgot-password
│   │   │   └── reset-password/   # POST /api/auth/reset-password
│   │   ├── commerce/             # Commerce endpoints
│   │   │   ├── cart/             # GET/POST /api/commerce/cart
│   │   │   ├── checkout/         # POST /api/commerce/checkout
│   │   │   ├── products/         # GET /api/commerce/products
│   │   │   ├── search/           # GET /api/commerce/search
│   │   │   ├── taxonomy/         # GET /api/commerce/taxonomy
│   │   │   ├── facets/           # GET /api/commerce/facets
│   │   │   ├── order/            # GET /api/commerce/order
│   │   │   ├── availability/     # GET /api/commerce/availability
│   │   │   ├── comparison/       # GET /api/commerce/comparison
│   │   │   └── bank-transfer/    # GET /api/commerce/bank-transfer
│   │   ├── customer/             # Customer endpoints (authenticated)
│   │   │   ├── addresses/        # GET/POST /api/customer/addresses
│   │   │   ├── orders/           # GET /api/customer/orders
│   │   │   ├── wishlist/         # GET/POST /api/customer/wishlist
│   │   │   └── track-order/      # GET /api/customer/track-order
│   │   ├── payments/             # Payment endpoints
│   │   │   ├── intention/        # POST /api/payments/intention
│   │   │   ├── status/[orderId]/ # GET /api/payments/status/:orderId
│   │   │   └── paymob/webhook/   # POST /api/payments/paymob/webhook
│   │   └── openai/capi/          # POST /api/openai/capi (OpenAI conversion API)
│   ├── account/                  # Authenticated account pages
│   │   ├── profile/              # Account profile
│   │   ├── orders/               # Order history
│   │   ├── addresses/            # Saved addresses
│   │   ├── wishlist/             # Wishlist
│   │   └── [id]/                 # Order detail
│   ├── checkout/                 # Checkout page
│   ├── cart/                     # Cart page
│   ├── order/success/            # Payment result page
│   ├── shop/                     # Shop page
│   ├── search/                   # Search page
│   ├── compare/                  # Compare page
│   ├── bundles/[slug]/           # Bundle detail page
│   ├── c/[slug]/                 # Category page (redirect to catch-all)
│   ├── b/[slug]/                 # Brand page (redirect to catch-all)
│   ├── p/[slug]/                 # Product page (redirect to catch-all)
│   ├── layout.tsx                # Root layout (providers, fonts, metadata)
│   ├── globals.css               # Global styles
│   ├── sitemap.xml/route.ts      # Sitemap generation
│   └── robots.txt/route.ts       # Robots.txt generation
│
├── components/
│   ├── shams/                    # Shams-specific components
│   │   ├── providers/            # Global state providers
│   │   │   ├── interaction-provider.tsx  # Composition root
│   │   │   ├── cart-provider.tsx         # Cart state & mutations
│   │   │   ├── wishlist-provider.tsx     # Wishlist state
│   │   │   ├── compare-provider.tsx      # Compare state
│   │   │   ├── overlay-provider.tsx      # Overlay state
│   │   │   ├── notice-provider.tsx       # Toast notifications
│   │   │   └── auth-provider.tsx         # Auth state
│   │   ├── cart/                 # Cart components
│   │   │   ├── cart-drawer.tsx           # Slide-out cart
│   │   │   ├── cart-page-content.tsx     # Cart page
│   │   │   ├── cart-line-item.tsx        # Cart line item
│   │   │   └── checkout/                 # Checkout sub-components
│   │   │       ├── checkout-form.tsx     # Checkout orchestration
│   │   │       ├── address-form.tsx      # Address fields
│   │   │       ├── shipping-select.tsx   # Shipping method
│   │   │       ├── payment-select.tsx    # Payment method
│   │   │       ├── guest-checkout.tsx    # Guest form
│   │   │       ├── order-summary.tsx     # Order summary
│   │   │       └── use-checkout-submit.ts # Checkout logic
│   │   ├── product/              # Product components
│   │   │   ├── product-card.tsx          # Product card
│   │   │   ├── price-display.tsx         # Price display
│   │   │   ├── add-to-cart-button.tsx    # Add to cart
│   │   │   ├── variant-selector.tsx      # Variant selection
│   │   │   └── quantity-selector.tsx     # Quantity input
│   │   ├── catalog/              # Catalog components
│   │   │   ├── shop-feed.tsx           # Product listing
│   │   │   ├── catalog-page.tsx        # Catalog page
│   │   │   ├── catalog-filters.tsx     # Filter sidebar
│   │   │   └── mobile-listing-header.tsx # Mobile header
│   │   ├── live/                 # WooCommerce-connected components
│   │   │   ├── live-product-detail.tsx   # PDP
│   │   │   ├── live-footer.tsx          # Footer
│   │   │   └── live-header.tsx          # Header
│   │   ├── content-pages/        # Content page components
│   │   │   ├── product-detail-page.tsx   # PDP server component
│   │   │   ├── category-page.tsx         # Category page
│   │   │   ├── live-branches-page.tsx    # Branches page
│   │   │   ├── live-brands-index-page.tsx # Brands index
│   │   │   ├── live-categories-index-page.tsx # Categories index
│   │   │   ├── live-managed-page.tsx     # CMS page
│   │   │   ├── live-term-page.tsx        # Term page
│   │   │   ├── live-tag-page.tsx         # Tag page
│   │   │   ├── workflow-index-page.tsx   # Use cases index
│   │   │   ├── mock-catalog-route.tsx    # Mock catalog routing
│   │   │   └── payment-result.tsx        # Payment result
│   │   ├── shared/               # Shared components
│   │   │   ├── index.ts                 # Barrel export
│   │   │   ├── BrandMark.tsx            # Brand mark
│   │   │   ├── Reveal.tsx               # Scroll reveal
│   │   │   ├── oppref-capture.tsx       # OpenAI oppref capture
│   │   │   └── safe-rich-text.tsx       # Rich text renderer
│   │   ├── marketing/            # Marketing components
│   │   │   └── CatalogDiscovery.tsx     # Discovery section
│   │   └── payments/             # Payment components
│   │       └── use-checkout-config.ts   # Checkout config hook
│   └── ui/                       # UI primitives
│       ├── button.tsx                   # Button
│       ├── input.tsx                    # Input
│       ├── label.tsx                    # Label
│       ├── badge.tsx                    # Badge
│       ├── checkbox.tsx                 # Checkbox
│       ├── select.tsx                   # Select
│       └── skeleton.tsx                 # Skeleton loader
│
├── lib/
│   ├── commerce/                 # Commerce layer
│   │   ├── types.ts                     # Domain types
│   │   ├── index.ts                     # Barrel export + utilities
│   │   ├── browser.ts                   # Client-side fetch helper
│   │   ├── server.ts                    # Server-side fetch helper
│   │   ├── woocommerce.ts               # WooCommerce config
│   │   ├── data.ts                      # Mock data
│   │   ├── experience.ts               # Catalog experience
│   │   └── live/                        # WooCommerce REST API client
│   │       ├── client.ts                # HTTP client
│   │       ├── catalog.ts               # Product listing/detail
│   │       ├── cart.ts                  # Cart operations
│   │       ├── normalize.ts             # WC → domain mapping
│   │       ├── errors.ts                # Error handling
│   │       └── base-script.html         # WC base script
│   ├── payments/                 # Payment layer
│   │   ├── paymob/                      # Paymob integration
│   │   │   ├── provider.ts              # Paymob provider
│   │   │   └── types.ts                 # Paymob types
│   │   ├── orders.ts                    # Order management
│   │   └── order-contract.ts            # Ownership verification
│   ├── tracking/                 # Tracking layer
│   │   ├── index.ts                     # Barrel export
│   │   ├── pixels.ts                    # Pixel initialization
│   │   ├── openai.ts                    # OpenAI pixel
│   │   └── events.ts                    # Event tracking
│   ├── wp-client.ts              # WordPress REST API client
│   ├── seo/                      # SEO utilities
│   │   └── json-ld.ts                   # JSON-LD helpers
│   └── utils.ts                  # General utilities
│
├── docs/                         # Documentation
│   ├── ARCHITECTURE.md                  # Architecture overview
│   ├── PROJECT_STRUCTURE.md             # This file
│   ├── REFACTOR_PROGRESS.md             # Refactor progress
│   ├── START-HERE.md                    # Getting started
│   ├── QODER-START.md                   # Qoder onboarding
│   ├── QODER-HANDOFF-2026-09-19.md      # Handoff doc
│   └── wp-snippets/                     # WordPress PHP snippets
│       ├── conversion-api.php
│       └── woocomerce-event.php
│
├── public/                       # Static assets
│   ├── logo.svg
│   └── ...
│
├── scripts/                      # Build scripts
│   └── check-commerce.mjs
│
├── tests/                        # Test files
│   └── woocommerce.test.mjs
│
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── components.json               # shadcn/ui config
└── ...
```

## Key Files

| File | Purpose |
|------|---------|
| `app/[...slug]/page.tsx` | Catch-all route — routes to product, category, brand, CMS pages |
| `app/layout.tsx` | Root layout — providers, fonts, metadata, pixel scripts |
| `components/shams/providers/interaction-provider.tsx` | Provider composition root |
| `components/shams/cart/checkout/checkout-form.tsx` | Checkout orchestration |
| `lib/commerce/live/client.ts` | Centralized WooCommerce HTTP client |
| `lib/commerce/live/normalize.ts` | WooCommerce → domain type mapping |
| `lib/wp-client.ts` | WordPress REST API client (auth + customer routes) |
| `lib/commerce/types.ts` | Domain types (Product, Cart, Order, etc.) |
| `lib/tracking/index.ts` | Tracking barrel export |

## Data Flow

### Product Page (Server Component)
```
URL → app/[...slug]/page.tsx
  → getProduct(slug) [lib/commerce/live/catalog.ts]
    → wc().get(`/products/${slug}`) [lib/commerce/live/client.ts]
      → WooCommerce REST API
    → mapProductDetail(response) [lib/commerce/live/normalize.ts]
  → ProductDetailPage component
    → LiveProductDetail [components/shams/live/live-product-detail.tsx]
```

### Cart (Client Component)
```
User clicks "Add to Cart"
  → AddToCartButton [components/shams/product/add-to-cart-button.tsx]
    → useInteractions().addToCart() [components/shams/providers/cart-provider.tsx]
      → commerceFetch('/api/commerce/cart', { method: 'POST' })
        → app/api/commerce/cart/route.ts
          → addToCart() [lib/commerce/live/cart.ts]
            → wc().post('/cart', { line_items }) [lib/commerce/live/client.ts]
              → WooCommerce Store API
```

### Checkout
```
User submits checkout form
  → CheckoutForm [components/shams/cart/checkout/checkout-form.tsx]
    → useCheckoutSubmit() [components/shams/cart/checkout/use-checkout-submit.ts]
      → commerceFetch('/api/commerce/checkout', { method: 'POST' })
        → app/api/commerce/checkout/route.ts
          → createOrder() [lib/commerce/live/cart.ts]
            → WooCommerce Store API
      → If payment required:
        → commerceFetch('/api/payments/intention', { method: 'POST' })
          → app/api/payments/intention/route.ts
            → createPaymobOrder() [lib/payments/paymob/provider.ts]
              → Paymob API
```

## Provider Tree

```
<NoticeProvider>
  <CompareProvider>
    <WishlistProvider>
      <OverlayProvider>
        <CartProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </CartProvider>
      </OverlayProvider>
    </WishlistProvider>
  </CompareProvider>
</NoticeProvider>
```

## Environment Variables

```env
# WooCommerce
WOOCOMMERCE_API_ROOT=https://shams-stores.com/wp-json
WOOCOMMERCE_CONSUMER_KEY=ck_...
WOOCOMMERCE_CONSUMER_SECRET=cs_...

# WordPress (for auth/customer routes)
WP_API_ROOT=https://shams-stores.com/wp-json
WP_AUTH_COOKIE_KEY=shams-auth-token

# Paymob
PAYMOB_API_KEY=...
PAYMOB_PUBLIC_KEY=...
PAYMOB_IFRAME_ID=...

# Tracking
NEXT_PUBLIC_META_PIXEL_ID=...
NEXT_PUBLIC_GA_ID=...
NEXT_PUBLIC_TIKTOK_PIXEL_ID=...
NEXT_PUBLIC_GOOGLE_ADS_ID=...

# App
NEXT_PUBLIC_APP_URL=https://www.shams-stores.com
```
