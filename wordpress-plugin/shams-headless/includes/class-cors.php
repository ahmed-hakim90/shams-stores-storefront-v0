<?php
if (!defined('ABSPATH')) exit;

class Shams_CORS {
    public function __construct() {
        add_action('rest_api_init', [$this, 'register_hooks'], 15);
        add_filter('rest_pre_serve_request', [$this, 'send_cors_headers'], 10, 4);
    }

    public function register_hooks() {
        remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    }

    public function send_cors_headers($value, $result, $request, $server) {
        $origin = $this->get_origin();
        $allowed = $this->get_allowed_origins();

        if ($origin && $this->is_allowed($origin, $allowed)) {
            header("Access-Control-Allow-Origin: {$origin}");
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Authorization, Content-Type, Accept, X-WP-Nonce');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit;
        }

        return $value;
    }

    private function get_origin() {
        return $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? null;
    }

    private function get_allowed_origins() {
        $raw = get_option('shams_headless_cors_origins', home_url());
        $origins = array_map('trim', explode(',', $raw));
        return array_filter($origins);
    }

    private function is_allowed($origin, $allowed) {
        $origin = rtrim($origin, '/');
        foreach ($allowed as $pattern) {
            $pattern = rtrim($pattern, '/');
            if ($pattern === $origin) return true;
            if (strpos($pattern, '*') !== false) {
                $regex = '/^' . str_replace('\*', '.*', preg_quote($pattern, '/')) . '$/';
                if (preg_match($regex, $origin)) return true;
            }
        }
        return false;
    }
}

