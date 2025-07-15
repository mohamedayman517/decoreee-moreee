const multer = require("multer");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Setup multer storage (مؤقت فقط)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "../../uploads/");
    console.log(`✅ Upload directory path: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.log(`⚠️ Upload directory does not exist, creating it now...`);
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created upload directory: ${dir}`);
    } else {
      console.log(`✅ Upload directory exists: ${dir}`);
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + path.extname(file.originalname);
    console.log(`✅ Generated filename for upload: ${filename}`);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

// Helper function to convert file to base64
function convertToBase64(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64String = fileBuffer.toString("base64");
    const mimeType = getMimeType(filePath);
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error("Error converting file to base64:", error);
    return null;
  }
}

// Helper function to get MIME type
function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
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

module.exports = {
  upload,
  transporter,
  convertToBase64,
  getMimeType,
  cleanupTempFile,
};
