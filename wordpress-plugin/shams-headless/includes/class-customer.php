<?php
if (!defined('ABSPATH')) exit;

class Shams_Customer {
    public static function register() {
        register_rest_route('shams/v1', '/addresses', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'get_addresses'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
            [
                'methods' => 'POST',
                'callback' => [__CLASS__, 'add_address'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
        ]);

        register_rest_route('shams/v1', '/addresses/(?P<id>[\w-]+)', [
            [
                'methods' => 'PUT',
                'callback' => [__CLASS__, 'update_address'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [__CLASS__, 'delete_address'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
        ]);

        register_rest_route('shams/v1', '/wishlist', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'get_wishlist'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
            [
                'methods' => 'POST',
                'callback' => [__CLASS__, 'add_to_wishlist'],
                'permission_callback' => [__CLASS__, 'auth'],
            ],
        ]);

        register_rest_route('shams/v1', '/wishlist/(?P<product_id>\d+)', [
            'methods' => 'DELETE',
            'callback' => [__CLASS__, 'remove_from_wishlist'],
            'permission_callback' => [__CLASS__, 'auth'],
        ]);
    }

    public static function auth($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        if (!$uid) return new WP_Error('invalid_token', 'Invalid token', ['status' => 401]);
        return true;
    }

    public static function get_addresses($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $user = get_user_by('id', $uid);
        if (!$user) return new WP_Error('not_found', 'Not found', ['status' => 404]);

        $first = get_user_meta($uid, 'first_name', true) ?: $user->first_name;
        $last = get_user_meta($uid, 'last_name', true) ?: $user->last_name;
        $phone = get_user_meta($uid, 'billing_phone', true) ?: '';

        $addresses = [];
        $billing = [
            'id' => 'billing',
            'label' => 'Billing',
            'firstName' => get_user_meta($uid, 'billing_first_name', true) ?: $first,
            'lastName' => get_user_meta($uid, 'billing_last_name', true) ?: $last,
            'phone' => get_user_meta($uid, 'billing_phone', true) ?: $phone,
            'governorate' => get_user_meta($uid, 'billing_state', true) ?: '',
            'city' => get_user_meta($uid, 'billing_city', true) ?: '',
            'address1' => get_user_meta($uid, 'billing_address_1', true) ?: '',
            'address2' => get_user_meta($uid, 'billing_address_2', true) ?: '',
            'postcode' => get_user_meta($uid, 'billing_postcode', true) ?: '',
            'isDefault' => true,
        ];
        $addresses[] = $billing;

        $custom = get_user_meta($uid, 'shams_addresses', true);
        if (is_array($custom)) {
            foreach ($custom as $addr) {
                $addresses[] = $addr;
            }
        }

        return ['addresses' => $addresses];
    }

    public static function add_address($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $params = $request->get_json_params();

        $address = [
            'id' => 'addr-' . time(),
            'label' => sanitize_text_field($params['label'] ?? 'Address'),
            'firstName' => sanitize_text_field($params['firstName'] ?? ''),
            'lastName' => sanitize_text_field($params['lastName'] ?? ''),
            'phone' => sanitize_text_field($params['phone'] ?? ''),
            'governorate' => sanitize_text_field($params['governorate'] ?? ''),
            'city' => sanitize_text_field($params['city'] ?? ''),
            'address1' => sanitize_text_field($params['address1'] ?? ''),
            'address2' => sanitize_text_field($params['address2'] ?? ''),
            'postcode' => sanitize_text_field($params['postcode'] ?? ''),
            'isDefault' => !empty($params['isDefault']),
        ];

        $existing = get_user_meta($uid, 'shams_addresses', true) ?: [];
        if (!is_array($existing)) $existing = [];
        $existing[] = $address;
        update_user_meta($uid, 'shams_addresses', $existing);

        return ['success' => true, 'address' => $address];
    }

    public static function update_address($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $id = $request->get_param('id');
        $params = $request->get_json_params();

        if ($id === 'billing') {
            $fields = [
                'billing_first_name' => 'firstName',
                'billing_last_name' => 'lastName',
                'billing_phone' => 'phone',
                'billing_state' => 'governorate',
                'billing_city' => 'city',
                'billing_address_1' => 'address1',
                'billing_address_2' => 'address2',
                'billing_postcode' => 'postcode',
            ];
            foreach ($fields as $meta_key => $param_key) {
                if (isset($params[$param_key])) {
                    update_user_meta($uid, $meta_key, sanitize_text_field($params[$param_key]));
                }
            }
            return ['success' => true];
        }

        $existing = get_user_meta($uid, 'shams_addresses', true) ?: [];
        if (!is_array($existing)) $existing = [];

        $found = false;
        foreach ($existing as &$addr) {
            if ($addr['id'] === $id) {
                foreach ($params as $key => $value) {
                    if (in_array($key, ['label', 'firstName', 'lastName', 'phone', 'governorate', 'city', 'address1', 'address2', 'postcode', 'isDefault'])) {
                        $addr[$key] = is_bool($value) ? $value : sanitize_text_field($value);
                    }
                }
                $found = true;
                break;
            }
        }

        if (!$found) {
            return new WP_Error('not_found', 'Address not found', ['status' => 404]);
        }

        update_user_meta($uid, 'shams_addresses', $existing);
        return ['success' => true];
    }

    public static function delete_address($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $id = $request->get_param('id');

        if ($id === 'billing') {
            return new WP_Error('cannot_delete', 'Cannot delete default billing address', ['status' => 400]);
        }

        $existing = get_user_meta($uid, 'shams_addresses', true) ?: [];
        if (!is_array($existing)) $existing = [];

        $filtered = array_values(array_filter($existing, fn($a) => $a['id'] !== $id));
        update_user_meta($uid, 'shams_addresses', $filtered);

        return ['success' => true];
    }

    public static function get_wishlist($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $ids = get_user_meta($uid, 'shams_wishlist', true) ?: [];
        if (!is_array($ids)) $ids = [];
        return ['products' => array_map('intval', $ids)];
    }

    public static function add_to_wishlist($request) {
        if (!get_option('shams_headless_enable_wishlist', true)) {
            return new WP_Error('disabled', 'Wishlist is disabled', ['status' => 403]);
        }

        $uid = Shams_Token::get_user_id_from_request($request);
        $product_id = intval($request->get_json_params()['product_id'] ?? 0);

        if (!$product_id || !get_post($product_id)) {
            return new WP_Error('invalid_product', 'Product not found', ['status' => 404]);
        }

        $ids = get_user_meta($uid, 'shams_wishlist', true) ?: [];
        if (!is_array($ids)) $ids = [];

        if (!in_array($product_id, $ids)) {
            $ids[] = $product_id;
            update_user_meta($uid, 'shams_wishlist', $ids);
        }

        return ['success' => true, 'products' => array_map('intval', $ids)];
    }

    public static function remove_from_wishlist($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $product_id = intval($request->get_param('product_id'));

        $ids = get_user_meta($uid, 'shams_wishlist', true) ?: [];
        if (!is_array($ids)) $ids = [];

        $ids = array_values(array_filter($ids, fn($id) => $id !== $product_id));
        update_user_meta($uid, 'shams_wishlist', $ids);

        return ['success' => true, 'products' => array_map('intval', $ids)];
    }
}
