<?php
/**
 * Plugin Name: Shams Stores Headless Control
 * Description: Full control panel for headless storefront — auth, customers, orders, products, settings
 * Version: 1.2.0
 * Author: Shams Stores
 * Text Domain: shams-headless
 * Requires PHP: 8.0
 * Requires at least: 5.8
 */

if (!defined('ABSPATH')) exit;

if (version_compare(PHP_VERSION, '8.0', '<')) {
    add_action('admin_notices', function () {
        echo '<div class="notice notice-error"><p>Shams Headless requires PHP 8.0 or higher. Current: ' . esc_html(PHP_VERSION) . '</p></div>';
    });
    return;
}

if (!defined('SHAMS_HEADLESS_VERSION')) {
    define('SHAMS_HEADLESS_VERSION', '1.2.0');
}
if (!defined('SHAMS_HEADLESS_PATH')) {
    define('SHAMS_HEADLESS_PATH', plugin_dir_path(__FILE__));
}
if (!defined('SHAMS_HEADLESS_URL')) {
    define('SHAMS_HEADLESS_URL', plugin_dir_url(__FILE__));
}

$includes = [
    'class-token.php',
    'class-payment-sessions.php',
    'class-auth.php',
    'class-customer.php',
    'class-products.php',
    'class-orders.php',
    'class-password-recovery.php',
    'class-track-order.php',
    'class-admin.php',
    'class-cors.php',
];

foreach ($includes as $file) {
    $path = SHAMS_HEADLESS_PATH . 'includes/' . $file;
    if (file_exists($path)) {
        require_once $path;
    }
}

class Shams_Headless {
    private static $instance = null;

    public static function instance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('init', [$this, 'load_textdomain']);
        add_action('rest_api_init', [$this, 'register_routes']);

        try {
            if (class_exists('Shams_Admin')) {
                new Shams_Admin();
            }
            if (class_exists('Shams_CORS')) {
                new Shams_CORS();
            }
        } catch (\Throwable $e) {
            error_log('Shams Headless init error: ' . $e->getMessage());
        }
    }

    public function load_textdomain() {
        load_plugin_textdomain('shams-headless', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function register_routes() {
        if (!class_exists('WooCommerce')) {
            return;
        }

        try {
            Shams_Payment_Sessions::register();
            Shams_Auth::register();
            Shams_Customer::register();
            Shams_Products::register();
            Shams_Orders::register();
            Shams_Password_Recovery::register();
            Shams_Track_Order::register();
        } catch (\Throwable $e) {
            error_log('Shams Headless route registration error: ' . $e->getMessage());
        }
    }
}

function shams_headless_activate() {
    $defaults = [
        'cors_origins' => home_url(),
        'token_expiry_days' => 7,
        'allow_registration' => true,
        'require_phone' => true,
        'enable_wishlist' => true,
        'enable_reviews' => true,
    ];
    foreach ($defaults as $key => $value) {
        if (get_option("shams_headless_{$key}") === false) {
            update_option("shams_headless_{$key}", $value);
        }
    }
}

register_activation_hook(__FILE__, 'shams_headless_activate');

register_deactivation_hook(__FILE__, function () {
    delete_option('shams_headless_cors_origins');
    delete_option('shams_headless_token_expiry_days');
    delete_option('shams_headless_allow_registration');
    delete_option('shams_headless_require_phone');
    delete_option('shams_headless_enable_wishlist');
    delete_option('shams_headless_enable_reviews');
});

try {
    Shams_Headless::instance();
} catch (\Throwable $e) {
    error_log('Shams Headless fatal init error: ' . $e->getMessage());
}
