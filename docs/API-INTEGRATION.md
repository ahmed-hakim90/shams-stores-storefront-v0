> الحالة المعتمدة الأحدث: [تسليم Qoder](QODER-HANDOFF-2026-09-19.md). الأقسام التاريخية لا تعني أن الدفع ما زال مغلقًا أو أن 1.2.0 صالح للتثبيت. استخدم Headless 1.2.1 وCommerce UX 0.8.3 للحقول الجديدة.

# عقود API وملكية البيانات

> تحديث الدفع والتقسيط: [PAYMOB-VERCEL](PAYMOB-VERCEL.md). Paymob الجديد يتطلب Shams Headless 1.2.1؛ إشارات 1.1.1 أدناه تخص إصدار المفضلة السابق.

مرجع التسليم: 19 سبتمبر 2026. تحقق من المصدر والـ response في البيئة المستهدفة قبل تعديل المستهلك؛ لا تخمّن عقدًا من اسم البلاجن.

## مستودعان وبلاجان مختلفان

- هذا المستودع: واجهة headless، وبلاجن `wordpress-plugin/shams-headless/`، الإصدار المحلي 1.1.1.
- مستودع WordPress المنفصل على جهاز المالك: `/Users/hakimo/Documents/ChatGPT/Shams Stores`. المصدر `wordpress/shams-commerce-ux/` وعقده `API.md`، وكذلك `docs/SHAMS-API.md`؛ الإصدار المعد لهذا الربط 0.8.0. المسار المحلي إرشادي وقد يختلف على جهاز آخر.
- لا تعدل ZIP كأنه المصدر، ولا تنسخ تنفيذ بلاجن إلى الآخر. اقرأ تعليمات المستودع الآخر عند العمل فيه.

## حدود المصدر

WooCommerce هو مصدر السعر والمخزون والمنتج والمعاملات. Shams content API يضيف المحتوى والضمان والتوافق؛ لا يستبدل سعر/مخزون Store API ولا يبني slug منتج من اسمه. المنتجات المرتبطة تُجلب عبر الكتالوج قبل عرضها.

كل المسارات التالية نسبية إلى `/wp-json/shams/v1`. واجهات المحتوى العامة للقراءة؛ الوصول العام لا يبرر كشف admin أو المنتجات الخاصة. فشل مصدر اختياري لا يحوّل الكتالوج الحي إلى بيانات demo.

| GET | البيانات الأساسية | المستهلك/الحدود |
| --- | --- | --- |
| `/modules` | schema_version, rest_base, registered_routes, modules | اكتشاف الملكية والتوافر؛ ليس وعدًا بأن كل module له UI |
| `/site-content` | shell, hero_carousel, shoppable_hero, commerce_ui | layout والهيرو والفوتر؛ null مسموح |
| `/products/{id}/content` | product.assurances, fields, linked_products, seo_overrides | صفحة المنتج والإثراء |
| `/products/content?ids[]=…` | items من content | 20 ID كحد أقصى للطلب؛ الدمج بالـ ID لا ترتيب الاستجابة |
| `/products/{id}/accessories?limit=12` | product_id, items[{product, compatibility}] | limit من 1 إلى 12؛ المصدر الوحيد لادعاء التوافق |
| `/catalog/terms?taxonomy=product_cat&per_page=100&page=1` | items, page, per_page, total, total_pages | يدعم product_brand أيضًا؛ enrichment للصور مع حفظ counts والترتيب الأصليين |
| `/pages/{id}/content` | id, url, title, content_html, seo_overrides | slug يُحل أولًا عبر WordPress core pages؛ قائمة صفحات محلية مسموحة |
| `/products/{id}/reviews?per_page=10` | تقييمات المنتج | مالكه Shams Headless؛ استهلاك اختياري؛ لا mock reviews في live |
| `/admin/modules` | معلومات إدارية | يتطلب manage_options؛ ممنوع استهلاكه في واجهة العميل |

### الضمان والوكيل

```ts
assurances: {
  authorized: boolean | null,
  warranty_text: string,
  agent: null | { enabled: boolean; label: string; custom_label?: string },
  warranty_badge: null | { enabled: boolean; label: string; custom_label?: string }
}
```

`null` يعني غير متاح/غير معلوم، وليس false. حسب طلب المالك الأحدث: اعرض custom_label المتعبّي لكل منتج حتى لو enabled=false، ولا تستخدم label الافتراضي إلا مع enabled=true. الضمان يستخدم custom_label ثم warranty_text ثم الشارة المفعّلة، مع إزالة التكرار. يتطلب custom_label بلاجن Commerce UX 0.8.2؛ النسخة القديمة لا تميز النص الخاص عن الافتراضي. كارت المنتج ونتائج البحث والبحث السريع يستخدمون نفس المكوّن. label قد تعني «ضمان الوكيل»؛ ليست بالضرورة اسم شركة وكيل. لا تحول boolean إلى مدة ضمان.

مفاتيح المصدر: `_shams_authorized`، `_shams_warranty`، `_shams_market_agent`، `_shams_market_agent_label`، `_shams_product_warranty` مع إعدادات مالك البطاقات. `_shams_official` ليس بديلًا معتمدًا. fields تُعاد دون بادئة `_shams_`؛ لا تعرض جميع الحقول اعتباطيًا، استخدم whitelist الحالية.

### الإكسسوارات والروابط

`compatibility` يحتوي `level`, `note`, `source`. الدرجات المرصودة: exact, compatible, recommended. لا تستنتج توافقًا من related products أو cross-sell. linked_products يضم lens_options وkit_options.

