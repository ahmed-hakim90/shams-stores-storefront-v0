<?php
// Contract fixture only: no network, real WordPress DB, orders or payments.
define('ABSPATH', __DIR__);
$store=[]; $routes=[]; $allowed=false;
class WP_Error { public $code; public function __construct($code,$message,$data=[]) { $this->code=$code; } }
class Request { private $data; public function __construct($data) {$this->data=$data;} public function get_param($key) {return $this->data[$key]??null;} }
function register_rest_route($ns,$path,$args) {global $routes;$routes[$ns.$path]=$args;}
function current_user_can($cap) {global $allowed;return $allowed && $cap==='manage_woocommerce';}
function add_option($key,$value,$deprecated='',$autoload=false) {global $store;if(isset($store[$key]))return false;$store[$key]=$value;return true;}
function get_option($key) {global $store;return $store[$key]??false;}
function update_option($key,$value,$autoload=false) {global $store;$store[$key]=$value;return true;}
function delete_option($key) {global $store;unset($store[$key]);}
function wp_generate_uuid4() {static $n=0;return 'token-'.++$n;}
function absint($value) {return abs((int)$value);}
function wc_get_order($id) {return $id===123;}
function expect($ok,$message) {if(!$ok)throw new Exception($message);}
require __DIR__.'/../wordpress-plugin/shams-headless/includes/class-payment-sessions.php';
Shams_Payment_Sessions::register();
expect(isset($routes['wc/v3/shams-headless/payment-sessions']), 'Missing private coordinator');
expect(!Shams_Payment_Sessions::permission(), 'Anonymous must fail');$allowed=true;
expect(Shams_Payment_Sessions::permission(), 'Store manager permission required');
function call_session($data) {return Shams_Payment_Sessions::handle(new Request($data));}
$base=['key'=>hash('sha256','cart-token'),'fingerprint'=>hash('sha256','snapshot')];
$claim=call_session($base+['action'=>'claim']); expect($claim['claimed']===true,'First claim');
expect(call_session($base+['action'=>'claim']) instanceof WP_Error,'Concurrent claim must fail');
expect(call_session($base+['action'=>'complete','token'=>'wrong','order_id'=>123]) instanceof WP_Error,'Wrong owner');
expect(call_session($base+['action'=>'release','token'=>$claim['token']]) instanceof WP_Error,'No checkout release');
expect(call_session($base+['action'=>'complete','token'=>$claim['token'],'order_id'=>123])['completed'],'Complete');
expect(call_session($base+['action'=>'claim'])['order_id']===123,'Retry returns same durable order');
expect(call_session(['key'=>$base['key'],'fingerprint'=>hash('sha256','changed'),'action'=>'claim']) instanceof WP_Error,'Changed cart blocked');
$web=['key'=>hash('sha256','webhook:123'),'fingerprint'=>hash('sha256','webhook')];
$lock=call_session($web+['action'=>'claim']);
expect(call_session($web+['action'=>'claim']) instanceof WP_Error,'Webhook concurrency');
call_session($web+['action'=>'release','token'=>$lock['token']]);
expect(call_session($web+['action'=>'claim'])['claimed'],'Webhook retry after release');
echo "Payment coordination contracts passed\n";
