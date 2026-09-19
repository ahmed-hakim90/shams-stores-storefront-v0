<?php
if (!defined('ABSPATH')) exit;

class Shams_Auth {
    public static function register() {
        register_rest_route('shams/v1', '/login', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'login'],
            'permission_callback' => '__return_true',
            'args' => [
                'username' => ['required' => true, 'type' => 'string'],
                'password' => ['required' => true, 'type' => 'string'],
            ],
        ]);

        register_rest_route('shams/v1', '/register', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'register_customer'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('shams/v1', '/me', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'me'],
                'permission_callback' => [__CLASS__, 'require_auth'],
            ],
            [
                'methods' => 'DELETE',
                'callback' => [__CLASS__, 'logout'],
                'permission_callback' => '__return_true',
            ],
        ]);

        register_rest_route('shams/v1', '/profile', [
            'methods' => 'PUT',
            'callback' => [__CLASS__, 'update_profile'],
            'permission_callback' => [__CLASS__, 'require_auth'],
        ]);

        register_rest_route('shams/v1', '/change-password', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'change_password'],
            'permission_callback' => [__CLASS__, 'require_auth'],
        ]);
    }

    public static function require_auth($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        if (!$uid) {
            return new WP_Error('invalid_token', 'Invalid or expired token', ['status' => 401]);
        }
        return true;
    }

    public static function login($request) {
        $username = sanitize_text_field($request->get_param('username'));
        $password = $request->get_param('password');

        $user = get_user_by('email', $username);
        if (!$user) {
            $user = get_user_by('login', $username);
        }
        if (!$user && is_numeric($username)) {
            $user = self::find_user_by_phone($username);
        }

        if (!$user || !wp_check_password($password, $user->user_pass, $user->ID)) {
            return new WP_Error('invalid_credentials', 'Invalid email/phone or password', ['status' => 401]);
        }

        $token = Shams_Token::generate($user->ID);

        return [
            'success' => true,
            'token' => $token,
            'user' => self::format_user($user),
        ];
    }

    private static function find_user_by_phone($phone) {
        $clean = preg_replace('/[^0-9]/', '', $phone);
        $users = get_users([
            'meta_key' => 'billing_phone',
            'meta_value' => $clean,
            'number' => 1,
            'fields' => 'all',
        ]);
        if (!empty($users)) {
            return $users[0];
        }
        $users = get_users([
            'meta_key' => 'phone',
            'meta_value' => $clean,
            'number' => 1,
            'fields' => 'all',
        ]);
        return $users[0] ?? null;
    }

    public static function register_customer($request) {
        if (!get_option('shams_headless_allow_registration', true)) {
            return new WP_Error('registration_disabled', 'Registration is currently disabled', ['status' => 403]);
        }

        $params = $request->get_json_params();
        $name = sanitize_text_field($params['name'] ?? '');
        $email = sanitize_email($params['email'] ?? '');
        $phone = sanitize_text_field($params['phone'] ?? '');
        $password = $params['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            return new WP_Error('missing_fields', 'Name, email, and password are required', ['status' => 400]);
        }

        if (get_option('shams_headless_require_phone', true) && empty($phone)) {
            return new WP_Error('missing_phone', 'Phone number is required', ['status' => 400]);
        }

        if (strlen($password) < 6) {
            return new WP_Error('weak_password', 'Password must be at least 6 characters', ['status' => 400]);
        }

        if (email_exists($email)) {
            return new WP_Error('email_exists', 'This email is already registered', ['status' => 409]);
        }

        $parts = explode(' ', $name, 2);
        $first = $parts[0];
        $last = $parts[1] ?? $first;

        $user_id = wp_create_user($email, $password, $email);

        if (is_wp_error($user_id)) {
            return new WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
        }

        wp_update_user([
            'ID' => $user_id,
            'first_name' => $first,
            'last_name' => $last,
            'display_name' => $name,
        ]);

        if (!empty($phone)) {
            update_user_meta($user_id, 'billing_phone', $phone);
            update_user_meta($user_id, 'phone', $phone);
        }

        $token = Shams_Token::generate($user_id);
        $user = get_user_by('id', $user_id);

        return new WP_REST_Response([
            'success' => true,
            'token' => $token,
            'user' => self::format_user($user),
        ], 201);
    }

    public static function me($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $user = get_user_by('id', $uid);
        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }
        return ['user' => self::format_user($user)];
    }

    public static function logout($request) {
        return ['success' => true];
    }

    public static function update_profile($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $params = $request->get_json_params();
        $user = get_user_by('id', $uid);

        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }

        $update = ['ID' => $uid];
        $changed = false;

        if (isset($params['first_name'])) {
            $update['first_name'] = sanitize_text_field($params['first_name']);
            $changed = true;
        }

        if (isset($params['last_name'])) {
            $update['last_name'] = sanitize_text_field($params['last_name']);
            $changed = true;
        }

        if (!empty($params['name'])) {
            $name = sanitize_text_field($params['name']);
            $parts = explode(' ', $name, 2);
            $update['first_name'] = $parts[0];
            $update['last_name'] = $parts[1] ?? $parts[0];
            $update['display_name'] = $name;
            $changed = true;
        }

        if (!empty($params['email']) && $params['email'] !== $user->user_email) {
            $new_email = sanitize_email($params['email']);
            if (email_exists($new_email)) {
                return new WP_Error('email_exists', 'This email is already in use', ['status' => 409]);
            }
            $update['user_email'] = $new_email;
            $changed = true;
        }

        if (isset($params['phone'])) {
            update_user_meta($uid, 'billing_phone', sanitize_text_field($params['phone']));
            update_user_meta($uid, 'phone', sanitize_text_field($params['phone']));
            $changed = true;
        }

        if ($changed) {
            if (isset($update['first_name']) && isset($update['last_name'])) {
                $update['display_name'] = $update['display_name'] ?? trim($update['first_name'] . ' ' . $update['last_name']);
            }
            wp_update_user($update);
        }

        $updated_user = get_user_by('id', $uid);
        return ['success' => true, 'user' => self::format_user($updated_user)];
    }

    public static function change_password($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        $params = $request->get_json_params();

        $current = $params['current_password'] ?? '';
        $new = $params['new_password'] ?? '';

        $user = get_user_by('id', $uid);
        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }

        if (!wp_check_password($current, $user->user_pass, $uid)) {
            return new WP_Error('wrong_password', 'Current password is incorrect', ['status' => 401]);
        }

        if (strlen($new) < 6) {
            return new WP_Error('weak_password', 'New password must be at least 6 characters', ['status' => 400]);
        }

        wp_set_password($new, $uid);

        $new_token = Shams_Token::generate($uid);

        return ['success' => true, 'token' => $new_token];
    }

    private static function format_user($user) {
        $first = get_user_meta($user->ID, 'first_name', true) ?: $user->first_name;
        $last = get_user_meta($user->ID, 'last_name', true) ?: $user->last_name;
        $phone = get_user_meta($user->ID, 'billing_phone', true)
            ?: get_user_meta($user->ID, 'phone', true)
            ?: '';

        $addresses = self::get_addresses($user->ID, $first, $last, $phone);

        return [
            'id' => (string) $user->ID,
            'name' => trim("$first $last") ?: $user->display_name,
            'email' => $user->user_email,
            'phone' => $phone,
            'addresses' => $addresses,
        ];
    }

    private static function get_addresses($user_id, $first, $last, $phone) {
        $billing = [
            'id' => 'billing',
            'label' => 'Billing',
            'firstName' => get_user_meta($user_id, 'billing_first_name', true) ?: $first,
            'lastName' => get_user_meta($user_id, 'billing_last_name', true) ?: $last,
            'phone' => get_user_meta($user_id, 'billing_phone', true) ?: $phone,
            'governorate' => get_user_meta($user_id, 'billing_state', true) ?: '',
            'city' => get_user_meta($user_id, 'billing_city', true) ?: '',
            'address1' => get_user_meta($user_id, 'billing_address_1', true) ?: '',
            'address2' => get_user_meta($user_id, 'billing_address_2', true) ?: '',
            'postcode' => get_user_meta($user_id, 'billing_postcode', true) ?: '',
            'isDefault' => true,
        ];

        $shipping_first = get_user_meta($user_id, 'shipping_first_name', true);
        if ($shipping_first) {
            return [
                $billing,
                [
                    'id' => 'shipping',
                    'label' => 'Shipping',
                    'firstName' => $shipping_first,
                    'lastName' => get_user_meta($user_id, 'shipping_last_name', true) ?: '',
                    'phone' => $phone,
                    'governorate' => get_user_meta($user_id, 'shipping_state', true) ?: '',
                    'city' => get_user_meta($user_id, 'shipping_city', true) ?: '',
                    'address1' => get_user_meta($user_id, 'shipping_address_1', true) ?: '',
                    'address2' => get_user_meta($user_id, 'shipping_address_2', true) ?: '',
                    'postcode' => get_user_meta($user_id, 'shipping_postcode', true) ?: '',
                    'isDefault' => false,
                ],
            ];
        }

        return [$billing];
    }
}
