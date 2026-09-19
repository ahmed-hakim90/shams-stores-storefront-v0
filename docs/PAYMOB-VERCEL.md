> العرض المحلي: `PAYMOB_INSTALLMENT_DISPLAY_ENABLED=true` يسمح بتنويه التقسيط من طرق WooCommerce المفعلة والقائمة المعتمدة، بدون مفاتيح Paymob أو فتح إنشاء الدفعات. يعيد checkout API الحقل `installmentAvailable` منفصلًا عن `paymob`. عند إغلاق الدفع يوضح التنويه أن الدفع أونلاين غير مفعّل. فشل المصدر يخفي التنويه. الإعداد مفعّل محليًا وفي متغيرات Production؛ راجع تقرير النشر لحالة النسخة.

> تصحيح تفعيل 19 سبتمبر: استخدم [Shams Headless 1.2.1](../wordpress-plugin/shams-headless-1.2.1.zip)، وليس 1.2.0. عولج تكرار `Shams_Auth::register()`؛ [السبب والفحوص](../wordpress-plugin/shams-headless-1.2.1-release.md). ادعاء نجاح syntax للإصدار السابق كان غير صحيح بسبب exit code مضلل من PHP-WASM.

# حالة النشر الأحدث

بعد طلب المالك تشغيل الإنتاج، تم ضبط بوابتي checkout وPaymob على true مع قائمة cod,bacs القائمة. تفعيل الطرق لا يثبت نجاح معاملة فعلية؛ لم ننفذ طلبًا أو دفعًا على الإنتاج. حاسبة المنتج غير منفذة، والخطط تُعرض عبر Pixel أثناء الدفع. [تقرير النشر والفحوص](VERCEL-RELEASE-2026-09-19.md) هو مرجع الحالة الأحدث؛ ملاحظات عدم النشر أدناه تصف مرحلة التنفيذ السابقة.

# Paymob داخل شمس — إعداد Vercel

تحديث 19 سبتمبر 2026. طلب المالك: نفس طرق موقع شمس، والدفع داخل الموقع. التنفيذ يستخدم Paymob Pixel؛ لا تحويل تلقائي إلى hosted checkout. البنك قد يطلب 3D Secure خارج الفورم. لا نجمع PAN/CVV في حقول React الخاصة بنا، ولا نؤكد الدفع من نتيجة المتصفح.

## ما تحققنا منه في الحساب

قراءة فقط من WooCommerce REST ولوحة Paymob المتصلة، دون تغيير تكامل أو webhook أو مفتاح:

| الوضع | الطريقة | Integration ID | القرار |
| --- | --- | --- | --- |
| Live | بطاقات الموقع | 5035900 | مفعلة في Woo، مرشحة للإنتاج بعد الاختبار |
| Live | Bank Installments في Woo | 3707775 | مفعلة في Woo؛ Paymob يعرضها VPC online |
| Test | بطاقة مفعلة أيضًا في Woo الحالي | 627615 | تستبعد من Live؛ لا تخلطها بمفتاح Live |
| Test | بطاقة أخرى في لوحة الحساب | 3695036 | موجودة بالحساب؛ ليست ضمن بوابات Woo المرصودة |
| Live | بطاقة قديمة | 1116292 | معطلة في Woo، لا نعرضها |

COD وInstaPay/bacs مفعّلان في Woo. Valu ظاهر في حساب Paymob لكنه ليس بوابة مفعلة في إعدادات Woo التي قرأناها؛ لم نضفه تلقائيًا. وجود طرق in_store لا يجعلها وسائل online. قائمة Test المرصودة لا تتضمن تكامل تقسيط مستقل؛ اختبار تقسيط sandbox يحتاج تكاملًا يدعمه الحساب بالتنسيق مع Paymob.

## تجهيز المتغيرات

قالب الإنتاج الجاهز بالقيم العامة المرصودة: [VERCEL-PRODUCTION.env.example](VERCEL-PRODUCTION.env.example). للإعداد العام ابدأ من [.env.example](../.env.example)، وضع القيم في Vercel → Project → Settings → Environment Variables. لا تضع أسرارًا في Git أو المحادثة. لا تعمل Recreate للمفاتيح القائمة: قد يقطع ربط الموقع الحالي.

