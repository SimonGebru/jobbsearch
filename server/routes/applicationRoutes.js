const express = require("express");
const router = express.Router();
const {
  getAllApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

// Hämta alla ansökningar
router.get("/", getAllApplications);

// Skapa ny ansökan
router.post("/", createApplication);

// Hämta en specifik ansökan
router.get("/:id", getApplicationById);

// Uppdatera en ansökan
router.put("/:id", updateApplication);

// Ta bort en ansökan
router.delete("/:id", deleteApplication);

module.exports = router;