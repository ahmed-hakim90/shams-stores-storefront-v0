# Shams specialist-commerce art direction

## Audit and reference comparison — 13 September 2026

Reference: user-supplied homepage concept (orange-led specialist photography storefront). This evolves the existing live storefront, not the mock homepage. Preserve the approved Shams script logo and centered mobile header.

1. **Home / first viewport:** current hero has a generic category image and broad copy. The reference makes one camera and its purchase path the focus. Replace it with a bounded, available-product spotlight: real name, image, price and product/brand links. Retain useful advice, without unverified warranty/installment claims.
2. **Discovery / merchandising:** current category tiles are very tall; brands are six text rectangles; adjacent feeds repeat. Use a compact asymmetric category mosaic with actual child names, product-led brand campaign, distinct deal cards and existing native product rails. Current New/Best Sellers sources are usable. Do not label popularity as Trending.
3. **Guided shopping:** current live homepage has no use-case or setup discovery. Verified nonempty tags include pro-video-vlogging, podcasting-equipment, pro-studio, mobile-photo-gear and wedding-event-photography-gear. Build tag-backed visual cards with one real product image each. Only explicit compatible/accessory relationships may be presented as a product setup; otherwise use a clearly labelled category planning guide.
4. **Trust / ending:** support is a single generic card and footer is sparse. Separate expert help from visiting Shams; link the real contact/branch flow, without invented branch counts, addresses, opening hours, social accounts or newsletter success. Give the footer a dark editorial finish and complete working navigation.
5. **Category / brand hubs:** current discovery consists of compact chips below a small banner. Add richer contextual category image tiles, real brand marks, optional scope-level category relationships, and a jump-to-products action. Keep the same ShopFeed instance and history/query/cache behavior; query changes must not recreate the hub.

Evidence: `artifacts/qa/merchandising/before-home-top.png` shows the existing first viewport. The initial full-height screenshot contains offscreen lazy images and is not evidence of missing image assets. Browser-in-app capture was unavailable (request-header policy error); local browser capture was used. These visual observations do not establish accessibility compliance.

## Reuse / new components

Reuse: ProductCard list/rail/compact-related, ProductRail, PriceDisplay, ProductImage, RecentlyViewed, ShamsLogo, ShopFeed and contextual filter callbacks, normalized products/terms/facets/getProduct, cart and overlay state.

New: MerchSectionHeading, ProductSpotlight, CategoryMosaic, BrandShowcase, UseCaseDiscovery, SetupDiscovery, BundleStory, BrandCampaign, ExpertTrust. Keep data selection in server-only merchandising services; components receive normalized models, not plugin payloads.

## Execution order and acceptance

| Step | Work | Data / limits | Validation |
|---|---|---|---|
| 1 | Server merchandising selectors, explicit tag map, setup confidence gate | Hero <=3 summaries; brand <=3; each use case 1; one detail for setup; published bundle <=1 | No full catalog; unknown tags hidden; generic related products cannot imply compatibility |
| 2 | Product hero, compact category mosaic, differentiated offers, brand showcase | Existing Store API queries and real category images; New/Best Sellers 8 each, Deals 4 | Practical actions and prices; optional blocks fail independently |
| 3 | Use cases, setup guide/verified accessories, conditional bundle story, secondary brand campaign | Existing tag/hierarchy/relationship sources; bundle purchase stays gated | No fabricated savings, pairings or recommendations; all links resolve |
| 4 | Hub discovery and complete dark footer / trust | Scope-only facets; category children and actual brand results | Header/discovery DOM persists while product results update; jump link works |
| 5 | Responsive / interaction QA | 320–1920, focus, reduced motion, image fallbacks | No horizontal page overflow; commerce tests, typecheck and build pass |

## Architectural decisions and deviations

- Independent Server Components under Suspense plus local error fallbacks preserve streaming and isolate failed sections. No new fetching dependency. [React Suspense](https://react.dev/reference/react/Suspense).
- Each section has its own constrained Store API query. Never fetch the whole catalog then filter it in the client. Sorting, prices and stock remain Woo-owned. [Woo Products API](https://developer.woocommerce.com/docs/apis/store-api/resources-endpoints/products/).
- Use actual catalog packshots/category media rather than imitating the concept's landscape/product composite or inventing campaign imagery. No automatic carousel, gratuitous animation, glass panels or false marketing badges.
- New and Best Sellers remain separate real rails; Trending is absent until a defensible source exists.
- Published bundles are visibility-gated. Current API discovery found one easy_product_bundle but it is absent from the visible product collection. Do not override catalog visibility to fill a design slot.
- Compatibility uses manual/cross-sell relationships only. Missing evidence renders a category planning guide, not a supposedly compatible kit. No combined price or add-entire-setup action is calculated in the browser.
- Existing mock flow remains available for development. Production requires COMMERCE_PROVIDER=woocommerce and configured server credentials; this work does not silently switch deployment mode.
