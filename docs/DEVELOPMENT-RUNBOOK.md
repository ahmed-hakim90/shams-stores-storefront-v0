> الحالة المعتمدة الأحدث: [تسليم Qoder](QODER-HANDOFF-2026-09-19.md). الأقسام التاريخية لا تعني أن الدفع ما زال مغلقًا أو أن 1.2.0 صالح للتثبيت. استخدم Headless 1.2.1 وCommerce UX 0.8.3 للحقول الجديدة.

> تصحيح تفعيل 19 سبتمبر: استخدم [Shams Headless 1.2.1](../wordpress-plugin/shams-headless-1.2.1.zip)، وليس 1.2.0. عولج تكرار `Shams_Auth::register()`؛ [السبب والفحوص](../wordpress-plugin/shams-headless-1.2.1-release.md). ادعاء نجاح syntax للإصدار السابق كان غير صحيح بسبب exit code مضلل من PHP-WASM.

# التشغيل والتحقق والإصدار

> تحديث الدفع والتقسيط: [PAYMOB-VERCEL](PAYMOB-VERCEL.md). Paymob الجديد يتطلب Shams Headless 1.2.1؛ إشارات 1.1.1 أدناه تخص إصدار المفضلة السابق.

## بداية آمنة

نفّذ من جذر مستودع headless، ثم اقرأ diff الخاص بالمنطقة التي ستعمل عليها:

```bash
git status --short
git branch --show-current
git diff --stat
```

لا تنظف working tree ولا تعمل checkout/reset لملفات المالك. اقرأ package.json والـ lockfile. استخدم pnpm المثبت في packageManager، ولا تضف dependency لمجرد توثيق أو تعديل بسيط.

الإعدادات موثقة مبدئيًا في [ENV_SETUP](../ENV_SETUP.md)، لكن المصدر الحالي هو المرجع للسلوك. أسماء مهمة: COMMERCE_PROVIDER، WOOCOMMERCE_API_URL، WOOCOMMERCE_API_KEY، WOOCOMMERCE_API_SECRET، WOOCOMMERCE_CURRENCY، SHAMS_CONTENT_API_ENABLED، COMMERCE_CHECKOUT_ENABLED، COMMERCE_VERIFIED_PAYMENT_METHODS. راجع ملفات `lib/payments/paymob/` عند العمل على الدفع؛ لا تفعّل checkout أو وسائل الدفع افتراضيًا.

لا تطبع `.env.local` أو `.qoder/settings.local.json`، ولا تنقل أسرارًا إلى NEXT_PUBLIC أو docs. لا تغيّر إعدادات البيئة تلقائيًا. mock هو الوضع الافتراضي؛ تأكد من الوضع قبل تفسير نتائج الاختبار.

