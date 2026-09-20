// this is in code snippet name OpenAI Ads Pixel - Conversions API 
add_action('woocommerce_thankyou', function($order_id) {
    if (!class_exists('WooCommerce')) return;
    if (!defined('OPENAI_ADS_API_KEY') || empty(OPENAI_ADS_API_KEY)) return;

    $order = wc_get_order($order_id);
    if (!$order || $order->get_status() === 'failed') return;

    $oppref = '';
    if (!empty($_GET['oppref'])) {
        $oppref = sanitize_text_field($_GET['oppref']);
        setcookie('openai_oppref', $oppref, time() + 30 * 86400, COOKIEPATH, COOKIE_DOMAIN);
    } elseif (!empty($_COOKIE['openai_oppref'])) {
        $oppref = sanitize_text_field($_COOKIE['openai_oppref']);
    }

    $event_id = 'wc_order_' . $order_id . '_' . time();

    $items = [];
    foreach ($order->get_items() as $item) {
        $items[] = [
            'id' => (string)$item->get_product_id(),
            'quantity' => $item->get_quantity(),
        ];
    }

    $email = $order->get_billing_email();
    $event = [
        'id' => $event_id,
        'type' => 'order_created',
        'timestamp_ms' => (int)(microtime(true) * 1000),
        'source_url' => home_url('/checkout/order-received/' . $order_id . '/'),
        'action_source' => 'web',
        'data' => [
            'type' => 'contents',
            'amount' => (int)round((float)$order->get_total() * 100),
            'currency' => $order->get_currency(),
            'contents' => $items,
        ],
    ];

    if ($oppref) $event['oppref'] = $oppref;
    if ($email) $event['user'] = ['email_sha256' => hash('sha256', strtolower(trim($email)))];

    wp_remote_post(
        'https://bzr.openai.com/v1/events?pid=KBHCVX1dYePAFy31mpRQgR',
        [
            'headers' => [
                'Authorization' => 'Bearer ' . OPENAI_ADS_API_KEY,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode(['validate_only' => false, 'events' => [$event]]),
            'timeout' => 10,
        ]
    );
});