| المتغير | القيمة/الغرض |
| --- | --- |
| COMMERCE_PROVIDER | woocommerce |
| WOOCOMMERCE_API_URL | رابط WordPress REST المنتهي بـ /wp-json/wc/v3؛ لا تغيّره إلى دومين الواجهة |
| WOOCOMMERCE_API_KEY / WOOCOMMERCE_API_SECRET | مفتاح مخصص read/write مرتبط بمستخدم لديه manage_woocommerce؛ قراءة الكتالوج وحدها لا تثبت صلاحية إنشاء الطلبات |
| WOOCOMMERCE_CURRENCY | EGP |
| NEXT_PUBLIC_APP_URL | أصل HTTPS للواجهة بلا path أو query أو بيانات دخول؛ الدومين الحالي المرصود للواجهة https://shams-stores-storefront-v0.vercel.app، حدّثه إذا استخدمت custom domain |
| PAYMOB_SECRET_KEY | Secret key للوضع الصحيح؛ server-only |
| PAYMOB_HMAC_SECRET | HMAC من الحساب؛ server-only |
| PAYMOB_PUBLIC_KEY | Public key لنفس وضع Secret key؛ يعاد إلى Pixel فقط |
| PAYMOB_BASE_URL | https://accept.paymob.com |
| PAYMOB_METHOD_SOURCE | woocommerce للإنتاج؛ environment لاختبار IDs مستقلة عن Woo |
| PAYMOB_INTEGRATION_ID | قائمة بطاقات معتمدة؛ Live المرصود: 5035900؛ Test المرصود: 627615 |
| PAYMOB_INSTALLMENT_INTEGRATION_IDS | Live المرصود: 3707775؛ اترك Test فارغًا حتى توفر تكامل test صالح |
| COMMERCE_VERIFIED_PAYMENT_METHODS | cod,bacs بعد اختبارهما؛ لا تضف paymob-main/pixel هنا |
| COMMERCE_CHECKOUT_ENABLED | false أثناء التجهيز؛ true بعد جاهزية بيئة الاختبار أو اعتماد الإطلاق |
| PAYMOB_ENABLED | false أثناء التجهيز؛ true بعد استكمال إعدادات واختبار البيئة المقصودة |

`NEXT_PUBLIC_PAYMOB_PUBLIC_KEY` القديم مقبول للتوافق، لكن استخدم PAYMOB_PUBLIC_KEY مصدرًا واحدًا. لا توجد حاجة إلى API Key القديم أو Iframe ID لهذا المسار.

في وضع woocommerce تُعرض فقط IDs الموجودة في القائمة المعتمدة **والمفعلة الآن** في Woo؛ لا تُنسخ الإعدادات السرية للمتصفح. بذلك تُخفى التكاملات المعطلة أو Test غير المسموح بها. إذا تعذرت قراءة المصدر لا نعرض طرقًا قديمة على أنها متاحة.

Preview: استخدم Test keys وTest IDs وWordPress staging؛ المشروع يرفض مفاتيح Live في VERCEL_ENV=preview. Test Paymob مع WordPress production قد ينشئ طلبات اختبار حقيقية داخل متجر الإنتاج، فلا تعتمد هذا كبيئة آمنة. لا تضف مفاتيح Production إلى نطاق Preview/Development.

## ترتيب الرفع

1. احتفظ بنسخة البلاجن النشط والواجهة الحالية وخطة rollback. لا توجد عملية نشر أو تفعيل ضمن هذا التنفيذ.
2. ثبّت [Shams Headless 1.2.0](../wordpress-plugin/shams-headless-1.2.0.zip) في البيئة المقصودة قبل تفعيل Paymob. النسخة تضيف تنسيق الطلبات في قاعدة WordPress؛ الإصدارات 1.1.x لا تكفي لهذا المسار.
3. Vercel: Framework = Next.js، جذر هذا المستودع، تثبيت من lockfile ومدير pnpm المحدد في package.json، Build = pnpm build، Output الافتراضي. استخدم Node المدعوم من المشروع وFluid compute؛ routes الدفع تضبط Node runtime وmaxDuration=180.
4. أضف متغيرات البيئة بأسماء الجدول، ثم أنشئ deployment جديدًا لتطبيقها. لا تعدّل callbacks المشتركة مع Woo الحالي اعتباطيًا.
5. اختبر وصول POST العام إلى `<NEXT_PUBLIC_APP_URL>/api/payments/paymob/webhook`. حماية Preview/Firewall يجب أن تسمح بالـ callback في بيئة اختبار مصرح بها؛ لا تعطل حماية المشروع كله. الطلب غير الموقع يجب أن يرفض.
6. Return URL هو `<NEXT_PUBLIC_APP_URL>/order/success`. النجاح يقرأ Woo المحدث من webhook، ولا يثق بـ success=true في URL.
7. Intention يرسل notification_url وredirection_url. توثيق Paymob يقيّد دعم overrides حسب طريقة الدفع؛ تحقق فعليًا من Bank Installments. إذا لم يحترمها التكامل، اطلب تكاملًا مخصصًا للـ headless بدل استبدال callback الموقع الحالي.

