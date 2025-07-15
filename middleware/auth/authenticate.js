/**
 * Authentication Middleware
 * نفس المنطق الموجود في التطبيق لكن منظم في middleware
 */

/**
 * Check if user is authenticated
 */
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  
  // إذا كان الطلب AJAX، أرسل JSON response
  if (req.xhr || req.headers.accept.indexOf('json') > -1) {
    return res.status(401).json({ 
      success: false,
      message: "Please log in to access this resource" 
    });
  }
  
  // إذا كان طلب عادي، وجه لصفحة تسجيل الدخول
  return res.redirect("/login");
};

/**
 * Check if user is NOT authenticated (for login/register pages)
 */
const isNotAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    // إذا كان مسجل دخول، وجهه حسب نوع المستخدم
    if (req.session.user.role === "Engineer") {
      return res.redirect(`/profile/${req.session.user.id}`);
    } else if (req.session.user.role === "Admin") {
      return res.redirect("/AdminDashboard");
    } else {
      return res.redirect("/");
    }
  }
  return next();
};

/**
 * Check if user has specific role
 */
const hasRole = (roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    const userRole = req.session.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        success: false,
        message: "Insufficient permissions" 
      });
    }

    return next();
  };
};

/**
 * Check if engineer is approved and verified
 */
const isEngineerVerified = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ 
        success: false,
        message: "Authentication required" 
      });
    }

    if (req.session.user.role !== "Engineer") {
      return next(); // Not an engineer, skip verification check
    }

    const User = require("../../models/userSchema");
    const engineer = await User.findById(req.session.user.id);

    if (!engineer) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    if (!engineer.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Your account is pending admin approval"
      });
    }

    if (!engineer.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email address before accessing this resource"
      });
    }

    return next();
  } catch (error) {
    console.error("Engineer verification error:", error);
    return res.status(500).json({ 
      success: false,
      message: "Error checking verification status" 
    });
  }
};

module.exports = {
  isAuthenticated,
  isNotAuthenticated,
  hasRole,
  isEngineerVerified,
};
