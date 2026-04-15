const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  bloodGroup: {
    type: String,
    required: function requiredBloodGroup() {
      return this.role === "donor";
    }
  },

  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },

  state: {
    type: String
  },

  district: {
    type: String
  },

  city: {
    type: String,
    required: function requiredCity() {
      return this.role === "donor" || this.role === "recipient";
    }
  },

  role: {
    type: String,
    enum: ["donor", "recipient", "admin"],
    default: "donor"
  },

  applicationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: function defaultApplicationStatus() {
      return this.role === "admin" ? "approved" : "pending";
    }
  },

  approvedAt: {
    type: Date
  },

  institutionName: {
    type: String
  },

  isProfileComplete: {
    type: Boolean,
    default: false
  }}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
