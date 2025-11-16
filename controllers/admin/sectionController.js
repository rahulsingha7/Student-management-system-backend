const Section = require("../../models/admin/Section");
const Session = require("../../models/admin/Session");
const Semester = require("../../models/admin/Semester");

// Create a new section
exports.createSection = async (req, res) => {
  const { section, semesterId, sessionId } = req.body;

  try {
    // Ensure session and semester exist
    const semester = await Semester.findById(semesterId);
    const session = await Session.findById(sessionId);
    if (!semester || !session) {
      return res.status(400).json({ message: "Invalid session or semester." });
    }

    // Check for duplicate section within the same session and semester
    const existingSection = await Section.findOne({
      section,
      semester: semesterId,
      session: sessionId,
    });
    if (existingSection) {
      return res.status(400).json({
        message: "Section already exists for this semester and session!",
      });
    }

    const newSection = new Section({
      section,
      semester: semesterId,
      session: sessionId,
    });
    await newSection.save();
    res
      .status(201)
      .json({ message: "Section created successfully!", section: newSection });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// In your controller file (e.g., sectionController.js)
exports.getSectionById = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id).populate(
      "semester session",
      "semester name"
    );
    if (!section) {
      return res.status(404).json({ message: "Section not found!" });
    }
    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getSections = async (req, res) => {
  try {
    const { sessionId = "", search = "" } = req.query;

    // Build query filters
    const filters = {};
    if (sessionId) filters.session = sessionId;
    if (search) filters.section = { $regex: search, $options: "i" };

    // Fetch sections with filtering and populate related fields
    const sections = await Section.find(filters).populate(
      "semester session",
      "semester name"
    );
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a section
exports.updateSection = async (req, res) => {
  const { section, semesterId, sessionId } = req.body;

  try {
    const updatedSection = await Section.findByIdAndUpdate(
      req.params.id,
      { section, semester: semesterId, session: sessionId },
      { new: true }
    ).populate("semester session", "semester name");

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found!" });
    }
    res.status(200).json({
      message: "Section updated successfully!",
      section: updatedSection,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a section
exports.deleteSection = async (req, res) => {
  try {
    const deletedSection = await Section.findByIdAndDelete(req.params.id);
    if (!deletedSection) {
      return res.status(404).json({ message: "Section not found!" });
    }
    res.status(200).json({ message: "Section deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
