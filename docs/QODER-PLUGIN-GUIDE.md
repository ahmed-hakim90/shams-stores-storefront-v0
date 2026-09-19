# دليل Qoder لتطوير وبناء بلاجن شمس

المقصود هنا **إضافة WordPress بصيغة PHP/ZIP**، وليس Plugin لـ Codex أو Qoder. لا تثبّت إضافة جديدة لو الميزة لها مالك قائم. اقرأ AGENTS.md في المستودع المعني وwordpress/AGENTS.md قبل تعديل مصدر WordPress.

## اختر المالك الصحيح

| المطلوب | المصدر الصحيح |
| --- | --- |
| REST للمحتوى والضمان والوكيل والإكسسوارات والحسابات العامة | WordPress repo: `wordpress/shams-commerce-ux/` |
| حقول الضمان/الوكيل الخاصة بالكارت | `wordpress/shams-product-cards/`؛ لا تنشئ حقولًا ثانية بنفس المعنى |
| auth/customer/wishlist/payment coordination | Headless repo: `wordpress-plugin/shams-headless/` |
| واجهة headless/Copy/Pixel/تطبيع API | Headless repo: `components/`, `lib/`, `app/api/` |
| header/search/cart drawer في WordPress | `wordpress/shams-global-shell/`؛ لا تنقل CSS إلى Next |

Commerce UX وHeadless بلاجان مختلفان ولا يستبدل أحدهما الآخر. ملفات ZIP مخرجات فقط؛ لا تعدّلها يدويًا. تغيير البلاجن لا ينشر تلقائيًا على WordPress، ونشر Vercel لا يرفعه (wordpress-plugin مستبعد عبر .vercelignore).

## دورة التنفيذ

1. افحص git status وdiff ثم ابحث بـ rg عن الحقول/hooks/classes/routes والمستهلكين والنسخ. حافظ على تغييرات المالك، ومنها submodules الحالية.
2. عرّف عقد الإدخال/الإخراج: الأنواع، null/empty، permissions، حدود العدد، fallback عند غياب Woo/plugin، cache. التغيير الإضافي أفضل من كسر العقد.
3. استخدم WordPress/Woo APIs. اقرأ إعداد المصدر القائم بدل تكراره. اسماء classes/options/meta/hooks/namespace تحمل prefix شمس.
4. التحقق من المدخلات قبل الكتابة؛ sanitize عند الإدخال وescape عند العرض. REST read العام يكشف فقط محتوى المتجر المنشور. routes الإدارة تعتمد capabilities وauth؛ mutations تتطلب auth وnonce عندما تُستخدم cookies. لا __return_true لمسار خاص.
5. لا تكشف env أو مفاتيح البوابات أو خيارات WordPress كاملة. `bank_transfer` مثال whitelist من حقول تحويل عامة فقط. product endpoints لا تكشف draft/hidden/password-protected.
6. سجّل hooks بعد تحميل المتطلبات. class_exists/function_exists للمالكين الاختياريين، وfallback آمن. لا تضف دالتين بنفس الاسم (سبب fatal السابق)، ولا تستخدم activation لإعادة كتابة بيانات المالك.
7. اختبر العقد في المصدر وواجهة المستهلك معًا. غياب إضافة/بيانات/مصادقة يجب ألا يكسر الكتالوج أو يخلق mock data في live.
8. حدّث النسخة في header/constant/readme/docs/tests التي تؤكدها، واكتب changelog. لا تغيّر ZIP قديم.
9. ابنِ archive بجذر واحد باسم مجلد البلاجن وافحصه واحسب SHA-256. قدّمه مع تعليمات الترقية والرجوع؛ التفعيل يحتاج تصريح البيئة.

## لو لا يوجد مالك مناسب فعلًا

أنشئ مجلدًا واحدًا باسم واضح مثل `shams-feature-name/`، وملفًا رئيسيًا `shams-feature-name.php` يحتوي Plugin Name/Version/Requires PHP/Text Domain. ابدأ بحارس `defined('ABSPATH') || exit;`، prefix فريد، وملف includes صغير لكل مسؤولية. لا تحمل ملفات قبل التأكد من وجودها، ولا تضف framework أو dependency لميزة بسيطة. سجّل REST في rest_api_init مع permission_callback وschema arguments صريحة. أنشئ readme، fixture bootstrap، واختبارات صلاحيات وسلوك. لا تنشئ plugin جديدًا لميزة الحسابات أو الضمان؛ لها مالك موثق بالفعل.

## التحقق — Headless plugin

من `/Users/hakimo/Developer/shams-stores-storefront-v0`:

```bash
pnpm test
pnpm typecheck
python3 scripts/check-headless.py php
```

لو php غير موجود (كما كان في هذه الجلسة)، استخدم مسار runtime موثوق موجود محليًا:

```bash
python3 scripts/check-headless.py node /Users/hakimo/.npm/_npx/f23594bf48318276/node_modules/@php-wasm/cli/php-wasm.js
```

المسار بيئي وقد يختفي؛ افحص وجوده ولا تدّعِ نجاح lint إذا لم يُنفذ. السكربت يفحص syntax وbootstrap/payment coordination. شغّل fixture المفضلة أيضًا عند تغييرها. وجود exit code=0 وحده لا يكفي مع PHP-WASM؛ افحص marker النجاح وغياب Fatal/Parse error.

بعد رفع version إلى إصدار جديد:

```bash
python3 scripts/package-headless.py
```

تنبيه: السكربت الحالي يكتب archive بوضع overwrite. **لا تشغله بعد تغيير المصدر بنفس رقم إصدار موجود.** غيّر الإصدار أولًا، أو تحقق أن إعادة البناء مطابقة لنفس المصدر. لا تستبدل ZIP سلّمه المالك بالفعل.

