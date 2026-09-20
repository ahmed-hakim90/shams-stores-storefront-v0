// this is in code snippet name OpenAI Ads Pixel - WooCommerce Events

add_action('wp_footer', function() {
    if (!class_exists('WooCommerce')) return;
    ?>
    <script>ß
    (function() {
        if (typeof oaiq !== 'function') return;
        <?php if (is_product()): ?>
            oaiq('measure', 'view_content', {
                content_name: '<?php echo esc_js(get_the_title()); ?>',
                content_ids: ['<?php echo esc_js(get_the_ID()); ?>'],
                content_type: 'product'
            });
        <?php elseif (is_cart()): ?>
            oaiq('measure', 'add_to_cart');
        <?php elseif (is_checkout()): ?>
            oaiq('measure', 'initiate_checkout');
        <?php elseif (is_order_received_page()): ?>
            <?php
            $order_id = absint(get_query_var('order-received'));
            if (!$order_id) {
                $order_id = absint($_GET['order_id'] ?? 0);
            }
            if ($order_id) {
                $order = wc_get_order($order_id);
                if ($order && $order->get_status() !== 'failed') {
                    $items = [];
                    foreach ($order->get_items() as $item) {
                        $items[] = [
                            'id' => (string)$item->get_product_id(),
                            'quantity' => $item->get_quantity(),
                            'item_price' => round((float)$item->get_total() / max(1, $item->get_quantity()), 2)
                        ];
                    }
            ?>
            oaiq('measure', 'order_created', {
                type: 'contents',
                value: <?php echo (float)$order->get_total(); ?>,
                currency: '<?php echo esc_js($order->get_currency()); ?>',
                contents: <?php echo wp_json_encode($items); ?>,
                num_items: <?php echo count($items); ?>
            });
            <?php
                }
            }
            ?>
        <?php endif; ?>
    })();
    </script>
    <?php
});