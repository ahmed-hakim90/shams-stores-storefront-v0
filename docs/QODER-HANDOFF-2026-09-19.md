> متابعة لاحقة: راجع حادثة الطلبين pending 30309/30310 في QODER-ISSUES.md. أضيفت حماية PAYMENT_REVIEW_REQUIRED وتشخيص مراحل تجهيز الدفع وتخطيط grid، ثم (19 سبتمبر) تحليل متسامح لاستجابة Intention وسجلا `[paymob-reject]`/`[paymob-intention-shape]` ومسار استئناف على نفس الطلب مع completeClaim معوّض وزر «Complete payment for Order #X». السبب النهائي لتوقف Paymob غير مثبت؛ لا تعتبر تعديلات التشخيص أو الاستئناف إغلاقًا للمشكلة قبل نجاح محاولة حية.

# تسليم Qoder — الحالة المعتمدة في 19 سبتمبر 2026

هذه لقطة نهاية جلسة، وليست فحصًا لحظيًا. اقرأها قبل التقارير التاريخية. هدف المالك متجر headless متصل بإضافات شمس، ودفع داخل الموقع. لا تعتبر ظهور طريقة دفع دليل نجاح المعاملة.

## المستودعات والملكية

| المستودع | المسار | مصدر العمل |
| --- | --- | --- |
| Headless | `/Users/hakimo/Developer/shams-stores-storefront-v0` | Next.js، الواجهة، API الوسيط، Paymob، `wordpress-plugin/shams-headless/` |
| WordPress | `/Users/hakimo/Documents/ChatGPT/Shams Stores` | `wordpress/shams-commerce-ux/` وباقي بلاجن شمس؛ اقرأ `wordpress/AGENTS.md` |

الـ cwd الافتراضي قد يكون مستودع WordPress؛ حدد workdir دائمًا. Headless HEAD المرصود dbab386؛ التغييرات التالية تشمل working tree غير ملتزم به. لا reset أو clean أو overwrite. لا تفترض أن GitHub يحتوي النسخة المنشورة. لا تغيّر `.qoder/settings.local.json` ولا تطبعه.

## حالة الإنتاج الفعلية

- رابط الواجهة: https://shams-stores-storefront-v0.vercel.app
- WordPress: https://www.shams-stores.com
- آخر deployment منشور: `dpl_CqxDjNd5Cf1bpwcXqajbzCY8T4Sz`، URL: https://shams-stores-storefront-v0-ahejq63ut-ahmed-hakim-90.vercel.app
- السابق المباشر: `dpl_2d2xpHr1MNjxAPZTZqAf5gUt5Tg8`، يتضمن إصلاح shipping_lines.
- ما قبله: `dpl_6a63dqKRxh7CeB2KqHbTefEewPXQ`، تفعيل الدفع لكنه يحتوي خطأ shipping_lines؛ لا ترجع إليه باعتباره إصلاحًا آمنًا للدفع.
- الإنتاج: COMMERCE_CHECKOUT_ENABLED=true، PAYMOB_ENABLED=true، COMMERCE_VERIFIED_PAYMENT_METHODS=cod,bacs، PAYMOB_INSTALLMENT_DISPLAY_ENABLED=true، SHAMS_CONTENT_API_ENABLED=true، PAYMOB_METHOD_SOURCE=woocommerce.
- Live integration allowlists: بطاقة 5035900، تقسيط 3707775. Test 627615 مستبعد من الإنتاج. لا تضف Valu أو أي وسيلة لمجرد وجودها في حساب Paymob.
- مفاتيح Paymob Live موجودة كأسرار Vercel؛ لا توجد قيم أسرار في هذا التسليم. لا تبدّل أو تعيد توليد المفاتيح المستخدمة بالموقع الحالي.
- Shams Headless 1.2.1: المالك أكد التفعيل؛ بعدها ظهرت routes الدفع/auth/wishlist في REST index. هذا ليس اختبار معاملة.
- Commerce UX 0.8.1 آخر إصدار مرصود نشط؛ 0.8.3 جاهز محليًا ولم نرفعه أو نفعّله. افحص الإصدار مجددًا قبل أي قرار.
- فحص checkout الإنتاج أعاد HTTP 200، enabled=true، paymob=true، card/installments وcod,bacs. المتصفح أظهر الأربع طرق.
- آخر فحص `/api/commerce/bank-transfer`: HTTP 200، null؛ المصدر الجديد غير متاح بعد. زر النسخ لن يعرض حسابات فعلية قبل تحديث البلاجن وتوافر حسابات Woo.

