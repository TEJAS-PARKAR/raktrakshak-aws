const express = require("express");

const {
  createInventoryRecord,
  getRecipientInventory
} = require("../controllers/inventoryController");
const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticateToken, authorizeRoles("recipient"));

router.get("/my", getRecipientInventory);
router.post("/", createInventoryRecord);

module.exports = router;
