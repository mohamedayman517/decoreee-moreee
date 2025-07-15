# Customer Routes Structure - Decor & More

تم إعادة هيكلة routes تسجيل العملاء لتحسين التنظيم وسهولة الصيانة.

## البنية الجديدة:

```
routes/customer/
├── index.js          # الملف الرئيسي الذي يجمع كل customer routes
├── register.js       # تسجيل العملاء الجدد
├── helpers.js        # الدوال المساعدة المشتركة
└── README.md         # هذا الملف
```

## الملفات:

### 1. `index.js`
- الملف الرئيسي الذي يستورد ويجمع كل customer routes
- يتم استيراده في `app.js`

### 2. `register.js`
- `GET /registerCustomer` - عرض صفحة تسجيل العملاء
- `POST /registerCustomer` - معالجة تسجيل العميل الجديد
- validation شامل للبيانات المدخلة

### 3. `helpers.js`
- `upload` - إعدادات Multer لرفع الملفات
- تكوين التخزين والفلترة للصور

## المميزات:

### ✅ **تنظيم أفضل:**
- فصل منطق التسجيل عن الدوال المساعدة
- كود أنظف ومنظم
- سهولة الصيانة والتطوير

### ✅ **validation محسن:**
- التحقق من صحة البريد الإلكتروني
- التحقق من قوة كلمة المرور
- التحقق من صحة رقم الهاتف
- التحقق من عدم تكرار البريد الإلكتروني

### ✅ **إدارة الملفات:**
- رفع صور الملف الشخصي بأمان
- تحويل الصور لـ base64 للتخزين
- تنظيف الملفات المؤقتة

## API Endpoints:

### **تسجيل العملاء:**
- `GET /registerCustomer` - صفحة التسجيل
- `POST /registerCustomer` - معالجة التسجيل

## الوظائف الرئيسية:

### **عرض صفحة التسجيل:**
- عرض نموذج التسجيل
- تمرير بيانات المستخدم الحالي (إن وجد)

### **معالجة التسجيل:**
- التحقق من صحة البيانات المدخلة
- التحقق من عدم تكرار البريد الإلكتروني
- تشفير كلمة المرور
- معالجة صورة الملف الشخصي
- إنشاء حساب جديد
- إرسال رد نجاح أو فشل

## Validation Rules:

### **البريد الإلكتروني:**
```javascript
body("email").isEmail().withMessage("Enter a valid email address")
```

### **كلمة المرور:**
```javascript
body("password")
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters")
  .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/)
  .withMessage(
    "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character"
  )
```

### **الاسم:**
```javascript
body("Name")
  .notEmpty()
  .withMessage(" Name is required")
  .matches(/^[A-Za-z ]+$/)
  .withMessage(" Name should contain only letters")
```

### **رقم الهاتف:**
```javascript
body("phone")
  .isMobilePhone(["ar-EG", "en-US", "sa", "ae"], { strictMode: false })
  .withMessage("Enter a valid phone number")
```

### **السيرة الذاتية:**
```javascript
body("bio")
  .optional()
  .isLength({ max: 1000 })
  .withMessage("Bio must be less than 1000 characters")
```

## معالجة الملفات:

### **إعدادات Multer:**
```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});
```

### **تحويل الصور:**
```javascript
// Handle profile photo and convert to Base64
let profilePhotoBase64 = null;
if (req.files && req.files["profilePhoto"]) {
  const profilePhotoFile = req.files["profilePhoto"][0];
  const imageBuffer = fs.readFileSync(profilePhotoFile.path);
  const base64Image = imageBuffer.toString("base64");
  profilePhotoBase64 = `data:${profilePhotoFile.mimetype};base64,${base64Image}`;

  // Delete temp file after conversion
  fs.unlinkSync(profilePhotoFile.path);
}
```

## الأمان والتحقق:

### **التحقق من تكرار البريد:**
```javascript
const existingUser = await User.findOne({ email });
const existingClient = await Client.findOne({ email });

if (existingUser || existingClient) {
  return res.status(400).json({
    success: false,
    message: "هذا البريد الإلكتروني مسجل مسبقاً. يرجى استخدام بريد إلكتروني آخر أو تسجيل الدخول.",
  });
}
```

### **تشفير كلمة المرور:**
```javascript
const hashedPassword = await bcrypt.hash(password, 10);
```

### **إنشاء معرف فريد:**
```javascript
const customId =
  Math.random().toString(36).substring(2, 15) +
  Math.random().toString(36).substring(2, 15);
```

## بيانات العميل:

### **الحقول المطلوبة:**
- `Name` - اسم العميل
- `email` - البريد الإلكتروني
- `password` - كلمة المرور
- `phone` - رقم الهاتف

### **الحقول الاختيارية:**
- `bio` - السيرة الذاتية
- `profilePhoto` - صورة الملف الشخصي

### **الحقول المُولدة تلقائياً:**
- `customId` - معرف فريد للعميل
- `hashedPassword` - كلمة المرور المشفرة
- `profilePhotoBase64` - الصورة بصيغة base64

## الفوائد:

1. **كود أنظف** - فصل منطق التسجيل عن الدوال المساعدة
2. **validation شامل** - التحقق من جميع البيانات المدخلة
3. **أمان أفضل** - تشفير كلمات المرور ومنع التكرار
4. **إدارة ملفات محسنة** - رفع وتحويل الصور بأمان
5. **صيانة أسهل** - كود منظم وسهل التطوير

## ملاحظات:

- ✅ تم الحفاظ على نفس الوظائف بالضبط
- ✅ نفس API endpoints والـ responses
- ✅ تحسين validation والأمان
- ✅ تنظيف الملفات المؤقتة تلقائياً

## الخطوات التالية:

1. إضافة email verification للعملاء
2. تحسين error handling والرسائل
3. إضافة social login options
4. تحسين UI/UX لصفحة التسجيل
5. إضافة customer profile management
