const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
  partialUpdateApplication,
} = require("../controllers/applicationController");

const requireAuth = require("../middleware/auth");

// 🛡 Lägg till detta för att skydda ALLA routes
router.use(requireAuth);

// Routes (nu skyddade)
router.get("/", getAllApplications);
router.post("/", createApplication);
router.get("/:id", getApplicationById);
router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);
router.patch("/:id", partialUpdateApplication);

module.exports = router;
