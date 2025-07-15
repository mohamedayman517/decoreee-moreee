const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Joi = require("joi");

// إعداد multer للتخزين المؤقت
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // التأكد من وجود المجلد
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir); // مكان مؤقت للتخزين
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // حد أقصى 5 ميجابايت
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

// Rating validation schema
const ratingSchema = Joi.object({
  engineerId: Joi.string().required(),
  name: Joi.string().trim().required(),
  rating: Joi.number().min(1).max(5).required(),
  comment: Joi.string().trim().required(),
});

// Helper function to convert file to base64
function convertToBase64(filePath, mimeType) {
  try {
    const fileData = fs.readFileSync(filePath);
    const base64String = fileData.toString("base64");
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting file to base64:", error);
    return null;
  }
}

// Helper function to clean up temporary files
function cleanupTempFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Cleaned up temporary file: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error cleaning up file ${filePath}:`, error);
  }
}

// Helper function to check if user is verified
function checkUserVerification(user) {
  if (user && user.role === "Engineer" && !user.isVerified) {
    return {
      isVerified: false,
      message: "Please verify your email address before accessing your profile. Check your email for the verification code."
    };
  }
  return { isVerified: true };
}

module.exports = {
  upload,
  ratingSchema,
  convertToBase64,
  cleanupTempFile,
  checkUserVerification,
};