## التحقق — Commerce UX

من `/Users/hakimo/Documents/ChatGPT/Shams Stores`:

```bash
node --test tests/wordpress-content-api.test.mjs
PHP_WASM_CLI=/Users/hakimo/.npm/_npx/f23594bf48318276/node_modules/@php-wasm/cli/php-wasm.js node --test tests/wordpress-*.test.mjs
```

الأمر الأول قد يعمل skip إذا لا PHP؛ هذا ليس نجاحًا لتنفيذ PHP. افحص عدد skipped واستخدم الأمر الثاني. افحص كل PHP بالمفسر الفعلي أو PHP-WASM مع marker، واختبر bootstrap عند تغييرات أسماء/تحميل classes. PHP-WASM لا يغني عن توافق بيئة staging الحقيقية.

لإنشاء ZIP **جديد** بعد تحديث النسخة (مثال ديناميكي يقرأ header ولا يكتب فوق قديم):

```python
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib, re
source = Path('wordpress/shams-commerce-ux')
main = (source / 'shams-commerce-ux.php').read_text()
version = re.search(r'Version:\s*([0-9.]+)', main).group(1)
output = Path(f'shams-commerce-ux-{version}.zip')
with ZipFile(output, 'x', ZIP_DEFLATED) as archive:
    for file in sorted(source.rglob('*')):
        if not file.is_file() or any(p.startswith('.') for p in file.relative_to(source).parts):
            continue
        if file.suffix in {'.zip', '.log', '.map'} or any(p in {'node_modules', 'tests', 'cache'} for p in file.relative_to(source).parts):
            continue
        archive.write(file, file.relative_to(source.parent))
with ZipFile(output) as archive:
    assert archive.testzip() is None
    assert all(name.startswith('shams-commerce-ux/') for name in archive.namelist())
print(output, hashlib.sha256(output.read_bytes()).hexdigest())
```

راجع قائمة الملفات قبل التسليم؛ مثال البناء لا يحل محل مراجعة الأسرار أو الملفات غير اللازمة. لا تنقل env أو fixtures أو screenshots إلى الحزمة.

## الحزم الجاهزة في هذه الجلسة

| الحزمة | مكانها | SHA-256 | الحالة |
| --- | --- | --- | --- |
| Headless 1.2.1 | Headless repo: `wordpress-plugin/shams-headless-1.2.1.zip` | `9e5d2b43d6a439f3e12ca53c87f04b3137f66c6900382b8e816e4c3aed80034c` | المالك أكد التفعيل؛ routes ظهرت |
| Commerce UX 0.8.3 | WP repo: `shams-commerce-ux-0.8.3.zip` | `700d4e686a5f903809caad495620bcf37160fda400d86e9def36b02ec95c13d0` | جاهز، لم يفعّله الوكيل |
| Commerce UX 0.8.2 | WP repo: `shams-commerce-ux-0.8.2.zip` | `34d82ea279464b0fbcfd2519c7986b204e3d94429f4b8e07025fe097b2518f0e` | تاريخي؛ 0.8.3 يشمله ويضيف الحسابات |

لا تستخدم Shams Headless 1.2.0: فيه fatal تكرار method. لا تفترض أن ZIP غير مرقّم أو باسم وقت هو أحدث artifact؛ طابق header/checksum مع المصدر.

## الترقية والرجوع

- قبل تثبيت WordPress: clone/backup ملفات وقاعدة البيانات، نسخة البلاجن النشط، restore path وbaseline للكتالوج/checkout وفق تعليمات WordPress. لا تفعّل staging guard على الإنتاج ولا تعدل callbacks المشتركة عشوائيًا.
- اختبر staging، ثم عند تصريح الإنتاج ارفع ZIP الصحيح كترقية لنفس البلاجن، لا نسخة ثانية باسم مختلف.
- تأكد من الإصدار وREST index وresponses. للحسابات: طابق إعداد Woo مع النص المعروض والنسخ. للضمان: اختبر النص مع checkbox off، empty، Arabic، طويلة، الكروت والبحث.
- الرجوع عن Commerce UX 0.8.3 إلى النسخة السابقة لا يحتاج migration؛ الواجهة ستخفي custom labels غير المتاحة وتعرض unavailable للحسابات. احتفظ ببيانات الخيارات.
- للدفع: تعطيل PAYMOB_ENABLED يمنع دفعات جديدة بعد إعادة النشر، لكن اترك webhook/HMAC والبلاجن المتوافق لمعالجة المدفوعات الجارية. لا ترجع بلاجن payment coordination مع وجود محاولات معلقة.
- Vercel project الصحيح `shams-stores-storefront-v0` ضمن team `ahmed-hakim-90`. الحساب الافتراضي للـCLI كان فريقًا آخر؛ تحقق قبل الأمر. استخدم تسجيل الدخول المخوّل، ولا توثق token أو تعتمد على مجلد auth مؤقت كضمان دائم.
- يمكن deploy --prod --skip-domain ثم inspect ثم promote بعد نجاح الفحص. كل نشر يحتاج تصريح وتسجيل deployment/rollback وحدود التحقق. لا commit/push/merge تلقائيًا؛ main قد ينشر.

## الحد الأدنى للتسليم

اسم البلاجن/الإصدار، المصدر، ZIP/checksum، الفروق، الـAPI والمستهلك، الفحوص الفعلية/skips، المحلي مقابل الإنتاج، خطوات الترقية والرجوع، وأي خطر أو blocker قائم. حدّث [تسليم Qoder](QODER-HANDOFF-2026-09-19.md) و[سجل المشاكل](QODER-ISSUES.md) بدل إضافة ادعاءات متضاربة فوق تقارير قديمة.
