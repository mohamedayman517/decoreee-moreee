# Project Routes Structure - Decor & More

تم إعادة هيكلة routes المشاريع لتحسين التنظيم وسهولة الصيانة.

## البنية الجديدة:

```
routes/project/
├── index.js          # الملف الرئيسي الذي يجمع كل project routes
├── create.js         # إنشاء المشاريع
├── manage.js         # إدارة المشاريع (تحديث، حذف)
├── view.js           # عرض المشاريع
├── helpers.js        # الدوال المساعدة المشتركة
└── README.md         # هذا الملف
```

## الملفات:

### 1. `index.js`
- الملف الرئيسي الذي يستورد ويجمع كل project routes
- يتم استيراده في `app.js`

### 2. `create.js`
- `POST /create` - إنشاء مشروع جديد
- رفع صور المشاريع وتحويلها لـ base64
- validation للبيانات المدخلة

### 3. `manage.js`
- `PUT /:id` - تحديث مشروع
- `DELETE /:id` - حذف مشروع
- إدارة صور المشاريع

### 4. `view.js`
- `GET /:id` - جلب مشروع محدد
- عرض تفاصيل المشروع

### 5. `helpers.js`
- `upload` - إعدادات Multer لرفع الملفات
- تكوين التخزين والفلترة

## المميزات:

### ✅ **تنظيم أفضل:**
- فصل عمليات الإنشاء عن الإدارة والعرض
- كل ملف متخصص في وظيفة محددة
- كود أنظف وأكثر تركيز

### ✅ **validation محسن:**
- التحقق من صحة البيانات المدخلة
- التحقق من أنواع الملفات المرفوعة
- رسائل خطأ واضحة ومفيدة

### ✅ **إدارة الملفات:**
- رفع صور المشاريع بأمان
- تحويل الصور لـ base64 للتخزين
- تنظيف الملفات المؤقتة

## API Endpoints:

### **إنشاء المشاريع:**
- `POST /create` - إنشاء مشروع جديد

### **إدارة المشاريع:**
- `PUT /:id` - تحديث مشروع
- `DELETE /:id` - حذف مشروع

### **عرض المشاريع:**
- `GET /:id` - جلب مشروع محدد

## الوظائف الرئيسية:

### **إنشاء المشاريع:**
- إدخال اسم المشروع ونوعه
- تحديد المساحة والسعر
- رفع صورة المشروع
- التحقق من صحة البيانات
- تحويل الصورة لـ base64

### **تحديث المشاريع:**
- تعديل بيانات المشروع
- تحديث صورة المشروع (اختياري)
- validation للبيانات الجديدة
- حفظ التغييرات

### **حذف المشاريع:**
- حذف المشروع من قاعدة البيانات
- تنظيف البيانات المرتبطة

### **عرض المشاريع:**
- جلب تفاصيل المشروع
- عرض الصورة والبيانات

## مثال للاستخدام:

### قبل (في ملف واحد):
```javascript
// projectRoutes.js (158 سطر)
router.post("/create", upload.single("projectImage"), async (req, res) => {
  // منطق إنشاء المشروع
});

router.put("/:id", upload.single("projectImage"), async (req, res) => {
  // منطق تحديث المشروع
});

router.delete("/:id", async (req, res) => {
  // منطق حذف المشروع
});
```

### بعد (منظم في ملفات):
```javascript
// create.js
router.post("/create", upload.single("projectImage"), async (req, res) => {
  // منطق الإنشاء فقط
});

// manage.js
router.put("/:id", upload.single("projectImage"), async (req, res) => {
  // منطق الإدارة فقط
});
```

## بيانات المشروع:

### **الحقول المطلوبة:**
- `projectName` - اسم المشروع
- `projectType` - نوع المشروع
- `projectArea` - مساحة المشروع (رقم)
- `projectPrice` - سعر المشروع (رقم)
- `projectImage` - صورة المشروع (ملف)

### **التحقق من البيانات:**
```javascript
// التحقق من وجود جميع الحقول
if (!projectName || !projectType || !projectArea || !projectPrice || !req.file) {
  return res.status(400).json({ 
    success: false, 
    message: "All fields are required." 
  });
}

// التحقق من صحة المساحة والسعر
const area = parseFloat(projectArea);
const price = parseFloat(projectPrice);

if (isNaN(area) || area <= 0) {
  return res.status(400).json({ 
    success: false, 
    message: "Invalid project area." 
  });
}
```

## إدارة الملفات:

### **إعدادات Multer:**
```javascript
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ 
  storage,
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
// تحويل الصورة لـ base64
const imageBuffer = fs.readFileSync(req.file.path);
const base64Image = imageBuffer.toString("base64");
const imageData = `data:${req.file.mimetype};base64,${base64Image}`;

// تنظيف الملف المؤقت
fs.unlinkSync(req.file.path);
```

## الفوائد:

1. **كود أنظف** - كل ملف متخصص في وظيفة واحدة
2. **صيانة أسهل** - تعديل منطق الإنشاء أو الإدارة منفصل
3. **أمان أفضل** - validation وفلترة الملفات
4. **تطوير أسرع** - فرق متعددة تعمل على أجزاء مختلفة
5. **إدارة أفضل** - تنظيف الملفات المؤقتة تلقائياً

## ملاحظات:

- ✅ تم الحفاظ على نفس الوظائف بالضبط
- ✅ نفس API endpoints والـ responses
- ✅ تحسين validation والأمان
- ✅ تنظيف الملفات المؤقتة تلقائياً

## الخطوات التالية:

1. إضافة project categories وtags
2. تحسين project search وfiltering
3. إضافة project reviews وratings
4. تحسين project analytics للمهندسين
5. إضافة project templates
