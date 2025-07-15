const User = require("../../models/userSchema");
const transporter = require("../../utils/emailTransporter");

class EngineerController {
  /**
   * Delete Engineer - نفس المنطق من routes/admin/engineers.js
   */
  static async deleteEngineer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== "Admin") {
        return res.status(403).send("Access denied. Admins only.");
      }
      
      const engineerId = req.params.id;

      // Delete all projects related to the engineer
      await require("../../models/projectSchema").deleteMany({ engID: engineerId });
      // Delete all packages related to the engineer
      await require("../../models/packageSchema").deleteMany({ engID: engineerId });
      // Delete the engineer
      const deletedEngineer = await User.findByIdAndDelete(engineerId);
      
      if (!deletedEngineer) {
        return res.status(404).send("Engineer not found.");
      }

      res.json({ message: "Engineer deleted successfully." });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting engineer.");
    }
  }

  /**
   * Approve Engineer
   */
  static async approveEngineer(req, res) {
    try {
      const { email } = req.body;
      console.log("Approving engineer with email:", email);

      // Generate a 6-digit verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      console.log("Generated verification code:", verificationCode);

      // Update engineer status and save verification code
      const engineer = await User.findOneAndUpdate(
        { email, role: "Engineer" },
        {
          isApproved: true,
          verificationCode,
          verificationCodeExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
        { new: true }
      );

      if (!engineer) {
        console.log("Engineer not found with email:", email);
        return res.status(404).json({ message: "Engineer not found" });
      }

      console.log("Engineer approved successfully:", engineer.firstName);

      // Create verification link
      const verificationLink = `${process.env.BASE_URL || "http://localhost:3000"}/verify?engineerId=${engineer._id}`;

      // Send verification email with link
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: "Engineer Account Activation",
        html: `
          <h2>Welcome to Decor And More!</h2>
          <p>Your engineer account has been approved by the admin.</p>
          <p>Please click the link below to verify your account:</p>
          <a href="${verificationLink}" style="
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          ">Verify Account</a>
          <p>Or use this verification code: <strong>${verificationCode}</strong></p>
          <p>This link and code will expire in 24 hours.</p>
          <p>After verification, you can login to your account.</p>
          <p>Best regards,<br>Decor And More Team</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Verification email sent successfully");

      res.json({ message: "Engineer approved and verification email sent" });
    } catch (error) {
      console.error("Error approving engineer:", error);
      res.status(500).json({ message: "Error approving engineer" });
    }
  }

  /**
   * Get pending engineers
   */
  static async getPendingEngineers(req, res) {
    try {
      const pendingEngineers = await User.find({
        role: "Engineer",
        isApproved: false,
      }).select("firstName lastName email phone idCardPhoto hasPaidSubscription");

      console.log("Found pending engineers:", pendingEngineers.length);
      res.json(pendingEngineers);
    } catch (error) {
      console.error("Error fetching pending engineers:", error);
      res.status(500).json({ message: "Error fetching pending engineers" });
    }
  }

  /**
   * Reject Engineer
   */
  static async rejectEngineer(req, res) {
    try {
      if (!req.session.user || req.session.user.role !== "Admin") {
        return res.status(403).json({ message: "غير مسموح لك بالوصول" });
      }

      const { email } = req.body;
      const engineer = await User.findOne({ email, role: "Engineer" });

      if (!engineer) {
        return res.status(404).json({ message: "لم يتم العثور على المهندس." });
      }

      // Delete engineer from database
      await User.deleteOne({ email });

      res.json({ message: "تم رفض المهندس بنجاح وحذفه من القائمة." });
    } catch (error) {
      console.error("❌ خطأ أثناء رفض المهندس:", error);
      res.status(500).json({ message: "حدث خطأ أثناء رفض المهندس." });
    }
  }
}

module.exports = EngineerController;
