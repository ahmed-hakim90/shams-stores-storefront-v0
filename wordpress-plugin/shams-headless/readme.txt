=== Shams Stores Headless Control ===
Contributors: shamsstores
Tags: woocommerce, headless, rest-api, auth, cors
Requires at least: 5.8
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 1.0.1
License: GPLv2 or later

Full control panel for headless WooCommerce storefront — auth, customers, orders, products, CORS, and admin settings.

== Description ==

Shams Headless Control connects your WordPress + WooCommerce backend to a headless frontend (Next.js, React, etc.) through a complete REST API.

= Features =

* **Authentication** — Login, register, session management with HMAC-SHA256 tokens (no JWT plugin needed)
* **Customer Management** — Addresses CRUD, wishlist, profile updates, password changes
* **Order History** — List and view customer orders with full details
* **Product Meta** — Read and update custom product fields (installment, official badge, video, size guide)
* **CORS Control** — Manage allowed origins from WordPress admin
* **Admin Panel** — Full settings page with API reference
* **Health Check** — Monitor plugin and WooCommerce status

= API Endpoints =

**Auth:**
* `POST /wp-json/shams/v1/login` — Authenticate customer
* `POST /wp-json/shams/v1/register` — Create new account
* `GET /wp-json/shams/v1/me` — Get current user
* `DELETE /wp-json/shams/v1/me` — Logout
* `PUT /wp-json/shams/v1/profile` — Update profile
* `POST /wp-json/shams/v1/change-password` — Change password

**Addresses:**
* `GET /wp-json/shams/v1/addresses` — List addresses
* `POST /wp-json/shams/v1/addresses` — Add address
* `PUT /wp-json/shams/v1/addresses/{id}` — Update address
* `DELETE /wp-json/shams/v1/addresses/{id}` — Delete address

**Wishlist:**
* `GET /wp-json/shams/v1/wishlist` — Get saved products
* `POST /wp-json/shams/v1/wishlist` — Add to wishlist
* `DELETE /wp-json/shams/v1/wishlist/{id}` — Remove from wishlist

**Orders:**
* `GET /wp-json/shams/v1/orders` — List customer orders
* `GET /wp-json/shams/v1/orders/{id}` — Get order details

**Products:**
* `GET /wp-json/shams/v1/products/{id}/meta` — Get product meta
* `PUT /wp-json/shams/v1/products/{id}/meta` — Update product meta (admin)

**System:**
* `GET /wp-json/shams/v1/health` — API health check

= Requirements =

* WordPress 5.8+
* WooCommerce 5.0+
* PHP 7.4+

== Installation ==

1. Upload the `shams-headless` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Shams Headless** in the admin sidebar
4. Set your frontend URL in **Allowed CORS Origins**
5. Configure other settings as needed

== Changelog ==

= 1.0.1 =
* Fixed PHP 8.0+ nullsafe operator syntax for PHP 7.4 compatibility
* Moved activation hook to top-level function
* Added WooCommerce dependency check
* Added PHP version guard

= 1.0.0 =
* Initial release
* 18 REST API endpoints
* HMAC-SHA256 token authentication
* Customer addresses and wishlist
* Order history
* Product meta management
* CORS control
* Admin settings panel
