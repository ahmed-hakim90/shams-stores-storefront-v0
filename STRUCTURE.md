# Project Structure

## Components (`components/shams/`)

Organized by domain/feature. Each directory has a barrel export (`index.ts`) for clean imports.

| Directory | Purpose |
|-----------|---------|
| `account/` | Account dashboard, orders, addresses, profile, login, register |
| `bundles/` | Product bundle builder, detail, section |
| `cart/` | Cart drawer, checkout form, line options, page content |
| `catalog/` | Product listing, filters, navigation, shop feed |
| `content-pages/` | Static pages (about, FAQ, terms, etc.) and page-level components |
| `layout/` | Header, footer, mega menu, mobile navigation |
| `live/` | Live commerce components (catalog, hero, home, product detail) |
| `marketing/` | Hero, brand explorer, deal section, newsletter, trust section |
| `overlays/` | Search overlay, wishlist drawer, compare drawer |
| `patterns/` | Reusable UI patterns (accordion, tabs, etc.) |
| `payments/` | Payment result and checkout components |
| `product/` | Product card, detail, gallery, rail, features (add-to-cart, wishlist, etc.) |
| `providers/` | Auth provider, interaction provider |
| `shared/` | Logo, search bar, section heading, skeletons, cookie consent |

**Note**: UI primitives (Button, Skeleton) are in `components/ui/` at project root (shadcn pattern).

## Lib (`lib/`)

| Directory | Purpose |
|-----------|---------|
| `commerce/` | Commerce logic: data fetching, navigation, comparison, WooCommerce client |
| `commerce/live/` | Live API client, cart, catalog, merchandising, normalization |
| `payments/` | Payment provider abstraction |
| `payments/paymob/` | Paymob integration (client, config, HMAC, mapping, types) |
| `types/` | Barrel re-exporting all types from commerce and payments |
| `constants/` | App config, API endpoints, auth cookie name, rate limits |
| `services/` | Barrel re-exporting commerce and payment services |
| `hooks/` | Custom React hooks (ready for extraction) |
| `utils.ts` | Shared utility functions |
| `rate-limit.ts` | Rate limiting for API endpoints |

## Import Conventions

### Cross-folder imports (absolute paths)
```typescript
import { AuthProvider } from '@/components/shams/providers/auth-provider'
import { commerce } from '@/lib/commerce'
```

### Same-folder imports (relative paths)
```typescript
import { AccountOrders } from './account-orders'
```

### Barrel exports (preferred for external consumers)
```typescript
import { AccountDashboard, AccountOrders } from '@/components/shams/account'
import { ProductCard } from '@/components/shams/product'
```

## Adding New Components

1. Place in the appropriate domain directory
2. Export from the directory's `index.ts` barrel
3. Import from the barrel in consumers: `import { MyComponent } from '@/components/shams/domain'`

## Adding New Lib Modules

1. Place in the appropriate `lib/` subdirectory
2. If it's a service, add to `lib/services/index.ts`
3. If it's a type, add to `lib/types/index.ts`
4. If it's a constant, add to `lib/constants/config.ts`
