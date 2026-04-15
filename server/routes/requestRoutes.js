const express = require("express");
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  getRecipientRequests,
  updateRecipientRequestStatus,
  updateRequestStatus
} = require("../controllers/requestController");
const {
  authenticateToken,
  authorizeRoles
} = require("../middleware/authMiddleware");

router.post("/", authenticateToken, authorizeRoles("recipient"), createRequest);

router.get("/", getAllRequests);
router.get("/my", authenticateToken, authorizeRoles("recipient"), getRecipientRequests);
router.put("/my/:id", authenticateToken, authorizeRoles("recipient"), updateRecipientRequestStatus);

router.put("/:id", authenticateToken, authorizeRoles("admin"), updateRequestStatus);

module.exports = router;
