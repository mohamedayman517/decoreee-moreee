# User Routes Structure

هذا المجلد يحتوي على جميع routes المتعلقة بالمستخدمين مقسمة إلى ملفات منفصلة لسهولة الصيانة والتطوير.

## البنية:

```
routes/user/
├── index.js          # الملف الرئيسي الذي يجمع كل user routes
├── registration.js   # تسجيل المستخدمين الجدد
├── login.js          # تسجيل الدخول والجلسات
├── passwordReset.js  # إعادة تعيين كلمة المرور
├── helpers.js        # الدوال المساعدة المشتركة
└── README.md         # هذا الملف
```

## الملفات:

### 1. `index.js`
- الملف الرئيسي الذي يستورد ويجمع كل user routes
- يتم استيراده في `app.js`

### 2. `registration.js`
- `GET /register` - صفحة التسجيل
- `POST /register` - معالجة تسجيل المستخدمين الجدد
- التحقق من صحة البيانات
- رفع الصور وتحويلها لـ base64
- التحقق من عدم تكرار البريد الإلكتروني

### 3. `login.js`
- `GET /login` - صفحة تسجيل الدخول
- `POST /login` - معالجة تسجيل الدخول
- `GET /get-current-user` - جلب بيانات المستخدم الحالي
- التحقق من المصادقة والصلاحيات
- إدارة الجلسات

### 4. `passwordReset.js`
- `GET /forgetPassword` - صفحة نسيان كلمة المرور
- `POST /forgetPassword` - إرسال كود إعادة التعيين
- `GET /verifyCode` - صفحة التحقق من الكود
- `POST /verifyCode` - التحقق من صحة الكود
- `GET /resetPassword` - صفحة إعادة تعيين كلمة المرور
- `POST /resetPassword` - معالجة إعادة تعيين كلمة المرور

### 5. `helpers.js`
- `upload` - إعدادات Multer لرفع الملفات
- `transporter` - إعدادات Nodemailer للبريد الإلكتروني
- `convertToBase64()` - تحويل الملفات لـ base64
- `getMimeType()` - تحديد نوع الملف
- `cleanupTempFile()` - حذف الملفات المؤقتة

## المميزات:

✅ **تنظيم أفضل** - كل وظيفة في ملف منفصل
✅ **فصل المسؤوليات** - تسجيل، دخول، إعادة تعيين كلمة المرور
✅ **دوال مساعدة مشتركة** - تجنب تكرار الكود
✅ **التحقق من صحة البيانات** - validation شامل
✅ **أمان محسن** - تشفير كلمات المرور وإدارة الجلسات

## تدفق العمل:

1. **التسجيل** (`registration.js`)
   - المستخدم يملأ نموذج التسجيل
   - التحقق من صحة البيانات
   - رفع الصور وتحويلها لـ base64
   - حفظ المستخدم في قاعدة البيانات

2. **تسجيل الدخول** (`login.js`)
   - التحقق من البيانات
   - مقارنة كلمة المرور المشفرة
   - إنشاء جلسة للمستخدم
   - توجيه حسب نوع المستخدم

3. **إعادة تعيين كلمة المرور** (`passwordReset.js`)
   - إرسال كود التحقق بالبريد الإلكتروني
   - التحقق من صحة الكود
   - إعادة تعيين كلمة المرور الجديدة

## الأمان:

- تشفير كلمات المرور باستخدام bcrypt
- التحقق من صحة البيانات المدخلة
- حماية من تكرار البريد الإلكتروني
- إدارة آمنة للجلسات
- تنظيف الملفات المؤقتة

## ملاحظات:

- تم الحفاظ على نفس الوظائف بالضبط من الملف الأصلي `userRoutes.js`
- لم يتم تغيير أي منطق أعمال
- تم إنشاء backup من الملف الأصلي: `userRoutes.js.backup`
- جميع الـ routes تعمل بنفس الطريقة السابقة
