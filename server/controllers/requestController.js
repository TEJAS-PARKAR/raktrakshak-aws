const Request = require("../models/Request");

exports.createRequest = async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      recipient: req.user?._id
    };

    const request = new Request(requestData);

    await request.save();

    res.status(201).json({
      success: true,
      message: "Blood request created successfully",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error creating request",
      error: error.message
    });

  }
};

exports.getAllRequests = async (req, res) => {

  try {

    const requests = await Request.find().populate("recipient", "name institutionName email");

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching requests",
      error: error.message
    });

  }

};

exports.getRecipientRequests = async (req, res) => {
  try {
    const requests = await Request.find({ recipient: req.user._id }).sort({
      createdAt: -1
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recipient requests",
      error: error.message
    });
  }
};

exports.updateRecipientRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "fulfilled", "cancelled"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status"
      });
    }

    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Request status updated successfully",
      request
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating request status",
      error: error.message
    });
  }
};

exports.updateRequestStatus = async (req, res) => {

  try {

    const request = await Request.findByIdAndUpdate(
      req.params.id,
      { status: "fulfilled" },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Request marked as fulfilled",
      request
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error updating request",
      error: error.message
    });

  }

};
