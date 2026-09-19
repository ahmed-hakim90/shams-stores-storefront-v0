<?php
// Pure route contract: no WordPress database or external writes.
define('ABSPATH', __DIR__);
$routes = [];
function register_rest_route($namespace, $route, $args) { global $routes; $routes[$namespace . $route] = $args; }
if (($argv[1] ?? '') === 'commerce-ux') { class Shams_CUX_REST {} }
require __DIR__ . '/../wordpress-plugin/shams-headless/includes/class-customer.php';
Shams_Customer::register();
function expect($condition, $message) { if (!$condition) { fwrite(STDERR, $message . "\n"); exit(1); } }
expect(isset($routes['shams/v1/customer/wishlist']), 'Canonical wishlist missing');
expect(isset($routes['shams/v1/customer/wishlist/(?P<product_id>\d+)']), 'Canonical removal missing');
expect(isset($routes['shams/v1/wishlist']) === !class_exists('Shams_CUX_REST'), 'Legacy alias collides');
foreach ($routes['shams/v1/customer/wishlist'] as $route) expect($route['permission_callback'] === ['Shams_Customer', 'auth'], 'Authentication lost');
echo "Wishlist route ownership passed\n";
