<?php
if (!defined('ABSPATH')) exit;

class Shams_Products {
    public static function register() {
        register_rest_route('shams/v1', '/products/(?P<id>\d+)/meta', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'get_meta'],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route('shams/v1', '/products/(?P<id>\d+)/meta', [
            'methods' => 'PUT',
            'callback' => [__CLASS__, 'update_meta'],
            'permission_callback' => [__CLASS__, 'admin_only'],
        ]);

        register_rest_route('shams/v1', '/products/(?P<id>\d+)/reviews', [
            [
                'methods' => 'GET',
                'callback' => [__CLASS__, 'get_reviews'],
                'permission_callback' => '__return_true',
            ],
            [
                'methods' => 'POST',
                'callback' => [__CLASS__, 'submit_review'],
                'permission_callback' => [__CLASS__, 'require_auth'],
            ],
        ]);

        register_rest_route('shams/v1', '/health', [
            'methods' => 'GET',
            'callback' => [__CLASS__, 'health_check'],
            'permission_callback' => '__return_true',
        ]);
    }

    public static function admin_only($request) {
        if (!current_user_can('manage_woocommerce')) {
            return new WP_Error('forbidden', 'Admin access required', ['status' => 403]);
        }
        return true;
    }

    public static function require_auth($request) {
        $uid = Shams_Token::get_user_id_from_request($request);
        if (!$uid) {
            return new WP_Error('invalid_token', 'Invalid or expired token', ['status' => 401]);
        }
        return true;
    }

    public static function get_meta($request) {
        $id = intval($request->get_param('id'));
        $product = wc_get_product($id);

        if (!$product) {
            return new WP_Error('not_found', 'Product not found', ['status' => 404]);
        }

        return [
            'id' => $id,
            'meta' => [
                'installment_from' => $product->get_meta('_shams_installment_from'),
                'official' => $product->get_meta('_shams_official') === 'yes',
                'featured_video' => $product->get_meta('_shams_featured_video'),
                'size_guide' => $product->get_meta('_shams_size_guide'),
                'badge_text' => $product->get_meta('_shams_badge_text'),
            ],
        ];
    }

    public static function update_meta($request) {
        $id = intval($request->get_param('id'));
        $product = wc_get_product($id);

        if (!$product) {
            return new WP_Error('not_found', 'Product not found', ['status' => 404]);
        }

        $params = $request->get_json_params();
        $meta_map = [
            'installment_from' => '_shams_installment_from',
            'featured_video' => '_shams_featured_video',
            'size_guide' => '_shams_size_guide',
            'badge_text' => '_shams_badge_text',
        ];

        foreach ($meta_map as $param_key => $meta_key) {
            if (isset($params[$param_key])) {
                $product->update_meta_data($meta_key, sanitize_text_field($params[$param_key]));
            }
        }

        if (isset($params['official'])) {
            $product->update_meta_data('_shams_official', $params['official'] ? 'yes' : 'no');
        }

        $product->save();

        return ['success' => true, 'id' => $id];
    }

    public static function get_reviews($request) {
        $id = intval($request->get_param('id'));
        $product = wc_get_product($id);

        if (!$product) {
            return new WP_Error('not_found', 'Product not found', ['status' => 404]);
        }

        $page = max(1, intval($request->get_param('page') ?? 1));
        $per_page = min(50, max(1, intval($request->get_param('per_page') ?? 10)));

        $comments = get_comments([
            'post_id' => $id,
            'status' => 'approve',
            'type' => 'review',
            'number' => $per_page,
            'offset' => ($page - 1) * $per_page,
            'orderby' => 'comment_date_gmt',
            'order' => 'DESC',
        ]);

        $total = get_comments([
            'post_id' => $id,
            'status' => 'approve',
            'type' => 'review',
            'count' => true,
        ]);

        $reviews = [];
        foreach ($comments as $comment) {
            $rating = intval(get_comment_meta($comment->comment_ID, 'rating', true));
            $reviews[] = [
                'id' => (string) $comment->comment_ID,
                'author' => $comment->comment_author,
                'rating' => $rating,
                'content' => $comment->comment_content,
                'dateCreated' => $comment->comment_date_gmt ? mysql2date('c', $comment->comment_date_gmt) : null,
            ];
        }

        return [
            'reviews' => $reviews,
            'page' => $page,
            'per_page' => $per_page,
            'total' => intval($total),
            'averageRating' => $product->get_average_rating(),
            'reviewCount' => $product->get_review_count(),
        ];
    }

    public static function submit_review($request) {
        if (!get_option('shams_headless_enable_reviews', true)) {
            return new WP_Error('disabled', 'Reviews are currently disabled', ['status' => 403]);
        }

        $uid = Shams_Token::get_user_id_from_request($request);
        $id = intval($request->get_param('id'));
        $product = wc_get_product($id);

        if (!$product) {
            return new WP_Error('not_found', 'Product not found', ['status' => 404]);
        }

        $params = $request->get_json_params();
        $rating = intval($params['rating'] ?? 0);
        $content = sanitize_textarea_field($params['content'] ?? '');

        if ($rating < 1 || $rating > 5) {
            return new WP_Error('invalid_rating', 'Rating must be between 1 and 5', ['status' => 400]);
        }

        if (empty($content)) {
            return new WP_Error('missing_content', 'Review content is required', ['status' => 400]);
        }

        $user = get_user_by('id', $uid);
        if (!$user) {
            return new WP_Error('not_found', 'User not found', ['status' => 404]);
        }

        $existing = get_comments([
            'post_id' => $id,
            'user_id' => $uid,
            'type' => 'review',
            'number' => 1,
        ]);

        if (!empty($existing)) {
            return new WP_Error('already_reviewed', 'You have already reviewed this product', ['status' => 409]);
        }

        $comment_id = wp_insert_comment([
            'comment_post_ID' => $id,
            'comment_author' => $user->display_name,
            'comment_author_email' => $user->user_email,
            'comment_content' => $content,
            'comment_type' => 'review',
            'user_id' => $uid,
            'comment_approved' => 1,
        ]);

        if (!$comment_id) {
            return new WP_Error('review_failed', 'Failed to submit review', ['status' => 500]);
        }

        update_comment_meta($comment_id, 'rating', $rating);

        return new WP_REST_Response([
            'success' => true,
            'review' => [
                'id' => (string) $comment_id,
                'author' => $user->display_name,
                'rating' => $rating,
                'content' => $content,
            ],
        ], 201);
    }

    public static function health_check($request) {
        return [
            'status' => 'ok',
            'version' => SHAMS_HEADLESS_VERSION,
            'woocommerce' => class_exists('WooCommerce') ? wc()->version : 'not_installed',
            'php' => PHP_VERSION,
            'wordpress' => get_bloginfo('version'),
            'settings' => [
                'registration' => (bool) get_option('shams_headless_allow_registration', true),
                'wishlist' => (bool) get_option('shams_headless_enable_wishlist', true),
                'reviews' => (bool) get_option('shams_headless_enable_reviews', true),
                'require_phone' => (bool) get_option('shams_headless_require_phone', true),
                'token_expiry_days' => intval(get_option('shams_headless_token_expiry_days', 7)),
            ],
        ];
    }
}
