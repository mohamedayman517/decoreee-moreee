/**
 * Authorization middleware for role-based access control
 */

/**
 * Check if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.user.role !== "Admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

/**
 * Check if user has engineer role
 */
const isEngineer = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.user.role !== "Engineer") {
    return res.status(403).json({ error: "Engineer access required" });
  }

  next();
};

/**
 * Check if user has client role
 */
const isClient = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.user.role !== "Client") {
    return res.status(403).json({ error: "Client access required" });
  }

  next();
};

/**
 * Check if user has any of the specified roles
 */
const hasAnyRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ 
        error: `Access denied. Required roles: ${roles.join(", ")}` 
      });
    }

    next();
  };
};

/**
 * Check if engineer is verified
 */
const isVerifiedEngineer = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (req.session.user.role !== "Engineer") {
    return res.status(403).json({ error: "Engineer access required" });
  }

  try {
    const User = require("../../models/userSchema");
    const engineer = await User.findById(req.session.user.id);
    
    if (!engineer) {
      return res.status(404).json({ error: "Engineer not found" });
    }

    if (!engineer.isVerified) {
      return res.status(403).json({ 
        error: "Email verification required",
        redirectTo: `/verify?engineerId=${engineer._id}`
      });
    }

    if (!engineer.isApproved) {
      return res.status(403).json({ 
        error: "Account approval pending" 
      });
    }

    next();
  } catch (error) {
    console.error("Error checking engineer verification:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  isAdmin,
  isEngineer,
  isClient,
  hasAnyRole,
  isVerifiedEngineer,
};
