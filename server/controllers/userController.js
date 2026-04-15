const User = require("../models/User");

const getGoogleProfileEmail = (req) => {
  try {
    const googleProfile = req.cookies?.googleProfile;
    if (!googleProfile) {
      return "";
    }

    const profile = JSON.parse(googleProfile);
    return profile.emails?.[0]?.value?.toLowerCase() || "";
  } catch (error) {
    return "";
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, bloodGroup, phone, state, city, institutionName, role } = req.body;
    const verifiedEmail = (email || getGoogleProfileEmail(req) || "").toLowerCase();
    const normalizedPhone = (phone || "").trim();

    if (!verifiedEmail) {
      return res.status(400).json({
        success: false,
        message: "Google verified email not found. Please sign in with Google again."
      });
    }

    const userData = {
      name: role === "recipient" ? institutionName : name,
      email: verifiedEmail,
      bloodGroup: role === "donor" ? bloodGroup : undefined,
      phone: normalizedPhone,
      state,
      city,
      institutionName: role === "recipient" ? institutionName : undefined,
      role: role || "donor",
      isProfileComplete: true,
      applicationStatus: role === "admin" ? "approved" : "pending",
      approvedAt: role === "admin" ? new Date() : undefined
    };

    const existingUserByEmail = await User.findOne({ email: verifiedEmail });
    if (existingUserByEmail) {
      if (existingUserByEmail.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "This Google account is already registered as admin."
        });
      }

      const phoneOwner = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: existingUserByEmail._id }
      });

      if (phoneOwner) {
        return res.status(400).json({
          success: false,
          message: "This phone number is already used by another account."
        });
      }

      Object.assign(existingUserByEmail, userData);
      await existingUserByEmail.save();

      res.clearCookie("googleProfile");

      return res.status(200).json({
        success: true,
        message: "Registration details updated successfully. Please wait up to 24 hours for admin approval.",
        user: existingUserByEmail
      });
    }

    const existingUserByPhone = await User.findOne({ phone: normalizedPhone });
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already used by another account."
      });
    }

    const user = new User(userData);

    await user.save();

    // Clear googleProfile cookie
    res.clearCookie("googleProfile");

    res.status(201).json({
      success: true,
      message: "Registration submitted successfully. Please wait up to 24 hours for admin approval.",
      user
    });

  } catch (error) {
    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0];
      const fieldLabel = duplicateField === "phone" ? "phone number" : duplicateField || "value";

      return res.status(400).json({
        success: false,
        message: `This ${fieldLabel} is already used by another account.`,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Registration error",
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, bloodGroup, phone, state, city, institutionName, role } = req.body;
    const userId = req.user.id; // assuming auth middleware sets req.user
    const verifiedEmail = (email || req.user.email || "").toLowerCase();
    const normalizedPhone = (phone || "").trim();

    const phoneOwner = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: userId }
    });

    if (phoneOwner) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already used by another account."
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name: role === "recipient" ? institutionName : name,
        email: verifiedEmail,
        bloodGroup: role === "donor" ? bloodGroup : undefined,
        phone: normalizedPhone,
        state,
        city,
        institutionName: role === "recipient" ? institutionName : undefined,
        role,
        isProfileComplete: true,
        applicationStatus: role === "admin" ? "approved" : "pending",
        approvedAt: role === "admin" ? new Date() : undefined
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already used by another account.",
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Error updating user",
      error: error.message
    });
  }
};

exports.getDonorsByBloodGroup = async (req, res) => {
  try {

    const bloodGroup = req.params.group;

    const donors = await User.find({
      bloodGroup: bloodGroup,
      role: "donor",
      $or: [
        { applicationStatus: "approved" },
        { applicationStatus: { $exists: false } }
      ]
    });

    res.status(200).json({
      success: true,
      count: donors.length,
      donors
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching donors",
      error: error.message
    });

  }
};

exports.getAllDonors = async (req, res) => {

  try {

    const donors = await User.find({
      role: "donor",
      $or: [
        { applicationStatus: "approved" },
        { applicationStatus: { $exists: false } }
      ]
    });

    res.status(200).json({
      success: true,
      count: donors.length,
      donors
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching donors",
      error: error.message
    });

  }

};

exports.getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["donor", "recipient"] },
      applicationStatus: "pending"
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching pending registrations",
      error: error.message
    });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        applicationStatus: "approved",
        approvedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User approved successfully",
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving user",
      error: error.message
    });
  }
};
