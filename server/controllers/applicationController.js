const Application = require("../models/applicationModel");

// Hämta alla ansökningar
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find();
    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ error: "Något gick fel när vi hämtade ansökningarna." });
  }
};

// Skapa ny ansökan
const createApplication = async (req, res) => {
  try {
    const newApplication = new Application(req.body);
    const savedApplication = await newApplication.save();
    res.status(201).json(savedApplication);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte skapa ansökan." });
  }
};

// Hämta en specifik ansökan
const getApplicationById = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: "Ansökan hittades inte." });
    }
    res.status(200).json(application);
  } catch (error) {
    res.status(500).json({ error: "Kunde inte hämta ansökan." });
  }
};

// Uppdatera en ansökan
const updateApplication = async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) {
      return res.status(404).json({ error: "Ansökan att uppdatera hittades inte." });
    }
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: "Kunde inte uppdatera ansökan." });
  }
};

// Ta bort en ansökan
const deleteApplication = async (req, res) => {
  try {
    const deleted = await Application.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Ansökan att ta bort hittades inte." });
    }
    res.status(200).json({ message: "Ansökan borttagen." });
  } catch (error) {
    res.status(500).json({ error: "Kunde inte ta bort ansökan." });
  }
};

module.exports = {
  getAllApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
};