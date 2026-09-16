<?php
if (!defined('ABSPATH')) exit;

class Shams_Password_Recovery {
    public static function register() {
        register_rest_route('shams/v1', '/forgot-password', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'forgot_password'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('shams/v1', '/reset-password', [
            'methods' => 'POST',
            'callback' => [__CLASS__, 'reset_password'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function forgot_password($request) {
        $params = $request->get_json_params();
        $email = sanitize_email($params['email'] ?? '');

        if (empty($email)) {
            return new WP_Error('missing_email', 'Email is required', ['status' => 400]);
        }

        $user = get_user_by('email', $email);
        if (!$user) {
            return ['success' => true, 'message' => 'If the email exists, a reset link has been sent.'];
        }

        $result = retrieve_password($user->user_login);

        if (is_wp_error($result)) {
            return new WP_Error('reset_failed', 'Failed to send reset email', ['status' => 500]);
        }

        return ['success' => true, 'message' => 'If the email exists, a reset link has been sent.'];
    }

    public static function reset_password($request) {
        $params = $request->get_json_params();
        $key = sanitize_text_field($params['key'] ?? '');
        $login = sanitize_text_field($params['login'] ?? '');
        $password = $params['password'] ?? '';

        if (empty($key) || empty($login)) {
            return new WP_Error('missing_params', 'Reset key and login are required', ['status' => 400]);
        }

        if (strlen($password) < 6) {
            return new WP_Error('weak_password', 'Password must be at least 6 characters', ['status' => 400]);
        }

        $user = check_password_reset_key($key, $login);
        if (is_wp_error($user)) {
            return new WP_Error('invalid_key', 'Invalid or expired reset link', ['status' => 400]);
        }

        wp_set_password($password, $user->ID);

        $token = Shams_Token::generate($user->ID);

        return ['success' => true, 'token' => $token];
    }
}
