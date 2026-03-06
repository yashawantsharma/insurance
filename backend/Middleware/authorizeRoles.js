// middlewares/authorizeRoles.js

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    try {
     
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized — user not found"
        });
      }

    
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "Access denied — insufficient permissions"
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error in role authorization",
        error: error.message
      });
    }
  };
};

module.exports = authorizeRoles;