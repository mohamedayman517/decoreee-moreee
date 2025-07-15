const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Client = require("../../models/clientSchema");
const User = require("../../models/userSchema");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Ensure uploads directory exists
    const dir = "./uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, "profile-" + Date.now() + path.extname(file.originalname));
  },
});

// Multer upload configuration
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

// Authentication middleware
const isAuthenticated = async (req, res, next) => {
  if (req.session && req.session.user) {
    const userId = req.session.user._id || req.session.user.id;
    let user = await User.findById(userId);
    if (!user) user = await Client.findById(userId);

    if (user) {
      return next();
    } else {
      req.session.destroy(() => {
        return res.redirect("/login?message=Your account has been deleted.");
      });
    }
  } else {
    res.status(401).json({ error: "Unauthorized: Please log in." });
  }
};

module.exports = {
  upload,
  isAuthenticated,
};