## عرض التقسيط على المنتجات

كارت المنتج يعرض رابط «Explore bank installments»، وصفحة المنتج تعرض شرحًا واضحًا مع رابط قرب السعر على الموبايل. يظهران فقط لمنتج قابل للشراء ومتوافر بسعر موجب، ومع طريقة تقسيط مفعلة في إعداد checkout؛ يختفيان عند تعطيلها/فشل الإعدادات. الكروت والمنتج والدفع يشتركون في query واحدة بكاش دقيقة، والسيرفر يعيد التحقق قبل إنشاء الدفع. لا رقم قسط تقديري ولا ضمان أهلية بطاقة/منتج. أثناء الدفع يحدد Pixel البنك والخطة والرسوم من Paymob.

## سلوك الكود

- SDK مثبت على paymob-pixel 1.2.7 من CDN. الـ bundle يسجل window.Pixel ويستقبل elementId؛ لا named export ولا mount/render API كما افترض التنفيذ السابق.
- أسماء paymentMethods تؤخذ من استجابة Intention للتكاملات المختارة. البنوك والمدد والرسوم يعرضها Pixel من Paymob؛ لا أقساط محسوبة بقسمة السعر ولا وعود «بدون فوائد».
- الهاتف إجباري للجميع. Paymob يطلب اسم العائلة وبريدًا صالحًا؛ يظهران مطلوبين لهذه الطريقة فقط. نقص البيانات يظهر أخطاء عند الضغط ولا يعطل التأكيد مسبقًا.
- إنشاء Intention يتحقق من switches والطريقة والعنوان والسلة قبل أي order write. السعر من Woo ويُقارن بإجمالي السلة؛ اختلافه يوقف الدفع للمراجعة.
- استُبدل الاعتماد على الذاكرة المحلية بclaim دائم عبر `/wp-json/wc/v3/shams-headless/payment-sessions`، محمي بصلاحية manage_woocommerce ومصادقة Woo REST. مفتاحه hash جلسة السلة، وبصمته بيانات الطلب؛ لا بيانات شخصية خام في option.
- `add_option` يحجز claim دون انتهاء تلقائي، ويمنع إعادة إنشاء الطلب عند التزامن/فقد الاستجابة. بعد اكتماله، نفس البصمة تسترجع نفس order/intention ما دام صالحًا. تغيير السلة/الطريقة بعد بدء الدفع لا ينشئ طلبًا ثانيًا صامتًا.
- webhook له mutex مستقل محفوظ في WordPress، ويتحقق من HMAC ومبلغ/عملة/Paymob order ID وintegration المسموح. pending أو authorization وحده لا يعني paid، وrefund/void لا يتحولان إلى دفع ناجح. التكرار لا يضيف ledger جديدًا، وتحديث الحالة والledger في طلب Woo واحد.
- أُصلحت قراءة meta_data والتحقق من مفتاح ملكية الطلب في status API. حد الطلبات المحلي مساعد فقط؛ ليس rate limit موزعًا ولا بديلًا عن claim.

## استعادة الحالات غير المؤكدة

لا تمسح claim أو تعيد محاولة دفع جديدة لمجرد timeout. العامل قد يكون أكمل إنشاء الطلب/Intention قبل انقطاع الرد. افحص Woo وPaymob أولًا وطابق order ID وtransaction؛ لا تسجل مفاتيح أو client_secret في تذكرة/شات.