## أوامر التحقق

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm commerce:check
node scripts/check-shams-content.mjs
git diff --check
```

- scripts الحالية لا تتضمن lint؛ لا تدّعِ تشغيل `pnpm lint` بنجاح.
- tests تستخدم Node type stripping، وسكربت المحتوى يستخدم process.loadEnvFile؛ استخدم Node يدعم APIs الفعلية.
- commerce:check للكتالوج وبالقراءة فقط. جملته القديمة «Checkout is not connected.» ليست فحصًا لحالة checkout الحالية.
- check-shams-content يفحص GET modules/site-content/catalog terms ويطبع حالة HTTP والمفاتيح العامة؛ لا يثبت كل العقود أو الحساب أو الدفع.
- قبل تشغيل dev افحص السيرفر الموجود لتجنب تشغيل نسخة ثانية؛ استخدم `pnpm dev` عند الحاجة. build قد يغيّر next-env.d.ts؛ راجع الفرق ولا ترجع تغييرات المالك.

آخر تحقق مسجل يوم 19 سبتمبر: 38 اختبار Node، typecheck وbuild، وفحص syntax لعشرة ملفات PHP وroute fixtures بالحالتين. هذه نتائج تاريخية وليست نتائج إعادة تشغيل بعد تعديل جديد. تحذير middleware/proxy كان موجودًا؛ لا تدخل migration غير مطلوبة لإخفائه.

## تحقق المتصفح

اختبر التغيير في 390 و768 و1024 و1440 بكسل، لوحة المفاتيح وfocus والتحميل والفشل والفراغ. قارِن [الأدلة المحلية](audit-2026-09-19/implemented/) دون اعتبارها اختبارًا للنسخة التي عدّلتها الآن.

للمنتج: السعر/المخزون مع variation، شارات false/null، الإكسسوارات وملاحظاتها، الصور الفاشلة والنص العربي. للحملات: الصورة الصحيحة وCTA والفشل والتنقل. للدفع: زر التأكيد مع حقول ناقصة، تركيز أول خطأ، الهاتف الإجباري، تحديث الشحن، النتيجة غير المؤكدة. لا تنشئ طلبًا أو تدفع على الإنتاج أثناء QA؛ الاختبار الكامل يحتاج staging وتصريحًا وبيانات اختبار معتمدة.

الحساب والمفضلة الموثقة تحتاج اختبار عميل staging؛ لم يجرَ اعتمادها end-to-end. لا تعتبر نجاح route fixture بديلًا عنه.

## بلاجن Shams Headless

المصدر: `wordpress-plugin/shams-headless/`. افحصه قبل إعادة الحزمة. بوجود PHP محلي:

```bash
find wordpress-plugin/shams-headless -name '*.php' -exec php -l {} \;
php tests/headless-wishlist-routes.php
php tests/headless-wishlist-routes.php commerce-ux
```

التحقق السابق استخدم PHP-WASM لغياب PHP محلي. يمكن استخدامه إن كان متاحًا؛ لا تثبّت runtime جديدًا أو تعتمد على مسار cache لجهاز سابق دون حاجة. سجّل الطريقة والنتيجة الفعلية.

الحزمة الحالية [1.1.1 ZIP](../wordpress-plugin/shams-headless-1.1.1.zip) ومعها [release notes/checksum](../wordpress-plugin/shams-headless-1.1.1-release.md). لأي إصدار لاحق: عدّل المصدر، ونسّق version/header/readme، وافحص PHP والـ fixtures، ثم أنشئ ZIP من مجلد البلاجن فقط بجذر `shams-headless/`. لا تضم env أو caches أو الحزمة القديمة. افحص محتويات ZIP واختبار سلامته ثم احسب SHA-256 وحدّث release notes. لا تستبدل artifact إصدار قديم بتغييرات غير مسماة.

## بوابة الإطلاق والرجوع

1. لا تنشر دون تصريح صريح وتحديد البيئة. README يقول إن merge إلى main ينشر تلقائيًا؛ تحقق من الربط قبل push/merge.
2. احفظ النسخة النشطة من البلاجن ونسخة frontend القابلة للرجوع، وسجّل النسخ الفعلية دون بيانات حساسة.
3. تأكد من Commerce UX 0.8.0 وعقوده، وثبّت Shams Headless 1.1.1 قبل واجهة wishlist الجديدة.
4. نفّذ QA staging للحساب والمفضلة وcheckout والدفع والويبهوك قبل اعتماد الإطلاق.
5. عند rollback للمحتوى فقط يمكن تعطيل SHAMS_CONTENT_API_ENABLED. عند rollback المفضلة أرجع frontend والبلاجن المتوافق معًا؛ لا تحذف storage.

## تحديث التسليم

أي تغيير عقد/سلوك يستلزم تحديث [API-INTEGRATION](API-INTEGRATION.md) أو [START-HERE](START-HERE.md). أضف نتيجة التحقق وتاريخها وحدودها. لا تغيّر التقرير التاريخي ليبدو كأن فحوصًا جديدة جرت. docs-only يحتاج مراجعة الروابط وdiff، ولا يستلزم ادعاء إعادة اختبارات التطبيق.

## Reducing origin load during UI development

For visual-only work use the existing fixture mode: `COMMERCE_PROVIDER=mock pnpm dev`. Check for an existing dev server first; do not start a second copy. This is a design preview, not live API verification. Keep payment settings and secrets unchanged.

Offline load contracts: `node --experimental-strip-types --test tests/catalog-load.test.mjs tests/shams-content.test.mjs`. These check comparison/bundle request counts, selective homepage reads, editorial TTLs and no-store protection for tokenized carts and mutations. They do not measure production latency or CPU. After an authorized release, compare the same pages and traffic volume in Cloudways with a warm cache; do not load-test production.

Performance change validation (2026-09-19): 50 Node tests passed; typecheck passed; production build passed with COMMERCE_PROVIDER=mock and SHAMS_CONTENT_API_ENABLED=false (existing middleware deprecation warning). Local production preview loaded with no console errors and no document horizontal overflow at 390/768/1024/1440 widths. This preview uses existing mock fixtures and does not validate live content rendering, upstream latency or production CPU. No deployment, production write, or WordPress plugin change was made.

Follow-up live verification: see [performance evidence](HEADLESS-PERFORMANCE-2026-09-19.md). The existing live dev server was on port 3100; check all Next listeners/lock diagnostics rather than assuming 3000. Live homepage, comparison and a product page were verified without changing production data. Observed warm-cache times are not production before/after benchmarks.
