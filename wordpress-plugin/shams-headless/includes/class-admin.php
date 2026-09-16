<?php
if (!defined('ABSPATH')) exit;

class Shams_Admin {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_init', [$this, 'register_settings']);
    }

    public function add_menu() {
        add_menu_page(
            'Shams Headless',
            'Shams Headless',
            'manage_options',
            'shams-headless',
            [$this, 'render_page'],
            'dashicons-rest-api',
            59
        );
    }

    public function register_settings() {
        $settings = [
            'shams_headless_cors_origins' => ['type' => 'string', 'label' => 'Allowed CORS Origins', 'desc' => 'Comma-separated URLs (e.g. https://store.example.com,http://localhost:3000)'],
            'shams_headless_token_expiry_days' => ['type' => 'number', 'label' => 'Token Expiry (days)', 'desc' => 'How long login tokens remain valid'],
            'shams_headless_allow_registration' => ['type' => 'boolean', 'label' => 'Allow Registration', 'desc' => 'Let customers create new accounts'],
            'shams_headless_require_phone' => ['type' => 'boolean', 'label' => 'Require Phone', 'desc' => 'Make phone number mandatory on registration'],
            'shams_headless_enable_wishlist' => ['type' => 'boolean', 'label' => 'Enable Wishlist', 'desc' => 'Allow customers to save products'],
            'shams_headless_enable_reviews' => ['type' => 'boolean', 'label' => 'Enable Reviews', 'desc' => 'Allow customer reviews on products'],
        ];

        add_settings_section('shams_headless_general', 'General Settings', null, 'shams-headless');
        add_settings_section('shams_headless_api', 'API Settings', null, 'shams-headless');

        foreach ($settings as $key => $config) {
            register_setting('shams_headless', $key);
            add_settings_field(
                $key,
                $config['label'],
                [$this, 'render_field'],
                'shams-headless',
                strpos($key, 'cors') !== false || strpos($key, 'token') !== false ? 'shams_headless_api' : 'shams_headless_general',
                ['key' => $key, 'config' => $config]
            );
        }
    }

    public function render_field($args) {
        $key = $args['key'];
        $config = $args['config'];
        $value = get_option($key);

        if ($config['type'] === 'boolean') {
            printf(
                '<label><input type="checkbox" name="%s" value="1" %s /> %s</label>',
                esc_attr($key),
                checked($value, true, false),
                esc_html($config['desc'])
            );
        } elseif ($config['type'] === 'number') {
            printf(
                '<input type="number" name="%s" value="%s" min="1" max="90" class="small-text" /> <span class="description">%s</span>',
                esc_attr($key),
                esc_attr($value),
                esc_html($config['desc'])
            );
        } else {
            printf(
                '<input type="text" name="%s" value="%s" class="regular-text" /> <p class="description">%s</p>',
                esc_attr($key),
                esc_attr($value),
                esc_html($config['desc'])
            );
        }
    }

    public function render_page() {
        if (!current_user_can('manage_options')) return;

        $endpoints = [
            'POST /shams/v1/login' => 'Authenticate customer (email, phone, or username)',
            'POST /shams/v1/register' => 'Create new customer account',
            'GET /shams/v1/me' => 'Get current user (Bearer token required)',
            'DELETE /shams/v1/me' => 'Logout (clear token)',
            'PUT /shams/v1/profile' => 'Update customer profile (first_name, last_name, email, phone)',
            'POST /shams/v1/change-password' => 'Change password (current_password + new_password)',
            'POST /shams/v1/forgot-password' => 'Send password reset email',
            'POST /shams/v1/reset-password' => 'Reset password with key + login + new password',
            'GET /shams/v1/addresses' => 'List customer addresses',
            'POST /shams/v1/addresses' => 'Add new address',
            'PUT /shams/v1/addresses/{id}' => 'Update address',
            'DELETE /shams/v1/addresses/{id}' => 'Delete address',
            'GET /shams/v1/wishlist' => 'Get saved products',
            'POST /shams/v1/wishlist' => 'Add to wishlist',
            'DELETE /shams/v1/wishlist/{id}' => 'Remove from wishlist',
            'GET /shams/v1/orders' => 'List customer orders (paginated)',
            'GET /shams/v1/orders/{id}' => 'Get order details',
            'GET /shams/v1/track-order' => 'Guest order tracking (order_id + email)',
            'GET /shams/v1/products/{id}/meta' => 'Get product custom meta',
            'PUT /shams/v1/products/{id}/meta' => 'Update product meta (admin)',
            'GET /shams/v1/products/{id}/reviews' => 'Get product reviews (paginated)',
            'POST /shams/v1/products/{id}/reviews' => 'Submit product review (auth required)',
            'GET /shams/v1/health' => 'API health check',
        ];
        ?>
        <div class="wrap">
            <h1>Shams Stores — Headless Control</h1>
            <p>Full control panel for your headless storefront.</p>

            <div style="background:#fff;border:1px solid #ccd0d4;padding:20px;margin:20px 0;border-radius:4px;">
                <h2>API Endpoints (<?php echo count($endpoints); ?>)</h2>
                <table class="widefat striped">
                    <thead>
                        <tr>
                            <th style="width:50%">Endpoint</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($endpoints as $ep => $desc): ?>
                        <tr>
                            <td><code><?php echo esc_html($ep); ?></code></td>
                            <td><?php echo esc_html($desc); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>

            <form method="post" action="options.php">
                <?php
                settings_fields('shams_headless');
                do_settings_sections('shams-headless');
                submit_button('Save Settings');
                ?>
            </form>

            <div style="background:#f8f8f8;border:1px solid #ddd;padding:15px;margin-top:20px;border-radius:4px;">
                <h3>Quick Setup</h3>
                <ol>
                    <li>Set <strong>Allowed CORS Origins</strong> to your frontend URL (e.g. <code>http://localhost:3000</code>)</li>
                    <li>Copy the plugin folder to <code>wp-content/plugins/shams-headless/</code></li>
                    <li>Activate from WordPress Plugins page</li>
                    <li>Configure settings above</li>
                </ol>
                <p><strong>API Base:</strong> <code><?php echo esc_html(rest_url('shams/v1/')); ?></code></p>
            </div>
        </div>
        <?php
    }
}

