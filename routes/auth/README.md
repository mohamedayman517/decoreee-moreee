# Auth Routes Structure

هذا المجلد يحتوي على جميع routes المتعلقة بالمصادقة (Authentication) مقسمة إلى ملفات منفصلة لسهولة الصيانة والتطوير.

## البنية:

```
routes/auth/
├── index.js          # الملف الرئيسي الذي يجمع كل auth routes
├── login.js          # routes تسجيل الدخول والخروج
├── register.js       # routes التسجيل
├── verification.js   # routes التحقق من الحساب
├── payment.js        # routes الدفع والاشتراكات
├── webhooks.js       # Stripe webhooks
└── README.md         # هذا الملف
```

## الملفات:

### 1. `index.js`
- الملف الرئيسي الذي يستورد ويجمع كل auth routes
- يتم استيراده في `app.js`

### 2. `login.js`
- `POST /login` - تسجيل الدخول
- `GET /login` - صفحة تسجيل الدخول
- `POST /logout` - تسجيل الخروج

### 3. `register.js`
- `POST /register` - تسجيل حساب جديد
- `GET /register` - صفحة التسجيل

### 4. `verification.js`
- `POST /verify-account` - التحقق من الحساب بالكود
- `GET /verify` - صفحة التحقق

### 5. `payment.js`
- `GET /payment-policy` - صفحة سياسة الدفع
- `GET /payment-engineer` - صفحة دفع المهندس
- `POST /create-payment-intent` - إنشاء payment intent
- `POST /payment-engineer` - معالجة دفع الاشتراك
- `POST /cancel-registration` - إلغاء التسجيل

### 6. `webhooks.js`
- `POST /stripe-webhook` - معالجة Stripe webhooks

## المميزات:

✅ **تنظيم أفضل** - كل وظيفة في ملف منفصل
✅ **سهولة الصيانة** - تعديل جزء واحد دون تأثير على الباقي
✅ **قابلية القراءة** - ملفات أصغر وأكثر تركيز
✅ **إعادة الاستخدام** - يمكن استخدام الملفات في مشاريع أخرى
✅ **اختبار أسهل** - اختبار كل وحدة منفصلة

## ملاحظات:

- تم الحفاظ على نفس الوظائف بالضبط من الملف الأصلي `authRoutes.js`
- لم يتم تغيير أي منطق أعمال
- تم إنشاء backup من الملف الأصلي: `authRoutes.js.backup`
- جميع الـ routes تعمل بنفس الطريقة السابقة