## ما تغيّر وأين

| التغيير | الملفات المالكة | الحالة |
| --- | --- | --- |
| تشغيل checkout/Paymob | Vercel production flags، `lib/payments/paymob/config.ts` | منشور؛ لم نختبر دفعًا حقيقيًا |
| إصلاح رفض shipping_lines | `lib/payments/orders.ts`، `tests/paymob-deployment.test.mjs` | منشور؛ instance_id صار string وفق live REST schema |
| استئناف الدفع على نفس الطلب + completeClaim معوّض | `app/api/payments/intention/route.ts`، `lib/payments/paymob/client.ts`، `lib/payments/paymob/reconcile.ts`، `lib/commerce/browser.ts`، `lib/commerce/live/*`، checkout-form، tests | محلي 19 سبتمبر؛ الاختبارات 70/70 وtypecheck نضيف؛ بانتظار نشر مصرح |
| حسابات التحويل والنسخ | `lib/payments/bank-transfer.ts`، `app/api/commerce/bank-transfer/route.ts`، `components/shams/payments/bank-transfer-details.tsx`، checkout-form | الواجهة منشورة؛ بيانات المصدر تحتاج Commerce UX 0.8.3 |
| الضمان والوكيل في الكروت والبحث | product-assurances، global-search-overlay، shams-contract، types | الواجهة منشورة؛ custom_label يحتاج تحديث Commerce UX |
| إظهار تنويه التقسيط مستقلًا | checkout route، settings.ts، installment-notice، use-checkout-config | منشور؛ ليس حاسبة أقساط |
| fatal تفعيل Headless | class-auth.php: handler صار register_customer بدل تكرار register | 1.2.1؛ المالك فعّله |
| API custom_label وbank_transfer | مستودع WP: class-shams-cux-content-rest.php | ضمن ZIP Commerce UX 0.8.3 غير مفعّل |

## عقود البيانات المهمة

### الضمان والوكيل

Shams Product Cards يملك `_shams_market_agent_label` و`_shams_product_warranty_label` مع checkboxes منفصلة. Commerce UX يملك `_shams_warranty` و`_shams_authorized`.

طلب المالك الأحدث: النص الخاص المتعبّي يظهر حتى لو checkbox غير محدد. لا تستخدم label الافتراضي كدليل وجود ضمان. الإصدار 0.8.3 يشمل تعديل 0.8.2: `agent.custom_label` و`warranty_badge.custom_label` مستقلان عن label المدمج والـ enabled القديم. Headless يحولهما إلى customLabel. أولوية الضمان: customLabel ثم warrantyText ثم label إذا enabled. الوكيل: customLabel ثم enabled label. لا تغيير تلقائي لحقول المنتجات أو شارات WordPress القديمة.

البحث السريع يستخدم autocomplete ثم byIds/listProducts مع batch enrichment؛ صفحة البحث تستخدم الكروت المشتركة. إزالة تكرار النصوص، React escaping، dir=auto، والتفاف النص الطويل محفوظة. غياب البيانات يخفي الشارة؛ لا تختلق بيانات تجارية.

### التحويل البنكي/InstaPay

Commerce UX 0.8.3 يقرأ `woocommerce_bacs_settings` و`woocommerce_bacs_accounts`. يرجع site-content.bank_transfer فقط عند enabled=yes. الحقول المسموحة: account_name، account_number، bank_name، sort_code، iban، bic. حد 30 حسابًا، مع استبعاد الحسابات بلا رقم أو IBAN. التعليمات plain text؛ لا مفاتيح بوابات أو secrets. الأرقام strings للحفاظ على الأصفار.