`storefrontLink` في shams-contract يعيد كتابة روابط WordPress المعروفة إلى المسارات المحلية، ويبقي المجهولة روابط مطلقة آمنة. احتفظ بفحص البروتوكول وcredentials؛ لا تمرر HTML وروابط API مباشرة. SEO overrides قيم محفوظة، وليست محرك SEO كاملًا محسوبًا.

### shell والحملات

- `shell.branches`: name, address, phones[], hours, map, images[], url. images قد تكون attachment IDs؛ لا تفترض أنها URLs.
- `shell.menus`: location إلى عناصر id,parent,label,url,target. المستهلك الحالي للفوتر يبحث عن `shams-footer-help` و`shams-footer-policies`. وجود مواضع Electro أخرى لا يعني استهلاكها تلقائيًا.
- `hero_carousel`: autoplay_ms وslides تحتوي desktop_url/mobile_url والنصوص وCTA. التنفيذ المُدار الحالي يدوي، ولا يطبق autoplay_ms.
- `shoppable_hero`: heading, subheading, background_url, hotspots[{x,y,product}]. التنفيذ الحالي صورة وقائمة منتجات؛ الإحداثيات التفاعلية لم تنفذ.
- `commerce_ui`: المستهلك الحالي يستخدم add_label. لا تدّعِ تطبيق باقي إعدادات البلاجن أو CSS WordPress.

## الفشل والكاش والأمان

`shams-content.ts` remains server-only, with an 8-second deadline and null on optional failures. Only known public editorial routes opt into the Next Data Cache: site/page content 300 seconds, taxonomy image enrichment 3600 seconds, product content/accessories/reviews 120 seconds. Unknown routes receive no TTL. Next revalidation can serve stale responses while refreshing; these intervals are not maximum-age guarantees during upstream outages. React cache and inFlight coalesce concurrent reads, without keeping another persistent process cache. SHAMS_CONTENT_API_ENABLED=false still disables optional enrichment. Price and stock remain owned by Store API with existing TTLs; tokenized carts and mutations remain no-store.

getProduct(slug) remains the full product-page path. The relationships mode retains homepage relationships and compatibility but skips reviews, variations and bundles. The summary mode fetches only Store API data for the bundle story, preserving its short description and image. Comparison verifies public product IDs through Store API, then batches attributes/meta_data in one private read and returns normalized specifications only; unverified products and raw metadata are never returned.

`SafeRichText` يعرض نصًا آمنًا أولًا في SSR ثم DOMPurify في المتصفح، مع منع عناصر خطرة وإعادة كتابة الروابط. لا تستدعِ DOMPurify browser API أثناء SSR ولا تستبدله بحقن HTML خام.

## المفضلة: شرط ترتيب الإصدار

واجهة Next المحلية `/api/customer/wishlist` تتصل بالبلاجن عبر Bearer:

- GET/POST `/wp-json/shams/v1/customer/wishlist`
- DELETE `/wp-json/shams/v1/customer/wishlist/{product_id}`

Shams Headless 1.1.1 يسجل aliases القديمة فقط عند غياب `Shams_CUX_REST`. التخزين يبقى `shams_wishlist`؛ Commerce UX يمتلك `_shams_wishlist_product_ids`. لا migration ولا دمج بينهما. فشل upstream ليس قائمة فارغة سليمة؛ guest حالة منفصلة.

**ثبّت البلاجن المتوافق قبل نشر واجهة المسار الجديد.** kill-switch المحتوى لا يعيد المسار القديم. rollback للمفضلة يستلزم إرجاع الواجهة والبلاجن المتوافق معًا مع حفظ البيانات. راجع [الإصدار](../wordpress-plugin/shams-headless-1.1.1-release.md).

## checkout: الحد غير المكتمل

Content API 0.8.0 لا يوفّر schema إعدادات حقول checkout. المطلوب النهائي اعتماد إعدادات WordPress، لكن التنفيذ المحلي الحالي يستخدم requiredCheckoutFields: firstName, phone, address1, city, state. الهاتف يطابق `^01[0-9]{9}$`. لا توسّع أو تغيّر المعنى التجاري دون طلب.

تحديث العنوان والشحن صريح بدل كل ضغطة كتابة. التأكيد يتحقق من الحقول أولًا؛ إذا حدث تحديث عنوان/شحن يحتاج المستخدم مراجعة الخيارات ثم التأكيد. احتفظ بحماية تكرار الإرسال والنتيجة غير المؤكدة. لا تدّعِ اعتماد رحلة الدفع بناءً على اختبار الحقول فقط.

### Active homepage hero (2026-09-19)

The owner selected the original category HeroCarousel with the existing local `/images/hero/` banners. LiveHero no longer calls ManagedHero or selects WordPress hero_carousel/shoppable_hero content. Category names/descriptions/links still come from the existing cached catalog taxonomy; no additional product requests are introduced. WordPress site-content remains in use elsewhere for the site shell. The managed campaign adapter is available but is not the active homepage hero.


## Bank transfer details
When BACS is selected, BankTransferDetails loads /api/commerce/bank-transfer. The server reads site-content.bank_transfer (Commerce UX 0.8.3), only with checkout and bacs enabled. The component displays source instructions and account name/bank/number/IBAN/sort code/BIC with copy controls, preserving zeros. No hardcoded merchant accounts or fabricated InstaPay address. Missing plugin/data yields an explicit unavailable message. Tests cover mapping, copy success/denial, loading and errors.
