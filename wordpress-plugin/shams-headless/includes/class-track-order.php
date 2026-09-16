<?php
if (!defined('ABSPATH')) exit;

class Shams_Track_Order {
    public static function register() {
        register_rest_route('shams/v1', '/track-order', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'track_order'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function track_order($request) {
        $order_id = intval($request->get_param('order_id') ?? 0);
        $email = sanitize_email($request->get_param('email') ?? '');

        if (!$order_id || empty($email)) {
            return new WP_Error('missing_params', 'Order ID and email are required', ['status' => 400]);
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);
        }

        if (strcasecmp($order->get_billing_email(), $email) !== 0) {
            return new WP_Error('forbidden', 'Order not found', ['status' => 404]);
        }

        $items = [];
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            $items[] = [
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total(),
                'image' => $product ? wp_get_attachment_url($product->get_image_id()) : '',
            ];
        }

        return [
            'order' => [
                'id' => (string) $order->get_id(),
                'number' => $order->get_order_number(),
                'status' => $order->get_status(),
                'statusLabel' => wc_get_order_status_name($order->get_status()),
                'total' => $order->get_total(),
                'currency' => $order->get_currency(),
                'dateCreated' => $order->get_date_created() ? $order->get_date_created()->format('c') : null,
                'items' => $items,
                'paymentMethod' => $order->get_payment_method_title(),
            ],
        ];
    }
}