مسار Next يعمل فقط عند checkout enabled ووجود bacs في القائمة. يُجلب عند اختيار الطريقة؛ لا يتم تحميل الحسابات لكل كارت منتج. Copy يستخدم Clipboard API، مع إعلان النجاح أو إتاحة النسخ اليدوي عند رفض المتصفح. لم نضف حساب InstaPay من عندنا، ولا upload لإيصال أو تأكيد تحويل تلقائي. BACS طلب مؤجل وليس paid بمجرد الضغط.

### الدفع والتقسيط

Paymob Pixel داخل الصفحة؛ التحقق البنكي/3DS قد يتطلب انتقالًا تابعًا للبنك. الاختيارات من بوابات Woo المفعلة وتقاطعها مع allowlists. لا تكشف integration secrets للمتصفح. Intention يرسل notification_url وredirection_url؛ لم يُثبت عمليًا احترام كل تكامل لهذه overrides.

محرك الحاسبة على المنتج غير منفذ. الموجود رابط/تنويه؛ خطط البنوك داخل Pixel هي المصدر المقصود أثناء الدفع. لا تقسم السعر على أشهر مفترضة، ولا تعد بدون فوائد. نحتاج feed رسمي أو جدول خطط معتمد قبل تنفيذ الحاسبة.

## قواعد المالك

- الهاتف إجباري. نقص الحقول يظهر validation عند التأكيد ويركز أول حقل، دون تعطيل مسبق للزر. منع التكرار أثناء الطلب/النتيجة غير المؤكدة لازم.
- لا تتدخل البلاجن في فورم WordPress. Headless لا يرث schema الحقول تلقائيًا بعد؛ الحقول الحالية مملوكة محليًا ومطلوب توثيق هذا الحد.
- «كل البلاجن» يعني بلاجن شمس المخصصة؛ لا يعني نسخ إعدادات الإدارة أو كل CSS أو كل طرف ثالث.
- لا اختراع ضمان، وكيل، فوائد، مدد، أرقام حسابات، أسعار، سياسة أو بيانات فروع.
- لا تعطل حماية دفع أو تمسح قفلًا أو تنشئ طلبات لمجرد إصلاح واجهة.

## التحقق الذي حدث وحدوده

آخر مجموعة: 61 اختبار Node في headless + TypeScript، و97 اختبار WordPress، و11 ملف PHP syntax عبر PHP-WASM، وسلامة ZIP 0.8.3. بناء Vercel وترقية الإنتاج نجحا. معاينة حسابات التحويل والشارات ببيانات fixture عربية/إنجليزية بأربع مقاسات دون document overflow؛ ليست بيانات إنتاج أو تجربة بنك.

تم رفض webhook غير موقّع بـ400؛ هذا يثبت الوصول والرفض فقط. لم ينشئ الوكيل طلبًا أو Intention حقيقيًا ولم يدفع أو يحوّل أموالًا. المالك جرّب بنفسه وظهر خطأ shipping_lines. نجاح الاختبارات لا يثبت Pixel أو callbacks أو دورة السلة كاملة.

## ترتيب الاستكمال

1. اقرأ [سجل المشاكل](QODER-ISSUES.md)، وراجع المحاولة المقفولة قبل أي تجربة دفع جديدة.
2. افحص ما إذا المالك حدّث Commerce UX بالفعل؛ إن لم يحدث، جهّز ترقية 0.8.3 وفق نسخة احتياطية وتصريح البيئة.
3. تحقق من API والواجهة بحسابات وأوصاف منتجات معتمدة، بلا اختراع أو كتابة بيانات تجريبية في الإنتاج.
4. اختبر رحلة الدفع كاملة في staging: النجاح/الفشل/الإلغاء والتزامن والـ webhook والسلة بعد الدفع.
5. نفّذ حاسبة التقسيط فقط بعد وجود مصدر موثق للخطط.

[دليل بناء البلاجن](QODER-PLUGIN-GUIDE.md) · [التشغيل](DEVELOPMENT-RUNBOOK.md) · [عقد API](API-INTEGRATION.md) · [تاريخ النشر](VERCEL-RELEASE-2026-09-19.md)
