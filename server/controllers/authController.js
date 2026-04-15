const User = require("../models/User");

exports.loginUser = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: "Please use Google OAuth login via /api/auth/google"
  });
};