الحالات running العالقة، انتهاء Intention، أو تعديل سلة مرتبطة بدفع جارٍ تحتاج معالجة تشغيلية؛ لا يوجد زر تلقائي لإنشاء محاولة جديدة ولا job لحذف claims. لا تدّعِ أن التنسيق الحالي مدير شامل لاسترداد كل حالات checkout. قراءة الإيصال المؤكد تنهي جلسة السلة المدفوعة فقط إذا طابقت snapshot الطلب؛ لا تمسح تعديلات من تبويب آخر. إذا اختلفت السلة يحتفظ بها ويحتاج انتقالها لجلسة دفع جديدة مراجعة. دورة تجديد الجلسات واستعادتها تحتاج اختبار staging قبل اعتماد الإطلاق.

إذا انقطع worker أثناء webhook قد يبقى mutex؛ بعد التأكد أنه لا توجد معالجة جارية، يمكن للمشغل المخول مراجعة option `shams_payment_` الصحيح وإتاحة إعادة callback وفق إجراء مراقب. لا حذف جماعي، ولا تغيّر order إلى paid من واجهة النجاح. الدفع/refund/reconciliation اليدوي يحتاج تصريح المالك.

Rollback: عطّل PAYMOB_ENABLED لإيقاف دفعات جديدة، مع إبقاء HMAC والـ webhook وإصداره المتوافق لاستقبال المدفوعات الجارية. لا ترجع نسخة بلاجن لا تدعم التنسيق أثناء وجود محاولات معلقة. احتفظ بالبيانات والأسرار في بيئتها ولا تحذف order metadata/claims تلقائيًا.

## التحقق وحدوده

```bash
pnpm payments:check
pnpm test
pnpm typecheck
pnpm build
php tests/headless-payment-sessions.php
php tests/headless-wishlist-routes.php commerce-ux
```

payments:check للقراءة المحلية فقط ويخرج nonzero عند نقص الإعدادات، ولا يطبع القيم. الفحص المحلي كشف غياب مفاتيح Paymob وغياب أصل HTTPS صالح. قراءة لوحة الحساب وحدها لا تنسخ المفاتيح إلى Vercel.

اختبارات العقد لا تثبت وصول webhook ولا إنشاء/تسعير Woo الحقيقي ولا نجاح Pixel/3DS/التقسيط. قبل Production: اختبار مبلغ/شحن/كوبون/variation، التزامن، فقد الرد، النجاح/الرفض/الإلغاء، callback مكرر/مبكر/متأخر، ملكية الحساب، والسلة بعد الدفع. لا تشغل تجربة شراء على الإنتاج تلقائيًا.

## المصادر

- [Paymob Intention API](https://developers.paymob.com/paymob-docs/intention-apis/create-intention): طرق الدفع وقيود callback overrides.
- [Paymob API flow](https://developers.paymob.com/paymob-docs/integration-paths/apis): Pixel والـ callbacks.
- [SDK README للإصدار المثبت](https://cdn.jsdelivr.net/npm/paymob-pixel@1.2.7/README.md): window.Pixel وelementId والـ callbacks. تمت مراجعة bundle الفعلي أيضًا لدعم bank installments وأسماء الطرق.
- [Vercel environment scopes](https://vercel.com/docs/environment-variables) و[Function duration](https://vercel.com/docs/functions/configuring-functions/duration).

نتائج التحقق المحلية لهذا التحديث: 53 اختبار Node ناجح، وtypecheck وbuild ناجحان؛ 11 ملف PHP ناجح syntax، وfixture تنسيق الدفع وfixture المفضلة بحضور Commerce UX ناجحان. معاينة checkout بطرق وسلة مُحاكاة عند 390/768/1024/1440 دون overflow؛ الضغط والحقول فارغة ركز checkout-firstName مع الهاتف الإجباري. هذه ليست تجربة SDK بحساب فعلي أو عملية دفع. الأدلة في [payments](audit-2026-09-19/payments/).

تمت معاينة تنويه التقسيط على المنتج والكروت المرتبطة في صفحة Canon R50 باستخدام إعداد طرق دفع مُحاكى؛ تحقق DOM من القسم ومن روابط تفاصيل التقسيط. لا تدل اللقطة على تفعيل بوابة الإنتاج.
