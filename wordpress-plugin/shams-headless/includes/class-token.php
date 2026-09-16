<?php
if (!defined('ABSPATH')) exit;

class Shams_Token {
    private static $secret = null;

    private static function secret() {
        if (self::$secret === null) {
            self::$secret = defined('SHAMS_AUTH_SECRET')
                ? SHAMS_AUTH_SECRET
                : wp_salt('auth');
        }
        return self::$secret;
    }

    public static function generate($user_id) {
        $expiry_days = intval(get_option('shams_headless_token_expiry_days', 7));
        $issued_at = time();
        $expires_at = $issued_at + ($expiry_days * DAY_IN_SECONDS);

        $payload = [
            'uid' => $user_id,
            'iat' => $issued_at,
            'exp' => $expires_at,
        ];

        $encoded = base64_encode(json_encode($payload));
        $signature = hash_hmac('sha256', $encoded, self::secret());

        return $encoded . '.' . $signature;
    }

    public static function verify($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 2) return null;

        $encoded = $parts[0];
        $signature = $parts[1];

        $expected = hash_hmac('sha256', $encoded, self::secret());
        if (!hash_equals($expected, $signature)) return null;

        $payload = json_decode(base64_decode($encoded), true);
        if (!$payload || !isset($payload['exp'], $payload['uid'])) return null;

        if (time() > $payload['exp']) return null;

        return intval($payload['uid']);
    }

    public static function get_user_id_from_request($request) {
        $auth = $request->get_header('Authorization');
        if (!$auth || !preg_match('/Bearer\s+(.+)$/i', $auth, $m)) return null;
        return self::verify($m[1]);
    }
}
