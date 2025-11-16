const Subject = require("../../models/admin/Subject");
const Semester = require("../../models/admin/Semester");
const Session = require("../../models/admin/Session");

// Create a new subject
exports.createSubject = async (req, res) => {
  const { courseCode, courseTitle, semesterId, sessionId } = req.body;

  try {
    // Check if semester and session exist
    const semester = await Semester.findById(semesterId);
    const session = await Session.findById(sessionId);

    if (!semester || !session) {
      return res.status(400).json({ message: "Invalid semester or session." });
    }

    // Check if a subject with the same title already exists for the semester and session
    const existingSubject = await Subject.findOne({
      courseCode,
      courseTitle,
      semester: semesterId,
      session: sessionId,
    });
    if (existingSubject) {
      return res.status(400).json({
        message:
          "Course code or title already exists for this semester and session!",
      });
    }

    const newSubject = new Subject({
      courseCode,
      courseTitle,
      semester: semesterId,
      session: sessionId,
    });

    await newSubject.save();
    res
      .status(201)
      .json({ message: "Subject created successfully!", subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subjects
exports.getSubjects = async (req, res) => {
  try {
    const { sessionId = "", search = "" } = req.query;

    // Build query filters
    const filters = {};
    if (sessionId) filters.session = sessionId;
    if (search) {
      filters.$or = [
        { courseCode: { $regex: search, $options: "i" } },
        { courseTitle: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch subjects with filtering and populate related fields
    const subjects = await Subject.find(filters)
      .populate("semester", "semester")
      .populate("session", "name");
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a subject by ID
exports.getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id)
      .populate("semester", "semester")
      .populate("session", "name");

    if (!subject) {
      return res.status(404).json({ message: "Subject not found!" });
    }
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a subject
exports.updateSubject = async (req, res) => {
  const { courseCode, courseTitle, semesterId, sessionId } = req.body;

  try {
    // Validate semester and session existence
    const semester = await Semester.findById(semesterId);
    const session = await Session.findById(sessionId);

    if (!semester || !session) {
      return res.status(400).json({ message: "Invalid semester or session." });
    }

    // Check for duplicate course title within the same semester and session
    const existingSubject = await Subject.findOne({
        courseCode,
      courseTitle,
      semester: semesterId,
      session: sessionId,
      _id: { $ne: req.params.id }, // Exclude the subject being updated
    });

    if (existingSubject) {
      return res.status(400).json({
        message: "Course code or title already exists for this semester and session!",
      });
    }

    const updatedSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      { courseCode, courseTitle, semester: semesterId, session: sessionId },
      { new: true }
    )
      .populate("semester", "semester")
      .populate("session", "name");

    if (!updatedSubject) {
      return res.status(404).json({ message: "Subject not found!" });
    }

    res.status(200).json({
      message: "Subject updated successfully!",
      subject: updatedSubject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a subject
exports.deleteSubject = async (req, res) => {
  try {
    const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
    if (!deletedSubject) {
      return res.status(404).json({ message: "Subject not found!" });
    }
    res.status(200).json({ message: "Subject deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
