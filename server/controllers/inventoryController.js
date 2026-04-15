const InventoryRecord = require("../models/InventoryRecord");
const User = require("../models/User");

exports.createInventoryRecord = async (req, res) => {
  try {
    const { donorName, bloodGroup, units, donationDate, notes } = req.body;

    const record = await InventoryRecord.create({
      recipient: req.user._id,
      donorName,
      bloodGroup,
      units,
      donationDate,
      notes
    });

    res.status(201).json({
      success: true,
      message: "Donation record added successfully",
      record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating inventory record",
      error: error.message
    });
  }
};

exports.getRecipientInventory = async (req, res) => {
  try {
    const records = await InventoryRecord.find({ recipient: req.user._id }).sort({
      donationDate: -1,
      createdAt: -1
    });

    const groupedInventory = records.reduce((summary, record) => {
      summary[record.bloodGroup] = (summary[record.bloodGroup] || 0) + record.units;
      return summary;
    }, {});

    const donorCounts = await User.aggregate([
      {
        $match: {
          role: "donor",
          $or: [
            { applicationStatus: "approved" },
            { applicationStatus: { $exists: false } }
          ]
        }
      },
      { $group: { _id: "$bloodGroup", donors: { $sum: 1 } } }
    ]);

    const availability = Object.entries(groupedInventory)
      .map(([bloodGroup, totalUnits]) => ({
        bloodGroup,
        totalUnits,
        donorMatches: donorCounts.find((entry) => entry._id === bloodGroup)?.donors || 0,
        status: totalUnits > 0 ? "Available" : "Low"
      }))
      .sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));

    res.status(200).json({
      success: true,
      records,
      availability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recipient inventory",
      error: error.message
    });
  }
};
