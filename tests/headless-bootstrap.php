<?php
// Exercise the actual plugin entry point, not individual route files only.
define('ABSPATH', __DIR__);
$actions = []; $routes = []; $options = []; $activation = null;
class WooCommerce {}
class WP_Error {
    public $code;
    public function __construct($code, $message, $data = []) { $this->code = $code; }
}
function plugin_dir_path($file) { return dirname($file) . '/'; }
function plugin_dir_url($file) { return 'https://example.test/plugins/shams-headless/'; }
function add_action($hook, $callback, $priority = 10, $accepted = 1) { global $actions; $actions[$hook][] = $callback; }
function add_filter($hook, $callback, $priority = 10, $accepted = 1) {}
function register_activation_hook($file, $callback) { global $activation; $activation = $callback; }
function register_deactivation_hook($file, $callback) {}
function register_rest_route($namespace, $path, $args) { global $routes; $routes[$namespace . $path] = $args; }
function home_url() { return 'https://example.test'; }
function get_option($key, $default = false) { global $options; return $options[$key] ?? $default; }
function update_option($key, $value) { global $options; $options[$key] = $value; }
function expect($ok, $message) { if (!$ok) throw new Exception($message); }
require __DIR__ . '/../wordpress-plugin/shams-headless/shams-headless.php';
expect(is_callable($activation), 'Activation callback missing');
$options['shams_headless_token_expiry_days'] = 3;
$activation();
expect($options['shams_headless_token_expiry_days'] === 3, 'Activation overwrote an existing setting');
expect($options['shams_headless_require_phone'] === true, 'Phone default missing');
Shams_Headless::instance()->register_routes();
expect(isset($routes['wc/v3/shams-headless/payment-sessions']), 'Payment coordinator missing');
expect(isset($routes['shams/v1/customer/wishlist']), 'Customer wishlist missing');
$register = $routes['shams/v1/register']['callback'];
expect(is_callable($register), 'Registration callback is not callable');
expect($register === ['Shams_Auth', 'register_customer'], 'Registration points to route setup');
$options['shams_headless_allow_registration'] = false;
$result = call_user_func($register, null);
expect($result instanceof WP_Error && $result->code === 'registration_disabled', 'Registration handler did not execute');
echo "Headless bootstrap contracts passed\n";
