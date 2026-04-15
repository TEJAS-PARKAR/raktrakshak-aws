const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  patientName: {
    type: String,
    required: true
  },

  bloodGroup: {
    type: String,
    required: true
  },

  hospital: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  contact: {
    type: String,
    required: true
  },

  unitsRequired: {
    type: Number,
    default: 1,
    min: 1
  },

  status: {
    type: String,
    enum: ["pending", "fulfilled", "cancelled"],
    default: "pending"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Request", requestSchema);
