const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/"
});

const router = express.Router();

const { loginUser } = require("../controllers/authController");

// existing login route (keep it)
router.post("/login", loginUser);

// ✅ Google OAuth - Step 1 (redirect)
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// ✅ Google OAuth - Step 2 (callback)
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const { profile } = req.user;
    const email = profile.emails?.[0]?.value?.toLowerCase();

    if (!email) {
      const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
      return res.redirect(`${clientUrl}/login`);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Pass token in URL to avoid cross-domain cookie issues between CloudFront and Amplify
      const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
      res.redirect(`${clientUrl}/login-success?token=${token}`);
      return;
    }

    // New user - encode basic profile info in URL for registration page
    const profileData = Buffer.from(JSON.stringify({
      name: profile.displayName,
      email: profile.emails?.[0]?.value,
    })).toString("base64");

    const clientUrl = process.env.CLIENT_URL.replace(/\/$/, "");
    res.redirect(`${clientUrl}/register?googleProfile=${profileData}`);
  }
);

// Resolve user from Authorization Bearer token or cookie
router.get("/me", async (req, res) => {
  // Accept token from Authorization header (production) or cookie (local dev)
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : req.cookies?.token);

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-__v");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Logout route to clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", getCookieOptions());
  res.clearCookie("googleProfile", getCookieOptions());
  res.json({ success: true, message: "Logged out" });
});

module.exports = router;
