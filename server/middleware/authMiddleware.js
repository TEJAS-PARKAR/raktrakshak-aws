const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
  // Accept token from Authorization Bearer header (production) or cookie (local dev)
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  next();
};

module.exports = { authenticateToken, authorizeRoles };
