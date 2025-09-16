const Application = require("../../api/models/applicationModel");

// Hämta alla ansökningar
const getAllApplications = async (req, res) => {
    try {
      const applications = await Application.find({ userId: req.userId });
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ error: "Något gick fel när vi hämtade ansökningarna." });
    }
  };

// Skapa ny ansökan
const createApplication = async (req, res) => {
    try {
      const newApplication = new Application({
        ...req.body,
        userId: req.userId, // Lägg till vem som äger ansökan
      });
      const savedApplication = await newApplication.save();
      res.status(201).json(savedApplication);
    } catch (error) {
      res.status(400).json({ error: "Kunde inte skapa ansökan." });
    }
  };

// Hämta en specifik ansökan
const getApplicationById = async (req, res) => {
    try {
      const application = await Application.findOne({
        _id: req.params.id,
        userId: req.userId,
      });
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
      const updated = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Ansökan att uppdatera hittades inte." });
      }
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: "Kunde inte uppdatera ansökan." });
    }
  };
  const partialUpdateApplication = async (req, res) => {
    try {
      const updated = await Application.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );
  
      if (!updated) {
        return res.status(404).json({ error: "Ansökan att uppdatera hittades inte." });
      }
  
      res.status(200).json(updated);
    } catch (error) {
      res.status(400).json({ error: "Kunde inte delvis uppdatera ansökan." });
    }
  };

// Ta bort en ansökan
const deleteApplication = async (req, res) => {
    try {
      const deleted = await Application.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });
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
  partialUpdateApplication,
};