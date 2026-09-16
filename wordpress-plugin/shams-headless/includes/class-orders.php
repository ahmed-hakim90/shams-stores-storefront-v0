<?php
if (!defined('ABSPATH')) exit;

class Shams_Orders {
    public static function register() {
        register_rest_route('shams/v1', '/orders', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'list_orders'],
            'permission_callback' => [__CLASS__, 'auth'],
        ]);

        register_rest_route('shams/v1', '/orders/(?P<id>\d+)', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_order'],
            'permission_callback' => [__CLASS__, 'auth'],
        ]);
    }

    public static function auth($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        if (!$uid) return new WP_Error('invalid_token', 'Invalid token', ['status' => 401]);
        return true;
    }

    public static function list_orders($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $user = get_user_by('id', $uid);

        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }

        $page = max(1, intval($request->get_param('page') ?? 1));
        $per_page = min(50, max(1, intval($request->get_param('per_page') ?? 10)));

        $orders = wc_get_orders([
            'customer' => $user->user_email,
            'limit' => $per_page,
            'page' => $page,
            'orderby' => 'date',
            'order' => 'DESC',
            'status' => array_keys(wc_get_order_statuses()),
        ]);

        $total_orders = wc_get_orders([
            'customer' => $user->user_email,
            'limit' => -1,
            'status' => array_keys(wc_get_order_statuses()),
            'return' => 'ids',
        ]);

        $items = [];
        foreach ($orders as $order) {
            $items[] = self::format_order_summary($order);
        }

        return [
            'orders' => $items,
            'page' => $page,
            'per_page' => $per_page,
            'total' => is_array($total_orders) ? count($total_orders) : 0,
        ];
    }

    public static function get_order($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $order_id = intval($request->get_param('id'));
        $order = wc_get_order($order_id);

        if (!$order) {
            return new WP_Error('not_found', 'Order not found', ['status' => 404]);
        }

        $user = get_user_by('id', $uid);
        if (!$user || $order->get_customer_id() !== $uid) {
            if ($user && $order->get_billing_email() !== $user->user_email) {
                return new WP_Error('forbidden', 'Access denied', ['status' => 403]);
            }
        }

        return ['order' => self::format_order_detail($order)];
    }

    private static function format_order_summary($order) {
        return [
            'id' => (string) $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'total' => $order->get_total(),
            'currency' => $order->get_currency(),
            'dateCreated' => $order->get_date_created() ? $order->get_date_created()->format('c') : null,
            'itemCount' => $order->get_item_count(),
        ];
    }

    private static function format_order_detail($order) {
        $items = [];
        foreach ($order->get_items() as $item) {
            $product = $item->get_product();
            $items[] = [
                'id' => (string) $item->get_id(),
                'productId' => (string) $item->get_product_id(),
                'name' => $item->get_name(),
                'quantity' => $item->get_quantity(),
                'total' => $item->get_total(),
                'image' => $product ? wp_get_attachment_url($product->get_image_id()) : '',
            ];
        }

        $shipping = $order->get_address('shipping');
        $billing = $order->get_address('billing');

        return [
            'id' => (string) $order->get_id(),
            'number' => $order->get_order_number(),
            'status' => $order->get_status(),
            'statusLabel' => wc_get_order_status_name($order->get_status()),
            'currency' => $order->get_currency(),
            'total' => $order->get_total(),
            'subtotal' => $order->get_subtotal(),
            'shippingTotal' => $order->get_shipping_total(),
            'taxTotal' => $order->get_total_tax(),
            'discountTotal' => $order->get_total_discount(),
            'paymentMethod' => $order->get_payment_method_title(),
            'dateCreated' => $order->get_date_created() ? $order->get_date_created()->format('c') : null,
            'dateCompleted' => $order->get_date_completed() ? $order->get_date_completed()->format('c') : null,
            'items' => $items,
            'billing' => [
                'firstName' => $billing['first_name'],
                'lastName' => $billing['last_name'],
                'phone' => $billing['phone'],
                'address1' => $billing['address_1'],
                'address2' => $billing['address_2'],
                'city' => $billing['city'],
                'state' => $billing['state'],
                'postcode' => $billing['postcode'],
            ],
            'shipping' => [
                'firstName' => $shipping['first_name'],
                'lastName' => $shipping['last_name'],
                'address1' => $shipping['address_1'],
                'address2' => $shipping['address_2'],
                'city' => $shipping['city'],
                'state' => $shipping['state'],
                'postcode' => $shipping['postcode'],
            ],
            'notes' => $order->get_customer_note(),
        ];
    }
}
