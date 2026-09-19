# Shams Headless 1.1.1

Dedicated customer wishlist routes prevent GET/POST registration collisions with Commerce UX:

- GET/POST `/wp-json/shams/v1/customer/wishlist`
- DELETE `/wp-json/shams/v1/customer/wishlist/{product_id}`

The existing Bearer authentication and `shams_wishlist` storage remain unchanged. Old aliases are registered only when Commerce UX is absent. No database migration, deletion, activation or production update was performed.

Install this version before deploying the accompanying storefront changes. Back up the currently installed plugin first. For rollback, restore the previous frontend and matching plugin together; wishlist data is retained.

Validation: all 10 PHP files pass syntax checks using PHP-WASM; route ownership fixtures pass both with and without Commerce UX. ZIP integrity checked.

SHA-256: `ff04f6615de6de1337c4eeb461c54d4af7be55f1e05ff2b9ca55237fa3caa9b4`
