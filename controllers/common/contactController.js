const nodemailer = require("nodemailer");

class ContactController {
  /**
   * Show contact page
   */
  static showContactPage(req, res) {
    const clientUser = req.session.user;
    res.render("contact", { user: clientUser });
  }

  /**
   * Handle contact form submission
   */
  static async submitContactForm(req, res) {
    try {
      const { fullName, email, phone, subject, message } = req.body;
      
      if (!fullName || !email || !phone || !subject || !message) {
        return res.status(400).json({ message: "Please fill all fields" });
      }

      const transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASS,
        },
      });

      const mailOptions = {
        from: email,
        to: process.env.EMAIL,
        subject: `Contact Us : ${subject}`,
        text: `From: ${fullName} ${email}\nPhone: ${
          phone || "Not Provided"
        }\n\nMessage:\n${message}`,
      };

      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  }
}

module.exports = ContactController;
