# Middleware Structure - Decor & More

تم إنشاء Middleware منظم لتحسين الأمان والتحقق من صحة البيانات.

## البنية الجديدة:

```
middleware/
├── auth/
│   ├── authenticate.js         # المصادقة والتحقق من الصلاحيات
│   └── authorize.js           # التحقق من الأدوار والصلاحيات
│
├── validation/
│   ├── authValidation.js      # التحقق من بيانات المصادقة
│   └── bookingValidation.js   # التحقق من بيانات الحجز
│
├── upload/
│   ├── imageUpload.js         # رفع الصور (قريباً)
│   └── fileValidation.js      # التحقق من الملفات (قريباً)
│
├── common/
│   ├── rateLimiter.js         # تحديد معدل الطلبات (قريباً)
│   ├── errorHandler.js        # معالجة الأخطاء (قريباً)
│   └── requestLogger.js       # تسجيل الطلبات (قريباً)
│
├── auth.js                    # Middleware أصلي (موجود)
└── README.md                  # هذا الملف
```

## Middleware المكتملة:

### 1. `auth/authenticate.js`

```javascript
// التحقق من تسجيل الدخول
const isAuthenticated = (req, res, next);

// التحقق من عدم تسجيل الدخول (للـ login/register pages)
const isNotAuthenticated = (req, res, next);

// التحقق من الأدوار المحددة
const hasRole = (roles) => (req, res, next);

// التحقق من تأكيد المهندس للبريد الإلكتروني
const isEngineerVerified = async(req, res, next);
```

### 2. `auth/authorize.js`

```javascript
// التحقق من دور Admin
const isAdmin = (req, res, next);

// التحقق من دور Engineer
const isEngineer = (req, res, next);

// التحقق من دور Client
const isClient = (req, res, next);

// التحقق من أي من الأدوار المحددة
const hasAnyRole = (roles) => (req, res, next);

// التحقق من المهندس المؤكد
const isVerifiedEngineer = async(req, res, next);
```

### 3. `validation/authValidation.js`

```javascript
// التحقق من بيانات تسجيل الدخول
const validateLogin = [...]

// التحقق من بيانات التسجيل
const validateRegistration = [...]

// التحقق من إعادة تعيين كلمة المرور
const validatePasswordReset = [...]

// التحقق من البريد الإلكتروني
const validateEmail = [...]

// التحقق من كود التحقق
const validateVerificationCode = [...]
```

### 4. `validation/bookingValidation.js`

```javascript
// التحقق من بيانات الحجز
const validateBooking = [...]

// التحقق من بيانات الدفع
const validatePayment = [...]

// التحقق من بيانات التقييم
const validateReview = [...]
```

## المميزات:

### ✅ **أمان محسن:**

- التحقق من المصادقة قبل الوصول للـ endpoints
- التحقق من الأدوار والصلاحيات
- حماية من الطلبات غير المصرح بها

### ✅ **التحقق من صحة البيانات:**

- validation شامل للبيانات المدخلة
- رسائل خطأ واضحة ومفيدة
- منع البيانات الخاطئة من الوصول للـ controllers

### ✅ **إعادة الاستخدام:**

- نفس الـ middleware في routes متعددة
- تجنب تكرار كود التحقق

### ✅ **تنظيم أفضل:**

- كل نوع middleware في مجلد منفصل
- سهولة العثور على الـ middleware المطلوب

## مثال للاستخدام:

### قبل (بدون middleware):

```javascript
router.post("/login", async (req, res) => {
  // التحقق من البيانات يدوياً
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({...});
  }
  // باقي المنطق...
});
```

### بعد (مع middleware):

```javascript
router.post(
  "/login",
  validateLogin, // التحقق من البيانات
  LoginController.login // معالجة الطلب
);
```

## أمثلة الاستخدام:

### 1. حماية الـ routes:

```javascript
// يتطلب تسجيل دخول
router.get("/profile", isAuthenticated, showProfile);

// يتطلب دور Admin
router.get("/admin", hasRole("Admin"), showAdminPanel);

// يتطلب مهندس مؤكد
router.post("/create-package", isEngineerVerified, createPackage);
```

### 2. التحقق من البيانات:

```javascript
// تسجيل دخول مع validation
router.post("/login", validateLogin, LoginController.login);

// تسجيل مع validation شامل
router.post("/register", validateRegistration, RegisterController.register);
```

### 3. صفحات تسجيل الدخول:

```javascript
// منع المستخدمين المسجلين من الوصول لصفحة تسجيل الدخول
router.get("/login", isNotAuthenticated, showLoginPage);
```

## الفوائد:

1. **أمان أفضل** - حماية شاملة للـ endpoints
2. **كود أنظف** - فصل منطق التحقق عن منطق الأعمال
3. **إعادة استخدام** - نفس الـ middleware في أماكن متعددة
4. **صيانة أسهل** - تعديل منطق التحقق في مكان واحد
5. **أخطاء أقل** - validation موحد ومختبر

## ملاحظات:

- ✅ تم الحفاظ على نفس الوظائف بالضبط
- ✅ تم تحسين الأمان والتحقق
- ✅ جميع الـ endpoints تعمل بنفس الطريقة
- ✅ رسائل خطأ واضحة ومفيدة

## الخطوات التالية:

1. إكمال باقي validation middleware
2. إضافة rate limiting
3. تحسين error handling
4. إضافة request logging
5. إنشاء file upload middleware
