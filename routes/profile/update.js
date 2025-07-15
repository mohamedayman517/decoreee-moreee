const express = require("express");
const router = express.Router();
const User = require("../../models/userSchema");
const { upload, convertToBase64, cleanupTempFile, checkUserVerification } = require("./helpers");

// Update profile route
router.post(
  "/updateProfile",
  upload.single("profilePhoto"),
  async (req, res) => {
    try {
      if (!req.session.user) {
        return res
          .status(401)
          .json({ success: false, error: "User not logged in" });
      }

      // التحقق من أن المهندس قد قام بتأكيد البريد الإلكتروني قبل تحديث البروفايل
      const userId = req.session.user.id;
      const currentUser = await User.findById(userId);

      const verificationCheck = checkUserVerification(currentUser);
      if (!verificationCheck.isVerified) {
        return res.status(403).json({
          success: false,
          error: verificationCheck.message,
        });
      }

      const { firstName, lastName, bio } = req.body;
      const updateData = { firstName, lastName, bio };

      // تحويل الصورة إلى Base64 إذا تم تحميلها
      if (req.file) {
        updateData.profilePhoto = convertToBase64(req.file.path, req.file.mimetype);
        cleanupTempFile(req.file.path);
      }

      const updateUser = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).lean();

      if (!updateUser) {
        return res
          .status(404)
          .json({ success: false, error: "User not found" });
      }

      // Update session with new user data
      req.session.user = {
        id: updateUser._id,
        email: updateUser.email,
        role: updateUser.role,
        name: `${updateUser.firstName} ${updateUser.lastName}`,
      };

      // استخدام الصورة مباشرة من قاعدة البيانات
      const userWithPhoto = {
        ...updateUser,
      };

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          firstName: userWithPhoto.firstName,
          lastName: userWithPhoto.lastName,
          bio: userWithPhoto.bio,
          profilePhoto: userWithPhoto.profilePhoto,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        error: "Error updating profile",
      });
    }
  }
);

module.exports = router;
