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
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const token = jwt.sign(
        { id: existingUser._id, role: existingUser.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("token", token, {
        ...getCookieOptions(),
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.clearCookie("googleProfile", getCookieOptions());
      res.redirect(`${process.env.CLIENT_URL}/login-success`);
      return;
    }

    // Set cookie with profile data for profile completion
    res.clearCookie("token", getCookieOptions());

    res.cookie("googleProfile", JSON.stringify(profile), {
      ...getCookieOptions(),
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    // Redirect to register for profile completion
    res.redirect(`${process.env.CLIENT_URL}/register`);
  }
);

// Server-side route to resolve user from cookie token
router.get("/me", async (req, res) => {
  const token = req.cookies?.token;
  const googleProfile = req.cookies?.googleProfile;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-__v");

      if (!user) {
        if (googleProfile) {
          const profile = JSON.parse(googleProfile);
          return res.json({
            success: true,
            profile: {
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              isProfileComplete: false
            }
          });
        }

        return res.status(404).json({ success: false, message: "User not found" });
      }

      res.json({ success: true, user });
    } catch (err) {
      if (googleProfile) {
        try {
          const profile = JSON.parse(googleProfile);
          return res.json({
            success: true,
            profile: {
              name: profile.displayName,
              email: profile.emails?.[0]?.value,
              isProfileComplete: false
            }
          });
        } catch (parseError) {
          return res.status(400).json({ success: false, message: "Invalid profile data" });
        }
      }

      res.status(401).json({ success: false, message: "Invalid token" });
    }
  } else {
    if (googleProfile) {
      try {
        const profile = JSON.parse(googleProfile);
        res.json({
          success: true,
          profile: {
            name: profile.displayName,
            email: profile.emails?.[0]?.value,
            isProfileComplete: false
          }
        });
      } catch (err) {
        res.status(400).json({ success: false, message: "Invalid profile data" });
      }
    } else {
      res.status(401).json({ success: false, message: "Not authenticated" });
    }
  }
});

// Logout route to clear cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token", getCookieOptions());
  res.clearCookie("googleProfile", getCookieOptions());
  res.json({ success: true, message: "Logged out" });
});

module.exports = router;
