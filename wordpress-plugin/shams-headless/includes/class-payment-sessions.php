<?php
/** Durable payment coordination for stateless storefront workers. No public routes. */
if (!defined('ABSPATH')) exit;
class Shams_Payment_Sessions {
    public static function register() {
        // WooCommerce API-key authentication applies to the wc/v3 namespace.
        register_rest_route('wc/v3', '/shams-headless/payment-sessions', [
            'methods' => 'POST', 'callback' => [__CLASS__, 'handle'],
            'permission_callback' => [__CLASS__, 'permission'],
        ]);
    }
    public static function permission() { return current_user_can('manage_woocommerce'); }
    public static function handle($request) {
        $key = (string) $request->get_param('key');
        $fingerprint = (string) $request->get_param('fingerprint');
        $action = (string) $request->get_param('action');
        if (!preg_match('/^[a-f0-9]{64}$/', $key) || !preg_match('/^[a-f0-9]{64}$/', $fingerprint))
            return new WP_Error('invalid_payment_session', 'Invalid payment session.', ['status' => 400]);
        $name = 'shams_payment_' . $key;
        if ($action === 'claim') {
            $token = wp_generate_uuid4();
            $entry = ['fingerprint' => $fingerprint, 'token' => $token, 'state' => 'running', 'created_at' => time()];
            // option_name has a UNIQUE index. No process-memory lock or lease expiry:
            // an uncertain external write must never become a fresh payment automatically.
            if (add_option($name, $entry, '', false)) return ['claimed' => true, 'token' => $token];
            $existing = get_option($name);
            if (!is_array($existing) || !hash_equals($existing['fingerprint'], $fingerprint))
                return new WP_Error('payment_session_changed', 'A payment already exists for this cart. Review it with Shams before changing the order.', ['status' => 409]);
            if ($existing['state'] === 'complete') return ['claimed' => false, 'order_id' => $existing['order_id']];
            return new WP_Error('payment_session_busy', 'Payment is being prepared or needs review. Please check the existing order before retrying.', ['status' => 409]);
        }
        $entry = get_option($name);
        $token = (string) $request->get_param('token');
        if (!is_array($entry) || !$token || !hash_equals($entry['token'], $token) || !hash_equals($entry['fingerprint'], $fingerprint))
            return new WP_Error('invalid_payment_claim', 'Invalid payment claim.', ['status' => 403]);
        if ($action === 'release') {
            // Only webhook mutexes can be released; checkout claims persist.
            if ($fingerprint !== hash('sha256', 'webhook')) return new WP_Error('invalid_release', 'Checkout claims cannot be released.', ['status' => 400]);
            delete_option($name);
            return ['released' => true];
        }
        $order_id = absint($request->get_param('order_id'));
        if ($action !== 'complete' || !$order_id || !wc_get_order($order_id))
            return new WP_Error('invalid_payment_order', 'Invalid payment order.', ['status' => 400]);
        if ($entry['state'] === 'complete' && $entry['order_id'] !== $order_id)
            return new WP_Error('payment_order_conflict', 'Payment order cannot be replaced.', ['status' => 409]);
        $entry['state'] = 'complete';
        $entry['order_id'] = $order_id;
        update_option($name, $entry, false);
        return ['completed' => true];
    }
}
