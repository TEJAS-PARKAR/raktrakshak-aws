const express = require("express");
const router = express.Router();

const {
  registerUser,
  getDonorsByBloodGroup,
  getAllDonors,
  updateUser,
  getPendingUsers,
  approveUser
} = require("../controllers/userController");

const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.put("/update", authenticateToken, updateUser);

router.get("/donors", getAllDonors);

router.get("/blood/:group", getDonorsByBloodGroup);

router.get("/pending", authenticateToken, authorizeRoles("admin"), getPendingUsers);

router.put("/:id/approve", authenticateToken, authorizeRoles("admin"), approveUser);

module.exports = router;
